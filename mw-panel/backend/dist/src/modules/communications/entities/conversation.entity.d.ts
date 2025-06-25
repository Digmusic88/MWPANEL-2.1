import { User } from '../../users/entities/user.entity';
import { Message } from './message.entity';
export declare enum ConversationType {
    DIRECT = "direct",
    GROUP = "group"
}
export declare class Conversation {
    id: string;
    title: string;
    type: ConversationType;
    participants: User[];
    messages: Message[];
    lastMessageAt: Date;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
