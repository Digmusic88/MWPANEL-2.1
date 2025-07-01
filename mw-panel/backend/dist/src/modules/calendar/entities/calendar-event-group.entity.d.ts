import { CalendarEvent } from './calendar-event.entity';
import { ClassGroup } from '../../students/entities/class-group.entity';
export declare class CalendarEventGroup {
    id: string;
    eventId: string;
    event: CalendarEvent;
    classGroupId: string;
    classGroup: ClassGroup;
    createdAt: Date;
}
