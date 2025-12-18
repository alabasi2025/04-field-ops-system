import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTeamDto, UpdateTeamDto, AddTeamMemberDto } from './dto';

@Injectable()
export class TeamsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTeamDto) {
    // التحقق من عدم تكرار الكود
    const existing = await this.prisma.field_teams.findUnique({
      where: { team_code: dto.team_code },
    });

    if (existing) {
      throw new ConflictException('كود الفريق موجود مسبقاً');
    }

    return this.prisma.field_teams.create({
      data: dto,
      include: {
        members: {
          include: { worker: true },
        },
      },
    });
  }

  async findAll(stationId?: string) {
    const where: any = {};
    if (stationId) {
      where.station_id = stationId;
    }

    return this.prisma.field_teams.findMany({
      where,
      include: {
        members: {
          where: { is_active: true },
          include: { worker: true },
        },
        _count: {
          select: { operations: true },
        },
      },
      orderBy: { team_name: 'asc' },
    });
  }

  async findOne(id: string) {
    const team = await this.prisma.field_teams.findUnique({
      where: { id },
      include: {
        members: {
          include: { worker: true },
        },
        operations: {
          take: 10,
          orderBy: { created_at: 'desc' },
        },
        work_packages: {
          take: 10,
          orderBy: { created_at: 'desc' },
        },
      },
    });

    if (!team) {
      throw new NotFoundException('الفريق غير موجود');
    }

    return team;
  }

  async update(id: string, dto: UpdateTeamDto) {
    await this.findOne(id);

    return this.prisma.field_teams.update({
      where: { id },
      data: dto,
      include: {
        members: {
          include: { worker: true },
        },
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    // التحقق من عدم وجود عمليات نشطة
    const activeOps = await this.prisma.field_operations.count({
      where: {
        assigned_team_id: id,
        status: { in: ['assigned', 'in_progress'] },
      },
    });

    if (activeOps > 0) {
      throw new ConflictException('لا يمكن حذف فريق لديه عمليات نشطة');
    }

    return this.prisma.field_teams.delete({ where: { id } });
  }

  // ==================== إدارة الأعضاء ====================

  async addMember(teamId: string, dto: AddTeamMemberDto) {
    await this.findOne(teamId);

    // التحقق من وجود العامل
    const worker = await this.prisma.field_workers.findUnique({
      where: { id: dto.worker_id },
    });

    if (!worker) {
      throw new NotFoundException('العامل غير موجود');
    }

    // التحقق من عدم وجود العامل في الفريق
    const existing = await this.prisma.field_team_members.findUnique({
      where: {
        team_id_worker_id: {
          team_id: teamId,
          worker_id: dto.worker_id,
        },
      },
    });

    if (existing) {
      throw new ConflictException('العامل موجود في الفريق مسبقاً');
    }

    return this.prisma.field_team_members.create({
      data: {
        team_id: teamId,
        worker_id: dto.worker_id,
        role: dto.role,
      },
      include: { worker: true },
    });
  }

  async removeMember(teamId: string, workerId: string) {
    const member = await this.prisma.field_team_members.findUnique({
      where: {
        team_id_worker_id: {
          team_id: teamId,
          worker_id: workerId,
        },
      },
    });

    if (!member) {
      throw new NotFoundException('العضو غير موجود في الفريق');
    }

    return this.prisma.field_team_members.update({
      where: { id: member.id },
      data: {
        is_active: false,
        left_at: new Date(),
      },
    });
  }

  async getTeamMembers(teamId: string) {
    await this.findOne(teamId);

    return this.prisma.field_team_members.findMany({
      where: {
        team_id: teamId,
        is_active: true,
      },
      include: { worker: true },
    });
  }
}
