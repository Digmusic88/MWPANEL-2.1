import { CalendarEventType, CalendarEventVisibility } from '../entities/calendar-event.entity';
export declare class CalendarEventQueryDto {
    startDate?: string;
    endDate?: string;
    type?: CalendarEventType;
    visibility?: CalendarEventVisibility;
    classGroupIds?: string[];
    subjectIds?: string[];
    studentId?: string;
    search?: string;
    tags?: string[];
    includeRecurrent?: boolean;
    onlyActive?: boolean;
}
