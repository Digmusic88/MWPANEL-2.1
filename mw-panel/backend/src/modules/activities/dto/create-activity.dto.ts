import { IsString, IsNotEmpty, IsOptional, IsDateString, IsEnum, IsBoolean, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ActivityValuationType } from '../entities/activity.entity';

export class CreateActivityDto {
  @ApiProperty({ description: 'Nombre de la actividad', example: 'Ejercicios de matemáticas' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: 'Descripción de la actividad' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Fecha de asignación', example: '2025-01-15' })
  @IsDateString()
  assignedDate: string;

  @ApiPropertyOptional({ description: 'Fecha de revisión opcional', example: '2025-01-20' })
  @IsOptional()
  @IsDateString()
  reviewDate?: string;

  @ApiProperty({ description: 'ID del grupo de clase' })
  @IsString()
  @IsNotEmpty()
  classGroupId: string;

  @ApiProperty({ 
    description: 'Tipo de valoración', 
    enum: ActivityValuationType,
    example: ActivityValuationType.EMOJI 
  })
  @IsEnum(ActivityValuationType)
  valuationType: ActivityValuationType;

  @ApiPropertyOptional({ 
    description: 'Puntuación máxima (requerido para tipo score)',
    minimum: 1,
    maximum: 100 
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  maxScore?: number;

  @ApiProperty({ description: 'Si notificar a las familias', default: true })
  @IsBoolean()
  notifyFamilies: boolean = true;

  @ApiPropertyOptional({ description: 'Notificar cuando el emoji sea happy (cara sonriente)', default: false })
  @IsOptional()
  @IsBoolean()
  notifyOnHappy?: boolean = false;

  @ApiPropertyOptional({ description: 'Notificar cuando el emoji sea neutral (cara neutral)', default: true })
  @IsOptional()
  @IsBoolean()
  notifyOnNeutral?: boolean = true;

  @ApiPropertyOptional({ description: 'Notificar cuando el emoji sea sad (cara triste)', default: true })
  @IsOptional()
  @IsBoolean()
  notifyOnSad?: boolean = true;
}