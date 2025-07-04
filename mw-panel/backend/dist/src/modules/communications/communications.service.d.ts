import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';
import { Notification } from './entities/notification.entity';
import { Conversation } from './entities/conversation.entity';
import { MessageAttachment } from './entities/message-attachment.entity';
import { MessageDeletion } from './entities/message-deletion.entity';
import { User } from '../users/entities/user.entity';
import { ClassGroup } from '../students/entities/class-group.entity';
import { Student } from '../students/entities/student.entity';
import { CreateMessageDto } from './dto/create-message.dto';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
export declare class CommunicationsService {
    private readonly messageRepository;
    private readonly notificationRepository;
    private readonly conversationRepository;
    private readonly attachmentRepository;
    private readonly messageDeletionRepository;
    private readonly userRepository;
    private readonly classGroupRepository;
    private readonly studentRepository;
    private readonly logger;
    constructor(messageRepository: Repository<Message>, notificationRepository: Repository<Notification>, conversationRepository: Repository<Conversation>, attachmentRepository: Repository<MessageAttachment>, messageDeletionRepository: Repository<MessageDeletion>, userRepository: Repository<User>, classGroupRepository: Repository<ClassGroup>, studentRepository: Repository<Student>);
    createMessage(senderId: string, createMessageDto: CreateMessageDto): Promise<Message>;
    findAllMessages(userId: string, filters?: any): Promise<Message[]>;
    findAllMessagesOld(userId: string, filters?: any): Promise<Message[]>;
    findOneMessage(id: string): Promise<Message>;
    updateMessage(id: string, userId: string, updateMessageDto: UpdateMessageDto): Promise<Message>;
    deleteMessage(id: string, userId: string): Promise<void>;
    createNotification(createNotificationDto: CreateNotificationDto): Promise<Notification>;
    findUserNotifications(userId: string, filters?: any): Promise<Notification[]>;
    updateNotification(id: string, userId: string, updateNotificationDto: UpdateNotificationDto): Promise<Notification>;
    getUnreadNotificationsCount(userId: string): Promise<number>;
    markAllNotificationsAsRead(userId: string): Promise<void>;
    deleteNotification(notificationId: string, userId: string): Promise<void>;
    deleteAllNotifications(userId: string): Promise<number>;
    private validateSendPermissions;
    private createMessageNotifications;
    private getGroupUsers;
    getUserMessagingStats(userId: string): Promise<any>;
    getUnreadMessagesCount(userId: string): Promise<number>;
    getAvailableRecipients(userId: string): Promise<any[]>;
    getAvailableGroups(userId: string): Promise<any[]>;
    markAllMessagesAsRead(userId: string): Promise<void>;
    deleteAllMessages(userId: string): Promise<number>;
}
