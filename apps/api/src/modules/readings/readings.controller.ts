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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ReadingsService } from './readings.service';
import { CreateReadingTemplateDto, UpdateReadingTemplateDto, CreateReadingRoundDto, RecordReadingDto } from './dto';

@ApiTags('readings')
@ApiBearerAuth()
@Controller('readings')
export class ReadingsController {
  constructor(private readonly readingsService: ReadingsService) {}

  // ==================== قوالب الجولات ====================

  @Post('templates')
  @ApiOperation({ summary: 'إنشاء قالب جولة قراءة' })
  @ApiResponse({ status: 201, description: 'تم إنشاء القالب بنجاح' })
  createTemplate(@Body() dto: CreateReadingTemplateDto) {
    return this.readingsService.createTemplate(dto);
  }

  @Get('templates')
  @ApiOperation({ summary: 'الحصول على قائمة قوالب الجولات' })
  @ApiQuery({ name: 'station_id', required: false })
  @ApiResponse({ status: 200, description: 'قائمة القوالب' })
  findAllTemplates(@Query('station_id') stationId?: string) {
    return this.readingsService.findAllTemplates(stationId);
  }

  @Get('templates/:id')
  @ApiOperation({ summary: 'الحصول على تفاصيل قالب' })
  @ApiParam({ name: 'id', description: 'معرف القالب' })
  @ApiResponse({ status: 200, description: 'تفاصيل القالب' })
  findTemplate(@Param('id', ParseUUIDPipe) id: string) {
    return this.readingsService.findTemplate(id);
  }

  @Put('templates/:id')
  @ApiOperation({ summary: 'تحديث قالب' })
  @ApiParam({ name: 'id', description: 'معرف القالب' })
  @ApiResponse({ status: 200, description: 'تم تحديث القالب بنجاح' })
  updateTemplate(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateReadingTemplateDto) {
    return this.readingsService.updateTemplate(id, dto);
  }

  @Delete('templates/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'حذف قالب' })
  @ApiParam({ name: 'id', description: 'معرف القالب' })
  @ApiResponse({ status: 204, description: 'تم حذف القالب بنجاح' })
  deleteTemplate(@Param('id', ParseUUIDPipe) id: string) {
    return this.readingsService.deleteTemplate(id);
  }

  // ==================== جولات القراءة ====================

  @Post('rounds')
  @ApiOperation({ summary: 'إنشاء جولة قراءة' })
  @ApiResponse({ status: 201, description: 'تم إنشاء الجولة بنجاح' })
  createRound(@Body() dto: CreateReadingRoundDto) {
    return this.readingsService.createRound(dto);
  }

  @Get('rounds')
  @ApiOperation({ summary: 'الحصول على قائمة جولات القراءة' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'assigned_to', required: false })
  @ApiResponse({ status: 200, description: 'قائمة الجولات' })
  findAllRounds(
    @Query('status') status?: string,
    @Query('assigned_to') assignedTo?: string,
  ) {
    return this.readingsService.findAllRounds(status, assignedTo);
  }

  @Get('rounds/:id')
  @ApiOperation({ summary: 'الحصول على تفاصيل جولة' })
  @ApiParam({ name: 'id', description: 'معرف الجولة' })
  @ApiResponse({ status: 200, description: 'تفاصيل الجولة' })
  findRound(@Param('id', ParseUUIDPipe) id: string) {
    return this.readingsService.findRound(id);
  }

  @Put('rounds/:id/start')
  @ApiOperation({ summary: 'بدء جولة القراءة' })
  @ApiParam({ name: 'id', description: 'معرف الجولة' })
  @ApiResponse({ status: 200, description: 'تم بدء الجولة بنجاح' })
  startRound(@Param('id', ParseUUIDPipe) id: string) {
    return this.readingsService.startRound(id);
  }

  @Put('rounds/:id/complete')
  @ApiOperation({ summary: 'إكمال جولة القراءة' })
  @ApiParam({ name: 'id', description: 'معرف الجولة' })
  @ApiResponse({ status: 200, description: 'تم إكمال الجولة بنجاح' })
  completeRound(@Param('id', ParseUUIDPipe) id: string) {
    return this.readingsService.completeRound(id);
  }

  // ==================== تسجيل القراءات ====================

  @Post('rounds/:id/readings')
  @ApiOperation({ summary: 'تسجيل قراءة عداد' })
  @ApiParam({ name: 'id', description: 'معرف الجولة' })
  @ApiResponse({ status: 201, description: 'تم تسجيل القراءة بنجاح' })
  recordReading(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RecordReadingDto,
  ) {
    return this.readingsService.recordReading(id, dto);
  }

  @Get('rounds/:id/readings')
  @ApiOperation({ summary: 'الحصول على قراءات الجولة' })
  @ApiParam({ name: 'id', description: 'معرف الجولة' })
  @ApiResponse({ status: 200, description: 'قراءات الجولة' })
  getRoundReadings(@Param('id', ParseUUIDPipe) id: string) {
    return this.readingsService.getRoundReadings(id);
  }
}
