import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsString, IsOptional, IsUUID, IsNumber, IsDateString, IsBoolean, IsArray, MaxLength } from 'class-validator';

export class CreateReadingTemplateDto {
  @ApiProperty({ description: 'كود القالب', maxLength: 30 })
  @IsString()
  @MaxLength(30)
  template_code: string;

  @ApiProperty({ description: 'اسم القالب', maxLength: 200 })
  @IsString()
  @MaxLength(200)
  template_name: string;

  @ApiPropertyOptional({ description: 'معرف المحطة' })
  @IsOptional()
  @IsUUID()
  station_id?: string;

  @ApiPropertyOptional({ description: 'معرف المنطقة' })
  @IsOptional()
  @IsUUID()
  area_id?: string;

  @ApiProperty({ description: 'التكرار', enum: ['daily', 'weekly', 'monthly'] })
  @IsString()
  frequency: string;

  @ApiPropertyOptional({ description: 'الوقت المقدر بالدقائق' })
  @IsOptional()
  @IsNumber()
  estimated_time?: number;

  @ApiPropertyOptional({ description: 'معرفات العدادات' })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  meter_ids?: string[];
}

export class UpdateReadingTemplateDto extends PartialType(CreateReadingTemplateDto) {
  @ApiPropertyOptional({ description: 'نشط' })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class CreateReadingRoundDto {
  @ApiProperty({ description: 'معرف القالب' })
  @IsUUID()
  template_id: string;

  @ApiProperty({ description: 'تاريخ الجدولة' })
  @IsDateString()
  scheduled_date: string;

  @ApiPropertyOptional({ description: 'معرف العامل المعين' })
  @IsOptional()
  @IsUUID()
  assigned_to?: string;
}

export class RecordReadingDto {
  @ApiProperty({ description: 'معرف العداد' })
  @IsUUID()
  meter_id: string;

  @ApiProperty({ description: 'قيمة القراءة' })
  @IsNumber()
  reading_value: number;

  @ApiPropertyOptional({ description: 'مسار الصورة' })
  @IsOptional()
  @IsString()
  photo_path?: string;

  @ApiPropertyOptional({ description: 'خط العرض' })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional({ description: 'خط الطول' })
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @ApiPropertyOptional({ description: 'قراءة شاذة' })
  @IsOptional()
  @IsBoolean()
  is_anomaly?: boolean;

  @ApiPropertyOptional({ description: 'سبب الشذوذ' })
  @IsOptional()
  @IsString()
  anomaly_reason?: string;
}
