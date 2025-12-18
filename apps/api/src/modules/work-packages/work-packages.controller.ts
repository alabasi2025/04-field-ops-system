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
import { WorkPackagesService } from './work-packages.service';
import { CreateWorkPackageDto, UpdateWorkPackageDto, InspectPackageDto } from './dto';

@ApiTags('work-packages')
@ApiBearerAuth()
@Controller('work-packages')
export class WorkPackagesController {
  constructor(private readonly workPackagesService: WorkPackagesService) {}

  @Post()
  @ApiOperation({ summary: 'إنشاء حزمة عمل جديدة' })
  @ApiResponse({ status: 201, description: 'تم إنشاء الحزمة بنجاح' })
  create(@Body() dto: CreateWorkPackageDto) {
    return this.workPackagesService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'الحصول على قائمة حزم العمل' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'team_id', required: false })
  @ApiResponse({ status: 200, description: 'قائمة حزم العمل' })
  findAll(
    @Query('status') status?: string,
    @Query('team_id') teamId?: string,
  ) {
    return this.workPackagesService.findAll(status, teamId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'الحصول على تفاصيل حزمة عمل' })
  @ApiParam({ name: 'id', description: 'معرف الحزمة' })
  @ApiResponse({ status: 200, description: 'تفاصيل الحزمة' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.workPackagesService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'تحديث حزمة عمل' })
  @ApiParam({ name: 'id', description: 'معرف الحزمة' })
  @ApiResponse({ status: 200, description: 'تم تحديث الحزمة بنجاح' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateWorkPackageDto) {
    return this.workPackagesService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'حذف حزمة عمل' })
  @ApiParam({ name: 'id', description: 'معرف الحزمة' })
  @ApiResponse({ status: 204, description: 'تم حذف الحزمة بنجاح' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.workPackagesService.remove(id);
  }

  // ==================== إدارة الحالة ====================

  @Put(':id/assign')
  @ApiOperation({ summary: 'تعيين فريق للحزمة' })
  @ApiParam({ name: 'id', description: 'معرف الحزمة' })
  @ApiResponse({ status: 200, description: 'تم التعيين بنجاح' })
  assign(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('team_id', ParseUUIDPipe) teamId: string,
  ) {
    return this.workPackagesService.assign(id, teamId);
  }

  @Put(':id/start')
  @ApiOperation({ summary: 'بدء العمل على الحزمة' })
  @ApiParam({ name: 'id', description: 'معرف الحزمة' })
  @ApiResponse({ status: 200, description: 'تم بدء العمل بنجاح' })
  start(@Param('id', ParseUUIDPipe) id: string) {
    return this.workPackagesService.start(id);
  }

  @Put(':id/complete')
  @ApiOperation({ summary: 'إكمال الحزمة من قبل الفريق' })
  @ApiParam({ name: 'id', description: 'معرف الحزمة' })
  @ApiResponse({ status: 200, description: 'تم الإكمال بنجاح' })
  complete(@Param('id', ParseUUIDPipe) id: string) {
    return this.workPackagesService.complete(id);
  }

  @Put(':id/submit-inspection')
  @ApiOperation({ summary: 'تقديم الحزمة للفحص' })
  @ApiParam({ name: 'id', description: 'معرف الحزمة' })
  @ApiResponse({ status: 200, description: 'تم التقديم للفحص بنجاح' })
  submitForInspection(@Param('id', ParseUUIDPipe) id: string) {
    return this.workPackagesService.submitForInspection(id);
  }

  @Put(':id/inspect')
  @ApiOperation({ summary: 'فحص الحزمة' })
  @ApiParam({ name: 'id', description: 'معرف الحزمة' })
  @ApiResponse({ status: 200, description: 'تم الفحص بنجاح' })
  inspect(@Param('id', ParseUUIDPipe) id: string, @Body() dto: InspectPackageDto) {
    return this.workPackagesService.inspect(id, dto);
  }

  // ==================== إدارة العناصر ====================

  @Post(':id/items')
  @ApiOperation({ summary: 'إضافة عملية للحزمة' })
  @ApiParam({ name: 'id', description: 'معرف الحزمة' })
  @ApiResponse({ status: 201, description: 'تم إضافة العملية بنجاح' })
  addItem(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('operation_id', ParseUUIDPipe) operationId: string,
  ) {
    return this.workPackagesService.addItem(id, operationId);
  }

  @Delete(':id/items/:itemId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'إزالة عملية من الحزمة' })
  @ApiParam({ name: 'id', description: 'معرف الحزمة' })
  @ApiParam({ name: 'itemId', description: 'معرف العنصر' })
  @ApiResponse({ status: 204, description: 'تم إزالة العملية بنجاح' })
  removeItem(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('itemId', ParseUUIDPipe) itemId: string,
  ) {
    return this.workPackagesService.removeItem(id, itemId);
  }
}
