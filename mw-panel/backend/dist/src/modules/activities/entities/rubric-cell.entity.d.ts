import { Rubric } from './rubric.entity';
import { RubricCriterion } from './rubric-criterion.entity';
import { RubricLevel } from './rubric-level.entity';
export declare class RubricCell {
    id: string;
    content: string;
    isActive: boolean;
    rubric: Rubric;
    rubricId: string;
    criterion: RubricCriterion;
    criterionId: string;
    level: RubricLevel;
    levelId: string;
    createdAt: Date;
    updatedAt: Date;
}
