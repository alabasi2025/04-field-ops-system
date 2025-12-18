import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsString, IsOptional, IsUUID, IsBoolean, MaxLength, IsEnum } from 'class-validator';

export class CreateTeamDto {
  @ApiProperty({ description: 'كود الفريق', maxLength: 20 })
  @IsString()
  @MaxLength(20)
  team_code: string;

  @ApiProperty({ description: 'اسم الفريق', maxLength: 100 })
  @IsString()
  @MaxLength(100)
  team_name: string;

  @ApiProperty({ description: 'نوع الفريق', enum: ['installation', 'maintenance', 'reading'] })
  @IsString()
  team_type: string;

  @ApiPropertyOptional({ description: 'معرف المحطة' })
  @IsOptional()
  @IsUUID()
  station_id?: string;

  @ApiPropertyOptional({ description: 'معرف المشرف' })
  @IsOptional()
  @IsUUID()
  supervisor_id?: string;
}

export class UpdateTeamDto extends PartialType(CreateTeamDto) {
  @ApiPropertyOptional({ description: 'حالة النشاط' })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class AddTeamMemberDto {
  @ApiProperty({ description: 'معرف العامل' })
  @IsUUID()
  worker_id: string;

  @ApiProperty({ description: 'الدور', enum: ['leader', 'member'] })
  @IsString()
  role: string;
}
