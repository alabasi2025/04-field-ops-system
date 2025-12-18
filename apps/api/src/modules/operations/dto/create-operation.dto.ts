import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsOptional,
  IsUUID,
  IsNumber,
  IsDateString,
  MaxLength,
  Min,
  Max,
} from 'class-validator';

export enum OperationType {
  INSTALLATION = 'installation',
  MAINTENANCE = 'maintenance',
  INSPECTION = 'inspection',
  DISCONNECTION = 'disconnection',
  RECONNECTION = 'reconnection',
  METER_READING = 'meter_reading',
  COLLECTION = 'collection',
  MIGRATION = 'migration',
  REPLACEMENT = 'replacement',
}

export enum OperationStatus {
  DRAFT = 'draft',
  SCHEDULED = 'scheduled',
  ASSIGNED = 'assigned',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  ON_HOLD = 'on_hold',
  REJECTED = 'rejected',
  WAITING_CUSTOMER_CABLE = 'waiting_customer_cable',
  PENDING_INSPECTION = 'pending_inspection',
  APPROVED = 'approved',
}

export class CreateOperationDto {
  @ApiProperty({ description: 'نوع العملية', enum: OperationType })
  @IsEnum(OperationType)
  operation_type: OperationType;

  @ApiProperty({ description: 'عنوان العملية', maxLength: 200 })
  @IsString()
  @MaxLength(200)
  title: string;

  @ApiPropertyOptional({ description: 'وصف العملية' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'الأولوية (1=عاجل, 2=عادي, 3=منخفض)', minimum: 1, maximum: 3 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(3)
  priority?: number;

  @ApiPropertyOptional({ description: 'معرف العميل' })
  @IsOptional()
  @IsUUID()
  customer_id?: string;

  @ApiPropertyOptional({ description: 'معرف العداد' })
  @IsOptional()
  @IsUUID()
  meter_id?: string;

  @ApiPropertyOptional({ description: 'معرف الأصل' })
  @IsOptional()
  @IsUUID()
  asset_id?: string;

  @ApiPropertyOptional({ description: 'معرف المحطة' })
  @IsOptional()
  @IsUUID()
  station_id?: string;

  @ApiPropertyOptional({ description: 'العنوان' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  address?: string;

  @ApiPropertyOptional({ description: 'خط العرض' })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional({ description: 'خط الطول' })
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @ApiPropertyOptional({ description: 'معرف الفريق المعين' })
  @IsOptional()
  @IsUUID()
  assigned_team_id?: string;

  @ApiPropertyOptional({ description: 'معرف العامل المعين' })
  @IsOptional()
  @IsUUID()
  assigned_worker_id?: string;

  @ApiPropertyOptional({ description: 'تاريخ الجدولة' })
  @IsOptional()
  @IsDateString()
  scheduled_date?: string;

  @ApiPropertyOptional({ description: 'التكلفة المقدرة' })
  @IsOptional()
  @IsNumber()
  estimated_cost?: number;

  @ApiPropertyOptional({ description: 'ملاحظات' })
  @IsOptional()
  @IsString()
  notes?: string;
}
