import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsString, IsOptional, IsUUID, IsBoolean, IsEmail, IsNumber, MaxLength } from 'class-validator';

export class CreateWorkerDto {
  @ApiProperty({ description: 'كود العامل', maxLength: 20 })
  @IsString()
  @MaxLength(20)
  worker_code: string;

  @ApiProperty({ description: 'الاسم الكامل', maxLength: 100 })
  @IsString()
  @MaxLength(100)
  full_name: string;

  @ApiPropertyOptional({ description: 'رقم الهاتف' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @ApiPropertyOptional({ description: 'البريد الإلكتروني' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ description: 'نوع العامل', enum: ['technician', 'reader', 'collector'] })
  @IsString()
  worker_type: string;

  @ApiPropertyOptional({ description: 'التخصص' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  specialization?: string;

  @ApiPropertyOptional({ description: 'معرف الموظف من HR' })
  @IsOptional()
  @IsUUID()
  employee_id?: string;

  @ApiPropertyOptional({ description: 'معرف المستخدم من النظام الأم' })
  @IsOptional()
  @IsUUID()
  user_id?: string;
}

export class UpdateWorkerDto extends PartialType(CreateWorkerDto) {
  @ApiPropertyOptional({ description: 'متاح للعمل' })
  @IsOptional()
  @IsBoolean()
  is_available?: boolean;

  @ApiPropertyOptional({ description: 'نشط' })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class UpdateLocationDto {
  @ApiProperty({ description: 'خط العرض' })
  @IsNumber()
  latitude: number;

  @ApiProperty({ description: 'خط الطول' })
  @IsNumber()
  longitude: number;

  @ApiPropertyOptional({ description: 'الدقة بالمتر' })
  @IsOptional()
  @IsNumber()
  accuracy?: number;

  @ApiPropertyOptional({ description: 'السرعة' })
  @IsOptional()
  @IsNumber()
  speed?: number;

  @ApiPropertyOptional({ description: 'مستوى البطارية' })
  @IsOptional()
  @IsNumber()
  battery_level?: number;
}
