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
import { WorkersService } from './workers.service';
import { CreateWorkerDto, UpdateWorkerDto, UpdateLocationDto } from './dto';

@ApiTags('workers')
@ApiBearerAuth()
@Controller('workers')
export class WorkersController {
  constructor(private readonly workersService: WorkersService) {}

  @Post()
  @ApiOperation({ summary: 'إنشاء عامل جديد' })
  @ApiResponse({ status: 201, description: 'تم إنشاء العامل بنجاح' })
  create(@Body() dto: CreateWorkerDto) {
    return this.workersService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'الحصول على قائمة العاملين' })
  @ApiQuery({ name: 'type', required: false, enum: ['technician', 'reader', 'collector'] })
  @ApiQuery({ name: 'available', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'قائمة العاملين' })
  findAll(
    @Query('type') type?: string,
    @Query('available') available?: string,
  ) {
    return this.workersService.findAll(type, available === 'true');
  }

  @Get('locations')
  @ApiOperation({ summary: 'الحصول على مواقع جميع العاملين' })
  @ApiResponse({ status: 200, description: 'مواقع العاملين' })
  getAllLocations() {
    return this.workersService.getAllLocations();
  }

  @Get(':id')
  @ApiOperation({ summary: 'الحصول على تفاصيل عامل' })
  @ApiParam({ name: 'id', description: 'معرف العامل' })
  @ApiResponse({ status: 200, description: 'تفاصيل العامل' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.workersService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'تحديث عامل' })
  @ApiParam({ name: 'id', description: 'معرف العامل' })
  @ApiResponse({ status: 200, description: 'تم تحديث العامل بنجاح' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateWorkerDto) {
    return this.workersService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'حذف عامل' })
  @ApiParam({ name: 'id', description: 'معرف العامل' })
  @ApiResponse({ status: 204, description: 'تم حذف العامل بنجاح' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.workersService.remove(id);
  }

  // ==================== تتبع الموقع ====================

  @Post(':id/location')
  @ApiOperation({ summary: 'تحديث موقع العامل' })
  @ApiParam({ name: 'id', description: 'معرف العامل' })
  @ApiResponse({ status: 201, description: 'تم تحديث الموقع بنجاح' })
  updateLocation(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateLocationDto,
  ) {
    return this.workersService.updateLocation(id, dto);
  }

  @Get(':id/location/history')
  @ApiOperation({ summary: 'الحصول على سجل مواقع العامل' })
  @ApiParam({ name: 'id', description: 'معرف العامل' })
  @ApiQuery({ name: 'date', required: false, description: 'تاريخ محدد (YYYY-MM-DD)' })
  @ApiResponse({ status: 200, description: 'سجل المواقع' })
  getLocationHistory(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('date') date?: string,
  ) {
    return this.workersService.getLocationHistory(id, date);
  }

  // ==================== الأداء ====================

  @Get(':id/performance')
  @ApiOperation({ summary: 'الحصول على تقييم أداء العامل' })
  @ApiParam({ name: 'id', description: 'معرف العامل' })
  @ApiResponse({ status: 200, description: 'تقييم الأداء' })
  getPerformance(@Param('id', ParseUUIDPipe) id: string) {
    return this.workersService.getPerformance(id);
  }
}
