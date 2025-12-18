import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsUUID, IsDateString, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { OperationType, OperationStatus } from './create-operation.dto';

export class QueryOperationDto {
  @ApiPropertyOptional({ description: 'نوع العملية', enum: OperationType })
  @IsOptional()
  @IsEnum(OperationType)
  operation_type?: OperationType;

  @ApiPropertyOptional({ description: 'حالة العملية', enum: OperationStatus })
  @IsOptional()
  @IsEnum(OperationStatus)
  status?: OperationStatus;

  @ApiPropertyOptional({ description: 'معرف الفريق' })
  @IsOptional()
  @IsUUID()
  team_id?: string;

  @ApiPropertyOptional({ description: 'معرف العامل' })
  @IsOptional()
  @IsUUID()
  worker_id?: string;

  @ApiPropertyOptional({ description: 'معرف العميل' })
  @IsOptional()
  @IsUUID()
  customer_id?: string;

  @ApiPropertyOptional({ description: 'تاريخ البداية' })
  @IsOptional()
  @IsDateString()
  start_date?: string;

  @ApiPropertyOptional({ description: 'تاريخ النهاية' })
  @IsOptional()
  @IsDateString()
  end_date?: string;

  @ApiPropertyOptional({ description: 'رقم الصفحة', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'عدد العناصر في الصفحة', default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 10;

  @ApiPropertyOptional({ description: 'نص البحث' })
  @IsOptional()
  search?: string;
}
