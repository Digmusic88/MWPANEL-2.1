import { DayOfWeek } from '../../students/entities/schedule-session.entity';
export declare class UpdateScheduleSessionDto {
    subjectAssignmentId?: string;
    classroomId?: string;
    timeSlotId?: string;
    dayOfWeek?: DayOfWeek;
    academicYearId?: string;
    startDate?: string;
    endDate?: string;
    isActive?: boolean;
    notes?: string;
}
