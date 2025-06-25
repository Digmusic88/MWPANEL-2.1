import { AcademicRecordEntry } from './academic-record-entry.entity';
import { GradeType } from './academic-record.types';
export declare class AcademicRecordGrade {
    id: string;
    gradeType: GradeType;
    name: string;
    description: string;
    earnedPoints: number;
    totalPoints: number;
    weight: number;
    gradeDate: Date;
    dueDate: Date;
    isLate: boolean;
    isExcused: boolean;
    isDropped: boolean;
    teacherComments: string;
    rubricData: string;
    gradedBy: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    entryId: string;
    entry: AcademicRecordEntry;
    get percentage(): number;
    get letterGrade(): string;
    get isPassing(): boolean;
    get weightedPoints(): number;
    get maxWeightedPoints(): number;
}
