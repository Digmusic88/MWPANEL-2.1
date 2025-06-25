import { CommunicationsService } from './communications.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
export declare class CommunicationsController {
    private readonly communicationsService;
    constructor(communicationsService: CommunicationsService);
    createMessage(req: any, createMessageDto: CreateMessageDto): Promise<import("./entities/message.entity").Message>;
    findAllMessages(req: any, filters: any): Promise<import("./entities/message.entity").Message[]>;
    getUnreadMessagesCount(req: any): Promise<{
        count: number;
    }>;
    findOneMessage(id: string): Promise<import("./entities/message.entity").Message>;
    updateMessage(id: string, req: any, updateMessageDto: UpdateMessageDto): Promise<import("./entities/message.entity").Message>;
    deleteMessage(id: string, req: any): Promise<void>;
    markAllMessagesAsRead(req: any): Promise<{
        message: string;
    }>;
    deleteAllMessages(req: any): Promise<{
        message: string;
        deletedCount: number;
    }>;
    createNotification(createNotificationDto: CreateNotificationDto): Promise<import("./entities/notification.entity").Notification>;
    findUserNotifications(req: any, filters: any): Promise<import("./entities/notification.entity").Notification[]>;
    updateNotification(id: string, req: any, updateNotificationDto: UpdateNotificationDto): Promise<import("./entities/notification.entity").Notification>;
    getUnreadNotificationsCount(req: any): Promise<{
        count: number;
    }>;
    markAllNotificationsAsRead(req: any): Promise<{
        message: string;
    }>;
    deleteNotification(id: string, req: any): Promise<{
        message: string;
    }>;
    deleteAllNotifications(req: any): Promise<{
        message: string;
        deletedCount: number;
    }>;
    getUserMessagingStats(req: any): Promise<any>;
    getAvailableRecipients(req: any): Promise<any[]>;
    getAvailableGroups(req: any): Promise<any[]>;
    sendGroupMessage(req: any, groupId: string, createMessageDto: Omit<CreateMessageDto, 'targetGroupId'>): Promise<import("./entities/message.entity").Message>;
    createBulkNotifications(data: {
        userIds: string[];
        notification: Omit<CreateNotificationDto, 'userId'>;
    }): Promise<{
        total: number;
        successful: number;
        failed: number;
        results: any[];
    }>;
}
