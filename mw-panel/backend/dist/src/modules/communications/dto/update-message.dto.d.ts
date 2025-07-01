import { CreateMessageDto } from './create-message.dto';
import { MessageStatus } from '../entities/message.entity';
declare const UpdateMessageDto_base: import("@nestjs/common").Type<Partial<CreateMessageDto>>;
export declare class UpdateMessageDto extends UpdateMessageDto_base {
    status?: MessageStatus;
    isRead?: boolean;
    isArchived?: boolean;
    isDeleted?: boolean;
}
export {};
