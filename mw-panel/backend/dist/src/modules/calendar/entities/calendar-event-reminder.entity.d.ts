import { CalendarEvent } from './calendar-event.entity';
import { User } from '../../users/entities/user.entity';
export declare class CalendarEventReminder {
    id: string;
    eventId: string;
    event: CalendarEvent;
    userId: string;
    user: User;
    reminderTime: Date;
    isSent: boolean;
    message: string;
    type: string;
    createdAt: Date;
    sentAt: Date;
}
