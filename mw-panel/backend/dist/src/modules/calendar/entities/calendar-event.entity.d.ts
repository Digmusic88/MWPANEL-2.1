import { User } from '../../users/entities/user.entity';
import { Task } from '../../tasks/entities/task.entity';
import { CalendarEventGroup } from './calendar-event-group.entity';
import { CalendarEventSubject } from './calendar-event-subject.entity';
import { CalendarEventStudent } from './calendar-event-student.entity';
import { CalendarEventReminder } from './calendar-event-reminder.entity';
export declare enum CalendarEventType {
    ACTIVITY = "activity",
    EVALUATION = "evaluation",
    TEST_YOURSELF = "test_yourself",
    GENERAL_EVENT = "general_event",
    HOLIDAY = "holiday",
    MEETING = "meeting",
    EXCURSION = "excursion",
    FESTIVAL = "festival",
    DEADLINE = "deadline",
    REMINDER = "reminder"
}
export declare enum CalendarEventVisibility {
    PUBLIC = "public",
    TEACHERS_ONLY = "teachers_only",
    STUDENTS_ONLY = "students_only",
    FAMILIES_ONLY = "families_only",
    ADMIN_ONLY = "admin_only",
    CLASS_SPECIFIC = "class_specific",
    SUBJECT_SPECIFIC = "subject_specific",
    PRIVATE = "private"
}
export declare enum CalendarEventRecurrence {
    NONE = "none",
    DAILY = "daily",
    WEEKLY = "weekly",
    MONTHLY = "monthly",
    YEARLY = "yearly"
}
export declare class CalendarEvent {
    id: string;
    title: string;
    description: string;
    startDate: Date;
    endDate: Date;
    type: CalendarEventType;
    visibility: CalendarEventVisibility;
    color: string;
    isAllDay: boolean;
    location: string;
    isRecurrent: boolean;
    recurrenceType: CalendarEventRecurrence;
    recurrenceEnd: Date;
    attachments: string[];
    links: string[];
    tags: string[];
    priority: number;
    isActive: boolean;
    notifyBefore: number;
    autoNotify: boolean;
    createdById: string;
    createdBy: User;
    lastModifiedById: string;
    lastModifiedBy: User;
    relatedTaskId: string;
    relatedTask: Task;
    relatedEvaluationId: string;
    eventGroups: CalendarEventGroup[];
    eventSubjects: CalendarEventSubject[];
    eventStudents: CalendarEventStudent[];
    reminders: CalendarEventReminder[];
    createdAt: Date;
    updatedAt: Date;
}
