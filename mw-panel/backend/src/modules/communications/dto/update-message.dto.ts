import { PartialType } from '@nestjs/swagger';
import { CreateMessageDto } from './create-message.dto';
import { IsOptional, IsBoolean, IsEnum } from 'class-validator';
import { MessageStatus } from '../entities/message.entity';

export class UpdateMessageDto extends PartialType(CreateMessageDto) {
  @IsOptional()
  @IsEnum(MessageStatus)
  status?: MessageStatus;

  @IsOptional()
  @IsBoolean()
  isRead?: boolean;

  @IsOptional()
  @IsBoolean()
  isArchived?: boolean;

  @IsOptional()
  @IsBoolean()
  isDeleted?: boolean;
}