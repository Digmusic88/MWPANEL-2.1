import { Rubric } from './rubric.entity';
import { RubricCell } from './rubric-cell.entity';
export declare class RubricCriterion {
    id: string;
    name: string;
    description: string;
    order: number;
    weight: number;
    isActive: boolean;
    rubric: Rubric;
    rubricId: string;
    cells: RubricCell[];
    createdAt: Date;
    updatedAt: Date;
}
