import { CalendarEvent } from './calendar-event.entity';
import { Student } from '../../students/entities/student.entity';
export declare class CalendarEventStudent {
    id: string;
    eventId: string;
    event: CalendarEvent;
    studentId: string;
    student: Student;
    isVisible: boolean;
    createdAt: Date;
}
