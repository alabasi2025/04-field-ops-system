import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWorkerDto, UpdateWorkerDto, UpdateLocationDto } from './dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class WorkersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateWorkerDto) {
    const existing = await this.prisma.field_workers.findUnique({
      where: { worker_code: dto.worker_code },
    });

    if (existing) {
      throw new ConflictException('كود العامل موجود مسبقاً');
    }

    return this.prisma.field_workers.create({
      data: dto,
    });
  }

  async findAll(type?: string, available?: boolean) {
    const where: any = { is_active: true };
    
    if (type) {
      where.worker_type = type;
    }
    if (available !== undefined) {
      where.is_available = available;
    }

    return this.prisma.field_workers.findMany({
      where,
      include: {
        team_memberships: {
          where: { is_active: true },
          include: { team: true },
        },
        _count: {
          select: { operations: true },
        },
      },
      orderBy: { full_name: 'asc' },
    });
  }

  async findOne(id: string) {
    const worker = await this.prisma.field_workers.findUnique({
      where: { id },
      include: {
        team_memberships: {
          where: { is_active: true },
          include: { team: true },
        },
        operations: {
          take: 10,
          orderBy: { created_at: 'desc' },
        },
        performance: {
          take: 6,
          orderBy: { period_start: 'desc' },
        },
      },
    });

    if (!worker) {
      throw new NotFoundException('العامل غير موجود');
    }

    return worker;
  }

  async update(id: string, dto: UpdateWorkerDto) {
    await this.findOne(id);

    return this.prisma.field_workers.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    // التحقق من عدم وجود عمليات نشطة
    const activeOps = await this.prisma.field_operations.count({
      where: {
        assigned_worker_id: id,
        status: { in: ['assigned', 'in_progress'] },
      },
    });

    if (activeOps > 0) {
      throw new ConflictException('لا يمكن حذف عامل لديه عمليات نشطة');
    }

    return this.prisma.field_workers.update({
      where: { id },
      data: { is_active: false },
    });
  }

  // ==================== تتبع الموقع ====================

  async updateLocation(workerId: string, dto: UpdateLocationDto) {
    await this.findOne(workerId);

    // تحديث آخر موقع معروف
    await this.prisma.field_workers.update({
      where: { id: workerId },
      data: {
        last_latitude: new Prisma.Decimal(dto.latitude),
        last_longitude: new Prisma.Decimal(dto.longitude),
        last_location_at: new Date(),
      },
    });

    // تسجيل الموقع في السجل
    return this.prisma.field_worker_location_log.create({
      data: {
        worker_id: workerId,
        latitude: new Prisma.Decimal(dto.latitude),
        longitude: new Prisma.Decimal(dto.longitude),
        accuracy: dto.accuracy ? new Prisma.Decimal(dto.accuracy) : null,
        speed: dto.speed ? new Prisma.Decimal(dto.speed) : null,
        battery_level: dto.battery_level,
      },
    });
  }

  async getLocationHistory(workerId: string, date?: string) {
    await this.findOne(workerId);

    const where: any = { worker_id: workerId };

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      where.recorded_at = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    return this.prisma.field_worker_location_log.findMany({
      where,
      orderBy: { recorded_at: 'asc' },
    });
  }

  async getAllLocations() {
    return this.prisma.field_workers.findMany({
      where: {
        is_active: true,
        last_latitude: { not: null },
      },
      select: {
        id: true,
        worker_code: true,
        full_name: true,
        worker_type: true,
        last_latitude: true,
        last_longitude: true,
        last_location_at: true,
        is_available: true,
      },
    });
  }

  // ==================== الأداء ====================

  async getPerformance(workerId: string) {
    await this.findOne(workerId);

    return this.prisma.field_worker_performance.findMany({
      where: { worker_id: workerId },
      orderBy: { period_start: 'desc' },
      take: 12,
    });
  }

  async calculatePerformance(workerId: string, periodStart: Date, periodEnd: Date) {
    const operations = await this.prisma.field_operations.findMany({
      where: {
        assigned_worker_id: workerId,
        completed_at: {
          gte: periodStart,
          lte: periodEnd,
        },
      },
    });

    const total = operations.length;
    const onTime = operations.filter(op => {
      if (!op.scheduled_date || !op.completed_at) return false;
      return op.completed_at <= op.scheduled_date;
    }).length;

    return this.prisma.field_worker_performance.create({
      data: {
        worker_id: workerId,
        period_start: periodStart,
        period_end: periodEnd,
        total_operations: total,
        completed_on_time: onTime,
        quality_score: total > 0 ? new Prisma.Decimal((onTime / total) * 100) : null,
      },
    });
  }
}
