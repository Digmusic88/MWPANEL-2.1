import { ActivityAssessment } from './activity-assessment.entity';
import { Rubric } from './rubric.entity';
import { Student } from '../../students/entities/student.entity';
import { RubricAssessmentCriterion } from './rubric-assessment-criterion.entity';
export declare class RubricAssessment {
    id: string;
    totalScore: number;
    maxPossibleScore: number;
    percentage: number;
    comments: string;
    isComplete: boolean;
    isActive: boolean;
    activityAssessment: ActivityAssessment;
    activityAssessmentId: string;
    rubric: Rubric;
    rubricId: string;
    student: Student;
    studentId: string;
    criterionAssessments: RubricAssessmentCriterion[];
    createdAt: Date;
    updatedAt: Date;
}
