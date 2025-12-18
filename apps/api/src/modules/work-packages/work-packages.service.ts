import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWorkPackageDto, UpdateWorkPackageDto, InspectPackageDto } from './dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class WorkPackagesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateWorkPackageDto, userId?: string) {
    const packageNumber = await this.generatePackageNumber();

    const { operation_ids, ...data } = dto;

    const workPackage = await this.prisma.field_work_packages.create({
      data: {
        package_number: packageNumber,
        ...data,
        agreed_amount: dto.agreed_amount ? new Prisma.Decimal(dto.agreed_amount) : null,
        created_by: userId,
      },
    });

    // إضافة العمليات للحزمة
    if (operation_ids && operation_ids.length > 0) {
      await this.prisma.field_work_package_items.createMany({
        data: operation_ids.map((opId, index) => ({
          package_id: workPackage.id,
          operation_id: opId,
          sequence_order: index + 1,
        })),
      });
    }

    return this.findOne(workPackage.id);
  }

  async findAll(status?: string, teamId?: string) {
    const where: any = {};
    if (status) where.status = status;
    if (teamId) where.assigned_team_id = teamId;

    return this.prisma.field_work_packages.findMany({
      where,
      include: {
        team: true,
        items: true,
        _count: { select: { items: true } },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async findOne(id: string) {
    const pkg = await this.prisma.field_work_packages.findUnique({
      where: { id },
      include: {
        team: true,
        items: true,
        photos: true,
      },
    });

    if (!pkg) {
      throw new NotFoundException('حزمة العمل غير موجودة');
    }

    return pkg;
  }

  async update(id: string, dto: UpdateWorkPackageDto) {
    await this.findOne(id);

    const { operation_ids, ...data } = dto;

    const updateData: any = { ...data };
    if (dto.agreed_amount) {
      updateData.agreed_amount = new Prisma.Decimal(dto.agreed_amount);
    }

    return this.prisma.field_work_packages.update({
      where: { id },
      data: updateData,
      include: { team: true, items: true },
    });
  }

  async remove(id: string) {
    const pkg = await this.findOne(id);

    if (pkg.status !== 'new') {
      throw new BadRequestException('لا يمكن حذف حزمة تم البدء بها');
    }

    return this.prisma.field_work_packages.delete({ where: { id } });
  }

  // ==================== إدارة الحالة ====================

  async assign(id: string, teamId: string, userId?: string) {
    const pkg = await this.findOne(id);

    if (pkg.status !== 'new') {
      throw new BadRequestException('لا يمكن تعيين حزمة تم تعيينها مسبقاً');
    }

    return this.prisma.field_work_packages.update({
      where: { id },
      data: {
        assigned_team_id: teamId,
        status: 'assigned',
        assigned_at: new Date(),
      },
    });
  }

  async start(id: string) {
    const pkg = await this.findOne(id);

    if (pkg.status !== 'assigned') {
      throw new BadRequestException('لا يمكن بدء حزمة غير معينة');
    }

    return this.prisma.field_work_packages.update({
      where: { id },
      data: {
        status: 'in_progress',
        started_at: new Date(),
      },
    });
  }

  async complete(id: string) {
    const pkg = await this.findOne(id);

    if (pkg.status !== 'in_progress') {
      throw new BadRequestException('لا يمكن إكمال حزمة غير قيد التنفيذ');
    }

    return this.prisma.field_work_packages.update({
      where: { id },
      data: {
        status: 'completed_by_team',
        completed_at: new Date(),
      },
    });
  }

  async submitForInspection(id: string) {
    const pkg = await this.findOne(id);

    if (pkg.status !== 'completed_by_team') {
      throw new BadRequestException('لا يمكن تقديم حزمة غير مكتملة للفحص');
    }

    return this.prisma.field_work_packages.update({
      where: { id },
      data: { status: 'under_inspection' },
    });
  }

  async inspect(id: string, dto: InspectPackageDto, inspectorId?: string) {
    const pkg = await this.findOne(id);

    if (pkg.status !== 'under_inspection') {
      throw new BadRequestException('الحزمة ليست تحت الفحص');
    }

    const updateData: any = {
      inspected_at: new Date(),
      inspection_notes: dto.notes,
    };

    if (dto.result === 'approved') {
      updateData.status = 'approved';
      updateData.approved_at = new Date();

      // حساب المبلغ النهائي
      const itemsCount = await this.prisma.field_work_package_items.count({
        where: { package_id: id },
      });
      // يمكن إضافة منطق حساب أكثر تعقيداً هنا
    } else {
      updateData.status = 'rejected';
      updateData.rejection_reason = dto.rejection_reason;
    }

    return this.prisma.field_work_packages.update({
      where: { id },
      data: updateData,
    });
  }

  // ==================== إدارة العناصر ====================

  async addItem(packageId: string, operationId: string) {
    const pkg = await this.findOne(packageId);

    if (pkg.status !== 'new') {
      throw new BadRequestException('لا يمكن إضافة عناصر لحزمة تم البدء بها');
    }

    const maxOrder = await this.prisma.field_work_package_items.aggregate({
      where: { package_id: packageId },
      _max: { sequence_order: true },
    });

    return this.prisma.field_work_package_items.create({
      data: {
        package_id: packageId,
        operation_id: operationId,
        sequence_order: (maxOrder._max.sequence_order || 0) + 1,
      },
    });
  }

  async removeItem(packageId: string, itemId: string) {
    const pkg = await this.findOne(packageId);

    if (pkg.status !== 'new') {
      throw new BadRequestException('لا يمكن إزالة عناصر من حزمة تم البدء بها');
    }

    return this.prisma.field_work_package_items.delete({
      where: { id: itemId },
    });
  }

  // ==================== Helper Methods ====================

  private async generatePackageNumber(): Promise<string> {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');

    const count = await this.prisma.field_work_packages.count({
      where: {
        package_number: {
          startsWith: `PKG-${year}${month}`,
        },
      },
    });

    const sequence = (count + 1).toString().padStart(4, '0');
    return `PKG-${year}${month}-${sequence}`;
  }
}
