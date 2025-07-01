import { Rubric } from './rubric.entity';
import { RubricCell } from './rubric-cell.entity';
export declare class RubricLevel {
    id: string;
    name: string;
    description: string;
    order: number;
    scoreValue: number;
    color: string;
    isActive: boolean;
    rubric: Rubric;
    rubricId: string;
    cells: RubricCell[];
    createdAt: Date;
    updatedAt: Date;
}
