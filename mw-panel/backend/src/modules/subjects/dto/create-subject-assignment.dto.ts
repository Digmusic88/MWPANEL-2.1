import { IsString, IsNotEmpty, IsOptional, IsUUID, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSubjectAssignmentDto {
  @ApiProperty({ description: 'ID del profesor' })
  @IsUUID()
  @IsNotEmpty()
  teacherId: string;

  @ApiProperty({ description: 'ID de la asignatura' })
  @IsUUID()
  @IsNotEmpty()
  subjectId: string;

  @ApiProperty({ description: 'ID del grupo de clase' })
  @IsUUID()
  @IsNotEmpty()
  classGroupId: string;

  @ApiProperty({ description: 'ID del año académico' })
  @IsUUID()
  @IsNotEmpty()
  academicYearId: string;

  @ApiProperty({ description: 'Horas semanales para esta asignación', example: 4 })
  @IsInt()
  @Min(0)
  weeklyHours: number;

  @ApiProperty({ description: 'Notas adicionales', required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}