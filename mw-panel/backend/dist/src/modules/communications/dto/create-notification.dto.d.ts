import { NotificationType } from '../entities/notification.entity';
export declare class CreateNotificationDto {
    title: string;
    content: string;
    type: NotificationType;
    userId: string;
    triggeredById?: string;
    relatedStudentId?: string;
    relatedGroupId?: string;
    relatedResourceId?: string;
    relatedResourceType?: string;
    actionUrl?: string;
}
