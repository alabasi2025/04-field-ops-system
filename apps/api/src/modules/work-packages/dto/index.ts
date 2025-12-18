import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsString, IsOptional, IsUUID, IsNumber, IsArray, MaxLength } from 'class-validator';

export class CreateWorkPackageDto {
  @ApiProperty({ description: 'اسم الحزمة', maxLength: 200 })
  @IsString()
  @MaxLength(200)
  package_name: string;

  @ApiPropertyOptional({ description: 'وصف الحزمة' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'معرف المحطة' })
  @IsOptional()
  @IsUUID()
  station_id?: string;

  @ApiPropertyOptional({ description: 'معرف الفريق المعين' })
  @IsOptional()
  @IsUUID()
  assigned_team_id?: string;

  @ApiPropertyOptional({ description: 'اسم المقاول' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  contractor_name?: string;

  @ApiPropertyOptional({ description: 'معرف المشرف' })
  @IsOptional()
  @IsUUID()
  supervisor_id?: string;

  @ApiPropertyOptional({ description: 'معرف المراقب' })
  @IsOptional()
  @IsUUID()
  inspector_id?: string;

  @ApiPropertyOptional({ description: 'المدة المتوقعة بالأيام' })
  @IsOptional()
  @IsNumber()
  expected_duration?: number;

  @ApiPropertyOptional({ description: 'المبلغ المتفق عليه' })
  @IsOptional()
  @IsNumber()
  agreed_amount?: number;

  @ApiPropertyOptional({ description: 'معرفات العمليات' })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  operation_ids?: string[];
}

export class UpdateWorkPackageDto extends PartialType(CreateWorkPackageDto) {}

export class InspectPackageDto {
  @ApiProperty({ description: 'نتيجة الفحص', enum: ['approved', 'rejected'] })
  @IsString()
  result: 'approved' | 'rejected';

  @ApiPropertyOptional({ description: 'ملاحظات الفحص' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'سبب الرفض' })
  @IsOptional()
  @IsString()
  rejection_reason?: string;
}
