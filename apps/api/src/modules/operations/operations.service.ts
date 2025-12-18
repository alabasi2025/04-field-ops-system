import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOperationDto, UpdateOperationDto, QueryOperationDto, OperationStatus } from './dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class OperationsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * إنشاء عملية جديدة
   */
  async create(dto: CreateOperationDto, userId?: string) {
    // توليد رقم العملية
    const operationNumber = await this.generateOperationNumber(dto.operation_type);

    const operation = await this.prisma.field_operations.create({
      data: {
        operation_number: operationNumber,
        operation_type: dto.operation_type as any,
        title: dto.title,
        description: dto.description,
        priority: dto.priority || 2,
        customer_id: dto.customer_id,
        meter_id: dto.meter_id,
        asset_id: dto.asset_id,
        station_id: dto.station_id,
        address: dto.address,
        latitude: dto.latitude ? new Prisma.Decimal(dto.latitude) : null,
        longitude: dto.longitude ? new Prisma.Decimal(dto.longitude) : null,
        assigned_team_id: dto.assigned_team_id,
        assigned_worker_id: dto.assigned_worker_id,
        scheduled_date: dto.scheduled_date ? new Date(dto.scheduled_date) : null,
        estimated_cost: dto.estimated_cost ? new Prisma.Decimal(dto.estimated_cost) : null,
        notes: dto.notes,
        created_by: userId,
        status: 'draft' as any,
      },
      include: {
        team: true,
        worker: true,
      },
    });

    // تسجيل الحالة الأولى
    await this.logStatusChange(operation.id, null, 'draft', userId);

    return operation;
  }

  /**
   * البحث عن العمليات مع الفلترة والترقيم
   */
  async findAll(query: QueryOperationDto) {
    const { page = 1, limit = 10, operation_type, status, team_id, worker_id, customer_id, start_date, end_date, search } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.field_operationsWhereInput = {
      deleted_at: null,
    };

    if (operation_type) {
      where.operation_type = operation_type as any;
    }

    if (status) {
      where.status = status as any;
    }

    if (team_id) {
      where.assigned_team_id = team_id;
    }

    if (worker_id) {
      where.assigned_worker_id = worker_id;
    }

    if (customer_id) {
      where.customer_id = customer_id;
    }

    if (start_date && end_date) {
      where.scheduled_date = {
        gte: new Date(start_date),
        lte: new Date(end_date),
      };
    }

    if (search) {
      where.OR = [
        { operation_number: { contains: search, mode: 'insensitive' } },
        { title: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.field_operations.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: {
          team: true,
          worker: true,
        },
      }),
      this.prisma.field_operations.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * الحصول على عملية بالمعرف
   */
  async findOne(id: string) {
    const operation = await this.prisma.field_operations.findUnique({
      where: { id },
      include: {
        team: true,
        worker: true,
        status_logs: {
          orderBy: { created_at: 'desc' },
        },
        installation: true,
        photos: true,
        materials: true,
        services: true,
        inspections: {
          include: {
            items: true,
          },
        },
      },
    });

    if (!operation || operation.deleted_at) {
      throw new NotFoundException(`العملية غير موجودة`);
    }

    return operation;
  }

  /**
   * تحديث عملية
   */
  async update(id: string, dto: UpdateOperationDto, userId?: string) {
    await this.findOne(id);

    const updateData: any = {
      ...dto,
      updated_by: userId,
    };

    if (dto.latitude) {
      updateData.latitude = new Prisma.Decimal(dto.latitude);
    }
    if (dto.longitude) {
      updateData.longitude = new Prisma.Decimal(dto.longitude);
    }
    if (dto.estimated_cost) {
      updateData.estimated_cost = new Prisma.Decimal(dto.estimated_cost);
    }
    if (dto.scheduled_date) {
      updateData.scheduled_date = new Date(dto.scheduled_date);
    }

    return this.prisma.field_operations.update({
      where: { id },
      data: updateData,
      include: {
        team: true,
        worker: true,
      },
    });
  }

  /**
   * تغيير حالة العملية
   */
  async updateStatus(id: string, newStatus: OperationStatus, reason?: string, userId?: string) {
    const operation = await this.findOne(id);
    const oldStatus = operation.status;

    // التحقق من صحة الانتقال
    this.validateStatusTransition(oldStatus as OperationStatus, newStatus);

    const updateData: any = {
      status: newStatus as any,
      updated_by: userId,
    };

    // تحديث التواريخ حسب الحالة
    if (newStatus === OperationStatus.IN_PROGRESS) {
      updateData.started_at = new Date();
    } else if (newStatus === OperationStatus.COMPLETED || newStatus === OperationStatus.APPROVED) {
      updateData.completed_at = new Date();
    }

    const updated = await this.prisma.field_operations.update({
      where: { id },
      data: updateData,
    });

    // تسجيل تغيير الحالة
    await this.logStatusChange(id, oldStatus as string, newStatus, userId, reason);

    return updated;
  }

  /**
   * تعيين فريق/عامل للعملية
   */
  async assign(id: string, teamId?: string, workerId?: string, userId?: string) {
    await this.findOne(id);

    const updateData: any = {
      updated_by: userId,
    };

    if (teamId) {
      updateData.assigned_team_id = teamId;
    }
    if (workerId) {
      updateData.assigned_worker_id = workerId;
    }

    // تغيير الحالة إلى "معينة" إذا كانت "مجدولة"
    const operation = await this.prisma.field_operations.findUnique({ where: { id } });
    if (operation?.status === 'scheduled') {
      updateData.status = 'assigned';
      await this.logStatusChange(id, 'scheduled', 'assigned', userId, 'تم التعيين');
    }

    return this.prisma.field_operations.update({
      where: { id },
      data: updateData,
      include: {
        team: true,
        worker: true,
      },
    });
  }

  /**
   * حذف عملية (Soft Delete)
   */
  async remove(id: string, userId?: string) {
    await this.findOne(id);

    return this.prisma.field_operations.update({
      where: { id },
      data: {
        deleted_at: new Date(),
        updated_by: userId,
      },
    });
  }

  /**
   * الحصول على إحصائيات العمليات
   */
  async getStatistics(stationId?: string) {
    const where: Prisma.field_operationsWhereInput = {
      deleted_at: null,
    };

    if (stationId) {
      where.station_id = stationId;
    }

    const [total, byStatus, byType] = await Promise.all([
      this.prisma.field_operations.count({ where }),
      this.prisma.field_operations.groupBy({
        by: ['status'],
        where,
        _count: true,
      }),
      this.prisma.field_operations.groupBy({
        by: ['operation_type'],
        where,
        _count: true,
      }),
    ]);

    return {
      total,
      byStatus: byStatus.reduce((acc, item) => {
        acc[item.status] = item._count;
        return acc;
      }, {} as Record<string, number>),
      byType: byType.reduce((acc, item) => {
        acc[item.operation_type] = item._count;
        return acc;
      }, {} as Record<string, number>),
    };
  }

  // ==================== Helper Methods ====================

  private async generateOperationNumber(type: string): Promise<string> {
    const prefix = type.substring(0, 3).toUpperCase();
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    
    const count = await this.prisma.field_operations.count({
      where: {
        operation_number: {
          startsWith: `${prefix}-${year}${month}`,
        },
      },
    });

    const sequence = (count + 1).toString().padStart(4, '0');
    return `${prefix}-${year}${month}-${sequence}`;
  }

  private async logStatusChange(
    operationId: string,
    oldStatus: string | null,
    newStatus: string,
    changedBy?: string,
    reason?: string,
  ) {
    await this.prisma.field_operation_status_log.create({
      data: {
        operation_id: operationId,
        old_status: oldStatus as any,
        new_status: newStatus as any,
        changed_by: changedBy,
        change_reason: reason,
      },
    });
  }

  private validateStatusTransition(from: OperationStatus, to: OperationStatus) {
    const validTransitions: Record<OperationStatus, OperationStatus[]> = {
      [OperationStatus.DRAFT]: [OperationStatus.SCHEDULED, OperationStatus.CANCELLED],
      [OperationStatus.SCHEDULED]: [OperationStatus.ASSIGNED, OperationStatus.CANCELLED, OperationStatus.ON_HOLD],
      [OperationStatus.ASSIGNED]: [OperationStatus.IN_PROGRESS, OperationStatus.CANCELLED, OperationStatus.ON_HOLD],
      [OperationStatus.IN_PROGRESS]: [OperationStatus.COMPLETED, OperationStatus.ON_HOLD, OperationStatus.WAITING_CUSTOMER_CABLE],
      [OperationStatus.COMPLETED]: [OperationStatus.PENDING_INSPECTION],
      [OperationStatus.PENDING_INSPECTION]: [OperationStatus.APPROVED, OperationStatus.REJECTED],
      [OperationStatus.REJECTED]: [OperationStatus.IN_PROGRESS],
      [OperationStatus.ON_HOLD]: [OperationStatus.SCHEDULED, OperationStatus.ASSIGNED, OperationStatus.IN_PROGRESS],
      [OperationStatus.WAITING_CUSTOMER_CABLE]: [OperationStatus.IN_PROGRESS, OperationStatus.CANCELLED],
      [OperationStatus.CANCELLED]: [],
      [OperationStatus.APPROVED]: [],
    };

    if (!validTransitions[from]?.includes(to)) {
      throw new BadRequestException(`لا يمكن الانتقال من حالة "${from}" إلى حالة "${to}"`);
    }
  }
}
