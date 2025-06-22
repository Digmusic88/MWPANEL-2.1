import { IsString, IsNumber, IsEnum, IsOptional, IsArray, IsUUID, IsBoolean, Min, Max } from 'class-validator';
import { ClassroomType } from '../../students/entities/classroom.entity';

export class CreateClassroomDto {
  @IsString()
  name: string;

  @IsString()
  code: string;

  @IsNumber()
  @Min(1)
  @Max(100)
  capacity: number;

  @IsEnum(ClassroomType)
  type: ClassroomType;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  equipment?: string[];

  @IsOptional()
  @IsString()
  building?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  floor?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsUUID()
  preferredEducationalLevelId?: string;
}