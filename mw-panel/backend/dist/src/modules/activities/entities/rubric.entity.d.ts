import { Teacher } from '../../teachers/entities/teacher.entity';
import { SubjectAssignment } from '../../students/entities/subject-assignment.entity';
import { RubricCriterion } from './rubric-criterion.entity';
import { RubricLevel } from './rubric-level.entity';
import { RubricCell } from './rubric-cell.entity';
export declare enum RubricStatus {
    DRAFT = "draft",
    ACTIVE = "active",
    ARCHIVED = "archived"
}
export declare class Rubric {
    id: string;
    name: string;
    description: string;
    status: RubricStatus;
    isTemplate: boolean;
    isActive: boolean;
    isVisibleToFamilies: boolean;
    criteriaCount: number;
    levelsCount: number;
    maxScore: number;
    importSource: string;
    originalImportData: string;
    teacher: Teacher;
    teacherId: string;
    subjectAssignment: SubjectAssignment;
    subjectAssignmentId: string;
    sharedWith: string[];
    criteria: RubricCriterion[];
    levels: RubricLevel[];
    cells: RubricCell[];
    createdAt: Date;
    updatedAt: Date;
}
