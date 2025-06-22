import { SubjectAssignment } from './subject-assignment.entity';
import { Classroom } from './classroom.entity';
import { TimeSlot } from './time-slot.entity';
import { AcademicYear } from './academic-year.entity';
export declare enum DayOfWeek {
    MONDAY = 1,
    TUESDAY = 2,
    WEDNESDAY = 3,
    THURSDAY = 4,
    FRIDAY = 5
}
export declare class ScheduleSession {
    id: string;
    subjectAssignment: SubjectAssignment;
    classroom: Classroom;
    timeSlot: TimeSlot;
    dayOfWeek: DayOfWeek;
    academicYear: AcademicYear;
    startDate: Date;
    endDate: Date;
    isActive: boolean;
    notes: string;
    createdAt: Date;
    updatedAt: Date;
}
