import { Student } from '../../students/entities/student.entity';
import { AcademicRecordEntry } from './academic-record-entry.entity';
import { AcademicYear, RecordStatus } from './academic-record.types';
export declare class AcademicRecord {
    id: string;
    academicYear: AcademicYear;
    status: RecordStatus;
    finalGPA: number;
    totalCredits: number;
    completedCredits: number;
    absences: number;
    tardiness: number;
    observations: string;
    achievements: string;
    disciplinaryRecords: string;
    startDate: Date;
    endDate: Date;
    isPromoted: boolean;
    promotionNotes: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    studentId: string;
    student: Student;
    entries: AcademicRecordEntry[];
    get completionPercentage(): number;
    get attendancePercentage(): number;
    get isYearComplete(): boolean;
}
