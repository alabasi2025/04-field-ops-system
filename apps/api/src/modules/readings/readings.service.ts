import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReadingTemplateDto, UpdateReadingTemplateDto, CreateReadingRoundDto, RecordReadingDto } from './dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ReadingsService {
  constructor(private readonly prisma: PrismaService) {}

  // ==================== قوالب الجولات ====================

  async createTemplate(dto: CreateReadingTemplateDto) {
    const existing = await this.prisma.field_reading_templates.findUnique({
      where: { template_code: dto.template_code },
    });

    if (existing) {
      throw new ConflictException('كود القالب موجود مسبقاً');
    }

    const { meter_ids, ...data } = dto;

    const template = await this.prisma.field_reading_templates.create({
      data,
    });

    if (meter_ids && meter_ids.length > 0) {
      await this.prisma.field_reading_template_items.createMany({
        data: meter_ids.map((meterId, index) => ({
          template_id: template.id,
          meter_id: meterId,
          sequence_order: index + 1,
        })),
      });
    }

    return this.findTemplate(template.id);
  }

  async findAllTemplates(stationId?: string) {
    const where: any = {};
    if (stationId) where.station_id = stationId;

    return this.prisma.field_reading_templates.findMany({
      where,
      include: {
        items: true,
        _count: { select: { rounds: true } },
      },
      orderBy: { template_name: 'asc' },
    });
  }

  async findTemplate(id: string) {
    const template = await this.prisma.field_reading_templates.findUnique({
      where: { id },
      include: {
        items: true,
        rounds: {
          take: 10,
          orderBy: { scheduled_date: 'desc' },
        },
      },
    });

    if (!template) {
      throw new NotFoundException('القالب غير موجود');
    }

    return template;
  }

  async updateTemplate(id: string, dto: UpdateReadingTemplateDto) {
    await this.findTemplate(id);

    const { meter_ids, ...data } = dto;

    return this.prisma.field_reading_templates.update({
      where: { id },
      data,
      include: { items: true },
    });
  }

  async deleteTemplate(id: string) {
    await this.findTemplate(id);

    return this.prisma.field_reading_templates.delete({ where: { id } });
  }

  // ==================== جولات القراءة ====================

  async createRound(dto: CreateReadingRoundDto) {
    const template = await this.findTemplate(dto.template_id);

    const roundNumber = await this.generateRoundNumber();

    return this.prisma.field_reading_rounds.create({
      data: {
        round_number: roundNumber,
        template_id: dto.template_id,
        scheduled_date: new Date(dto.scheduled_date),
        assigned_to: dto.assigned_to,
        total_meters: template.items.length,
      },
      include: { template: true },
    });
  }

  async findAllRounds(status?: string, assignedTo?: string) {
    const where: any = {};
    if (status) where.status = status;
    if (assignedTo) where.assigned_to = assignedTo;

    return this.prisma.field_reading_rounds.findMany({
      where,
      include: {
        template: true,
        _count: { select: { readings: true } },
      },
      orderBy: { scheduled_date: 'desc' },
    });
  }

  async findRound(id: string) {
    const round = await this.prisma.field_reading_rounds.findUnique({
      where: { id },
      include: {
        template: {
          include: { items: true },
        },
        readings: true,
      },
    });

    if (!round) {
      throw new NotFoundException('الجولة غير موجودة');
    }

    return round;
  }

  async startRound(id: string) {
    const round = await this.findRound(id);

    if (round.status !== 'scheduled') {
      throw new BadRequestException('لا يمكن بدء جولة غير مجدولة');
    }

    return this.prisma.field_reading_rounds.update({
      where: { id },
      data: {
        status: 'in_progress',
        started_at: new Date(),
      },
    });
  }

  async completeRound(id: string) {
    const round = await this.findRound(id);

    if (round.status !== 'in_progress') {
      throw new BadRequestException('لا يمكن إكمال جولة غير قيد التنفيذ');
    }

    return this.prisma.field_reading_rounds.update({
      where: { id },
      data: {
        status: 'completed',
        completed_at: new Date(),
      },
    });
  }

  // ==================== تسجيل القراءات ====================

  async recordReading(roundId: string, dto: RecordReadingDto, readBy?: string) {
    const round = await this.findRound(roundId);

    if (round.status !== 'in_progress') {
      throw new BadRequestException('لا يمكن تسجيل قراءة في جولة غير قيد التنفيذ');
    }

    // التحقق من عدم تكرار القراءة
    const existing = await this.prisma.field_meter_readings.findFirst({
      where: {
        round_id: roundId,
        meter_id: dto.meter_id,
      },
    });

    if (existing) {
      throw new ConflictException('تم تسجيل قراءة لهذا العداد مسبقاً');
    }

    const reading = await this.prisma.field_meter_readings.create({
      data: {
        round_id: roundId,
        meter_id: dto.meter_id,
        reading_value: new Prisma.Decimal(dto.reading_value),
        photo_path: dto.photo_path,
        latitude: dto.latitude ? new Prisma.Decimal(dto.latitude) : null,
        longitude: dto.longitude ? new Prisma.Decimal(dto.longitude) : null,
        is_anomaly: dto.is_anomaly || false,
        anomaly_reason: dto.anomaly_reason,
        read_by: readBy,
      },
    });

    // تحديث عدد القراءات المسجلة
    await this.prisma.field_reading_rounds.update({
      where: { id: roundId },
      data: {
        read_meters: { increment: 1 },
      },
    });

    return reading;
  }

  async getRoundReadings(roundId: string) {
    await this.findRound(roundId);

    return this.prisma.field_meter_readings.findMany({
      where: { round_id: roundId },
      orderBy: { reading_date: 'asc' },
    });
  }

  // ==================== Helper Methods ====================

  private async generateRoundNumber(): Promise<string> {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');

    const count = await this.prisma.field_reading_rounds.count({
      where: {
        round_number: {
          startsWith: `RND-${year}${month}${day}`,
        },
      },
    });

    const sequence = (count + 1).toString().padStart(3, '0');
    return `RND-${year}${month}${day}-${sequence}`;
  }
}
