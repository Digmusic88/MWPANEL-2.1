import { Message } from './message.entity';
export declare class MessageAttachment {
    id: string;
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    path: string;
    message: Message;
    messageId: string;
    createdAt: Date;
}
