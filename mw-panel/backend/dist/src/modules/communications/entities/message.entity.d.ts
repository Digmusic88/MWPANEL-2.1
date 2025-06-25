import { User } from '../../users/entities/user.entity';
import { ClassGroup } from '../../students/entities/class-group.entity';
import { Student } from '../../students/entities/student.entity';
import { MessageAttachment } from './message-attachment.entity';
export declare enum MessageType {
    DIRECT = "direct",
    GROUP = "group",
    ANNOUNCEMENT = "announcement",
    NOTIFICATION = "notification",
    ATTENDANCE_REQUEST = "attendance_request"
}
export declare enum MessagePriority {
    LOW = "low",
    NORMAL = "normal",
    HIGH = "high",
    URGENT = "urgent"
}
export declare enum MessageStatus {
    SENT = "sent",
    DELIVERED = "delivered",
    READ = "read"
}
export declare class Message {
    id: string;
    subject: string;
    content: string;
    type: MessageType;
    priority: MessagePriority;
    status: MessageStatus;
    sender: User;
    senderId: string;
    recipient: User;
    recipientId: string;
    targetGroup: ClassGroup;
    targetGroupId: string;
    relatedStudent: Student;
    relatedStudentId: string;
    parentMessage: Message;
    parentMessageId: string;
    attendanceRequestId: string;
    replies: Message[];
    attachments: MessageAttachment[];
    isRead: boolean;
    readAt: Date;
    isArchived: boolean;
    isDeleted: boolean;
    isDeletedBySender: boolean;
    isDeletedByRecipient: boolean;
    createdAt: Date;
    updatedAt: Date;
}
