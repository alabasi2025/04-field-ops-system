import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { TeamsService } from './teams.service';
import { CreateTeamDto, UpdateTeamDto, AddTeamMemberDto } from './dto';

@ApiTags('teams')
@ApiBearerAuth()
@Controller('teams')
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Post()
  @ApiOperation({ summary: 'إنشاء فريق جديد' })
  @ApiResponse({ status: 201, description: 'تم إنشاء الفريق بنجاح' })
  create(@Body() dto: CreateTeamDto) {
    return this.teamsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'الحصول على قائمة الفرق' })
  @ApiResponse({ status: 200, description: 'قائمة الفرق' })
  findAll(@Query('station_id') stationId?: string) {
    return this.teamsService.findAll(stationId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'الحصول على تفاصيل فريق' })
  @ApiParam({ name: 'id', description: 'معرف الفريق' })
  @ApiResponse({ status: 200, description: 'تفاصيل الفريق' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.teamsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'تحديث فريق' })
  @ApiParam({ name: 'id', description: 'معرف الفريق' })
  @ApiResponse({ status: 200, description: 'تم تحديث الفريق بنجاح' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateTeamDto) {
    return this.teamsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'حذف فريق' })
  @ApiParam({ name: 'id', description: 'معرف الفريق' })
  @ApiResponse({ status: 204, description: 'تم حذف الفريق بنجاح' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.teamsService.remove(id);
  }

  // ==================== إدارة الأعضاء ====================

  @Get(':id/members')
  @ApiOperation({ summary: 'الحصول على أعضاء الفريق' })
  @ApiParam({ name: 'id', description: 'معرف الفريق' })
  getMembers(@Param('id', ParseUUIDPipe) id: string) {
    return this.teamsService.getTeamMembers(id);
  }

  @Post(':id/members')
  @ApiOperation({ summary: 'إضافة عضو للفريق' })
  @ApiParam({ name: 'id', description: 'معرف الفريق' })
  @ApiResponse({ status: 201, description: 'تم إضافة العضو بنجاح' })
  addMember(@Param('id', ParseUUIDPipe) id: string, @Body() dto: AddTeamMemberDto) {
    return this.teamsService.addMember(id, dto);
  }

  @Delete(':id/members/:workerId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'إزالة عضو من الفريق' })
  @ApiParam({ name: 'id', description: 'معرف الفريق' })
  @ApiParam({ name: 'workerId', description: 'معرف العامل' })
  removeMember(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('workerId', ParseUUIDPipe) workerId: string,
  ) {
    return this.teamsService.removeMember(id, workerId);
  }
}
