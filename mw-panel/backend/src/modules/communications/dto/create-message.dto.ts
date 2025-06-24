import { IsNotEmpty, IsString, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MessageType, MessagePriority } from '../entities/message.entity';

export class CreateMessageDto {
  @ApiProperty({ description: 'Asunto del mensaje' })
  @IsNotEmpty()
  @IsString()
  subject: string;

  @ApiProperty({ description: 'Contenido del mensaje' })
  @IsNotEmpty()
  @IsString()
  content: string;

  @ApiPropertyOptional({ enum: MessageType, description: 'Tipo de mensaje' })
  @IsOptional()
  @IsEnum(MessageType)
  type?: MessageType;

  @ApiPropertyOptional({ enum: MessagePriority, description: 'Prioridad del mensaje' })
  @IsOptional()
  @IsEnum(MessagePriority)
  priority?: MessagePriority;

  @ApiPropertyOptional({ description: 'ID del destinatario (para mensajes directos)' })
  @IsOptional()
  @IsUUID()
  recipientId?: string;

  @ApiPropertyOptional({ description: 'ID del grupo destinatario (para mensajes grupales)' })
  @IsOptional()
  @IsUUID()
  targetGroupId?: string;

  @ApiPropertyOptional({ description: 'ID del estudiante relacionado' })
  @IsOptional()
  @IsUUID()
  relatedStudentId?: string;

  @ApiPropertyOptional({ description: 'ID del mensaje padre (para respuestas)' })
  @IsOptional()
  @IsUUID()
  parentMessageId?: string;

  @ApiPropertyOptional({ description: 'ID de la solicitud de asistencia (para mensajes de tipo ATTENDANCE_REQUEST)' })
  @IsOptional()
  @IsUUID()
  attendanceRequestId?: string;
}