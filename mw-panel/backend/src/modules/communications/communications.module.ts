import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommunicationsService } from './communications.service';
import { CommunicationsController } from './communications.controller';
import { Message } from './entities/message.entity';
import { Notification } from './entities/notification.entity';
import { Conversation } from './entities/conversation.entity';
import { MessageAttachment } from './entities/message-attachment.entity';
import { MessageDeletion } from './entities/message-deletion.entity';
import { User } from '../users/entities/user.entity';
import { ClassGroup } from '../students/entities/class-group.entity';
import { Student } from '../students/entities/student.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Message,
      Notification,
      Conversation,
      MessageAttachment,
      MessageDeletion,
      User,
      ClassGroup,
      Student,
    ]),
  ],
  controllers: [CommunicationsController],
  providers: [CommunicationsService],
  exports: [CommunicationsService],
})
export class CommunicationsModule {}