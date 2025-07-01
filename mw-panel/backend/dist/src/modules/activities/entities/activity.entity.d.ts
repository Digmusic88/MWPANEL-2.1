import { ClassGroup } from '../../students/entities/class-group.entity';
import { Teacher } from '../../teachers/entities/teacher.entity';
import { SubjectAssignment } from '../../students/entities/subject-assignment.entity';
import { ActivityAssessment } from './activity-assessment.entity';
import { Rubric } from './rubric.entity';
export declare enum ActivityValuationType {
    EMOJI = "emoji",
    SCORE = "score",
    RUBRIC = "rubric"
}
export declare class Activity {
    id: string;
    name: string;
    description?: string;
    assignedDate: Date;
    reviewDate?: Date;
    valuationType: ActivityValuationType;
    maxScore?: number;
    notifyFamilies: boolean;
    notifyOnHappy: boolean;
    notifyOnNeutral: boolean;
    notifyOnSad: boolean;
    isActive: boolean;
    isArchived: boolean;
    isTemplate: boolean;
    classGroupId: string;
    teacherId: string;
    subjectAssignmentId: string;
    rubricId?: string;
    classGroup: ClassGroup;
    teacher: Teacher;
    subjectAssignment: SubjectAssignment;
    assessments: ActivityAssessment[];
    rubric?: Rubric;
    createdAt: Date;
    updatedAt: Date;
}
