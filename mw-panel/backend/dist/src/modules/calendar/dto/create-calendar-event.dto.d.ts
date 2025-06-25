import { CalendarEventType, CalendarEventVisibility, CalendarEventRecurrence } from '../entities/calendar-event.entity';
export declare class CreateCalendarEventDto {
    title: string;
    description?: string;
    startDate: string;
    endDate: string;
    type: CalendarEventType;
    visibility: CalendarEventVisibility;
    color?: string;
    isAllDay?: boolean;
    location?: string;
    isRecurrent?: boolean;
    recurrenceType?: CalendarEventRecurrence;
    recurrenceEnd?: string;
    attachments?: string[];
    links?: string[];
    tags?: string[];
    priority?: number;
    notifyBefore?: number;
    autoNotify?: boolean;
    relatedTaskId?: string;
    relatedEvaluationId?: string;
    classGroupIds?: string[];
    subjectIds?: string[];
    studentIds?: string[];
}
