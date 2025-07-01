import { RubricAssessment } from './rubric-assessment.entity';
import { RubricCriterion } from './rubric-criterion.entity';
import { RubricLevel } from './rubric-level.entity';
import { RubricCell } from './rubric-cell.entity';
export declare class RubricAssessmentCriterion {
    id: string;
    score: number;
    weightedScore: number;
    comments: string;
    isActive: boolean;
    rubricAssessment: RubricAssessment;
    rubricAssessmentId: string;
    criterion: RubricCriterion;
    criterionId: string;
    selectedLevel: RubricLevel;
    levelId: string;
    selectedCell: RubricCell;
    cellId: string;
    createdAt: Date;
    updatedAt: Date;
}
