import { Evaluation } from './evaluation.entity';
import { Competency } from '../../competencies/entities/competency.entity';
export declare class CompetencyEvaluation {
    id: string;
    evaluation: Evaluation;
    competency: Competency;
    score: number;
    observations: string;
    createdAt: Date;
    updatedAt: Date;
}
