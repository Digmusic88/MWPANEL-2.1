import { AcademicYear } from './academic-year.entity';
export declare enum CalendarEventType {
    HOLIDAY = "holiday",
    EXAM_DAY = "exam_day",
    SPECIAL_EVENT = "special_event",
    NO_CLASSES = "no_classes",
    TEACHER_MEETING = "teacher_meeting",
    PARENT_MEETING = "parent_meeting"
}
export declare class AcademicCalendar {
    id: string;
    academicYear: AcademicYear;
    date: Date;
    type: CalendarEventType;
    name: string;
    description: string;
    affectsClasses: boolean;
    createdAt: Date;
    updatedAt: Date;
}
