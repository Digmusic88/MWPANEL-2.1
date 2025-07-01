import { AcademicYear, AcademicPeriod, RecordStatus, EntryType, GradeType } from '../entities/academic-record.types';
export declare class CreateAcademicRecordDto {
    studentId: string;
    academicYear: AcademicYear;
    status?: RecordStatus;
    totalCredits?: number;
    startDate?: string;
    endDate?: string;
    observations?: string;
}
export declare class UpdateAcademicRecordDto {
    status?: RecordStatus;
    finalGPA?: number;
    completedCredits?: number;
    absences?: number;
    tardiness?: number;
    isPromoted?: boolean;
    promotionNotes?: string;
    observations?: string;
    achievements?: string;
}
export declare class CreateAcademicRecordEntryDto {
    academicRecordId: string;
    type: EntryType;
    period: AcademicPeriod;
    title: string;
    description?: string;
    entryDate: string;
    subjectAssignmentId?: string;
    numericValue?: number;
    letterGrade?: string;
    comments?: string;
    credits?: number;
    isPassing?: boolean;
}
export declare class UpdateAcademicRecordEntryDto {
    title?: string;
    description?: string;
    numericValue?: number;
    letterGrade?: string;
    comments?: string;
    isPassing?: boolean;
    isExempt?: boolean;
}
export declare class CreateAcademicRecordGradeDto {
    entryId: string;
    gradeType: GradeType;
    name: string;
    description?: string;
    earnedPoints: number;
    totalPoints: number;
    weight?: number;
    gradeDate: string;
    dueDate?: string;
    teacherComments?: string;
}
export declare class UpdateAcademicRecordGradeDto {
    earnedPoints?: number;
    teacherComments?: string;
    isLate?: boolean;
    isExcused?: boolean;
    isDropped?: boolean;
}
export declare class AcademicRecordQueryDto {
    academicYear?: AcademicYear;
    status?: RecordStatus;
    page?: string;
    limit?: string;
}
