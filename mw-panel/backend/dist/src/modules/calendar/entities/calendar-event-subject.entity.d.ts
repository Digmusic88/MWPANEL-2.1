import { CalendarEvent } from './calendar-event.entity';
import { Subject } from '../../students/entities/subject.entity';
export declare class CalendarEventSubject {
    id: string;
    eventId: string;
    event: CalendarEvent;
    subjectId: string;
    subject: Subject;
    createdAt: Date;
}
