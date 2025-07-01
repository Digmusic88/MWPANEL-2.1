import { MessageType, MessagePriority } from '../entities/message.entity';
export declare class CreateMessageDto {
    subject: string;
    content: string;
    type?: MessageType;
    priority?: MessagePriority;
    recipientId?: string;
    targetGroupId?: string;
    relatedStudentId?: string;
    parentMessageId?: string;
    attendanceRequestId?: string;
}
