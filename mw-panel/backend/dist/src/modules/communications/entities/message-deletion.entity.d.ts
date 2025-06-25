import { User } from '../../users/entities/user.entity';
import { Message } from './message.entity';
export declare class MessageDeletion {
    id: string;
    message: Message;
    messageId: string;
    user: User;
    userId: string;
    deletedAt: Date;
}
