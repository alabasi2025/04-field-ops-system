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
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { OperationsService } from './operations.service';
import { CreateOperationDto, UpdateOperationDto, QueryOperationDto, OperationStatus } from './dto';

@ApiTags('operations')
@ApiBearerAuth()
@Controller('operations')
export class OperationsController {
  constructor(private readonly operationsService: OperationsService) {}

  @Post()
  @ApiOperation({ summary: 'إنشاء عملية جديدة' })
  @ApiResponse({ status: 201, description: 'تم إنشاء العملية بنجاح' })
  @ApiResponse({ status: 400, description: 'بيانات غير صالحة' })
  create(@Body() dto: CreateOperationDto) {
    return this.operationsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'الحصول على قائمة العمليات' })
  @ApiResponse({ status: 200, description: 'قائمة العمليات' })
  findAll(@Query() query: QueryOperationDto) {
    return this.operationsService.findAll(query);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'الحصول على إحصائيات العمليات' })
  @ApiResponse({ status: 200, description: 'إحصائيات العمليات' })
  getStatistics(@Query('station_id') stationId?: string) {
    return this.operationsService.getStatistics(stationId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'الحصول على تفاصيل عملية' })
  @ApiParam({ name: 'id', description: 'معرف العملية' })
  @ApiResponse({ status: 200, description: 'تفاصيل العملية' })
  @ApiResponse({ status: 404, description: 'العملية غير موجودة' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.operationsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'تحديث عملية' })
  @ApiParam({ name: 'id', description: 'معرف العملية' })
  @ApiResponse({ status: 200, description: 'تم تحديث العملية بنجاح' })
  @ApiResponse({ status: 404, description: 'العملية غير موجودة' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateOperationDto,
  ) {
    return this.operationsService.update(id, dto);
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'تغيير حالة العملية' })
  @ApiParam({ name: 'id', description: 'معرف العملية' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', enum: Object.values(OperationStatus) },
        reason: { type: 'string' },
      },
      required: ['status'],
    },
  })
  @ApiResponse({ status: 200, description: 'تم تغيير الحالة بنجاح' })
  @ApiResponse({ status: 400, description: 'انتقال غير صالح' })
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: OperationStatus,
    @Body('reason') reason?: string,
  ) {
    return this.operationsService.updateStatus(id, status, reason);
  }

  @Put(':id/assign')
  @ApiOperation({ summary: 'تعيين فريق/عامل للعملية' })
  @ApiParam({ name: 'id', description: 'معرف العملية' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        team_id: { type: 'string', format: 'uuid' },
        worker_id: { type: 'string', format: 'uuid' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'تم التعيين بنجاح' })
  assign(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('team_id') teamId?: string,
    @Body('worker_id') workerId?: string,
  ) {
    return this.operationsService.assign(id, teamId, workerId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'حذف عملية' })
  @ApiParam({ name: 'id', description: 'معرف العملية' })
  @ApiResponse({ status: 204, description: 'تم حذف العملية بنجاح' })
  @ApiResponse({ status: 404, description: 'العملية غير موجودة' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.operationsService.remove(id);
  }
}
