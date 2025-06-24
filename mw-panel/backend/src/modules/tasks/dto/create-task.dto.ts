import { IsString, IsNotEmpty, IsOptional, IsEnum, IsDateString, IsBoolean, IsNumber, IsArray, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TaskType, TaskPriority } from '../entities/task.entity';

export class CreateTaskDto {
  @ApiProperty({
    description: 'Título de la tarea',
    example: 'Ensayo sobre la Guerra Civil Española',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({
    description: 'Descripción general de la tarea',
    example: 'Escribir un ensayo de 1000 palabras sobre las causas de la Guerra Civil Española',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Instrucciones detalladas para completar la tarea',
    example: 'Incluir introducción, desarrollo y conclusión. Citar al menos 3 fuentes bibliográficas.',
  })
  @IsOptional()
  @IsString()
  instructions?: string;

  @ApiProperty({
    description: 'Tipo de tarea',
    enum: TaskType,
    example: TaskType.HOMEWORK,
  })
  @IsEnum(TaskType)
  taskType: TaskType;

  @ApiPropertyOptional({
    description: 'Prioridad de la tarea',
    enum: TaskPriority,
    example: TaskPriority.MEDIUM,
  })
  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @ApiProperty({
    description: 'Fecha de asignación de la tarea',
    example: '2025-06-24T09:00:00Z',
  })
  @IsDateString()
  assignedDate: string;

  @ApiProperty({
    description: 'Fecha límite de entrega',
    example: '2025-07-01T23:59:00Z',
  })
  @IsDateString()
  dueDate: string;

  @ApiProperty({
    description: 'ID de la asignación de asignatura',
    example: 'uuid-string',
  })
  @IsString()
  @IsNotEmpty()
  subjectAssignmentId: string;

  @ApiPropertyOptional({
    description: 'Puntuación máxima de la tarea',
    example: 10,
    minimum: 0,
    maximum: 100,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  maxPoints?: number;

  @ApiPropertyOptional({
    description: 'Permitir entregas tardías',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  allowLateSubmission?: boolean;

  @ApiPropertyOptional({
    description: 'Penalización por entrega tardía (0.0 a 1.0)',
    example: 0.2,
    minimum: 0,
    maximum: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  latePenalty?: number;

  @ApiPropertyOptional({
    description: 'Notificar a las familias',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  notifyFamilies?: boolean;

  @ApiPropertyOptional({
    description: 'Requiere archivo adjunto',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  requiresFile?: boolean;

  @ApiPropertyOptional({
    description: 'Tipos de archivo permitidos',
    example: ['pdf', 'doc', 'docx'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allowedFileTypes?: string[];

  @ApiPropertyOptional({
    description: 'Tamaño máximo de archivo en MB',
    example: 10,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  maxFileSizeMB?: number;

  @ApiPropertyOptional({
    description: 'Criterios de evaluación (rúbrica)',
    example: 'Contenido: 40%, Gramática: 30%, Creatividad: 30%',
  })
  @IsOptional()
  @IsString()
  rubric?: string;

  @ApiPropertyOptional({
    description: 'IDs de estudiantes específicos (opcional, si no se envía se asigna a todo el grupo)',
    example: ['student-id-1', 'student-id-2'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  targetStudentIds?: string[];
}