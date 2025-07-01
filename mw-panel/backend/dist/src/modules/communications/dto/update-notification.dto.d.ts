import { CreateNotificationDto } from './create-notification.dto';
import { NotificationStatus } from '../entities/notification.entity';
declare const UpdateNotificationDto_base: import("@nestjs/common").Type<Partial<CreateNotificationDto>>;
export declare class UpdateNotificationDto extends UpdateNotificationDto_base {
    status?: NotificationStatus;
}
export {};
