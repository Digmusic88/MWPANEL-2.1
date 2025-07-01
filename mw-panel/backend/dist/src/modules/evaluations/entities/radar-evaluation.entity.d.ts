import { Student } from '../../students/entities/student.entity';
import { EvaluationPeriod } from './evaluation-period.entity';
export declare class RadarEvaluation {
    id: string;
    student: Student;
    period: EvaluationPeriod;
    data: {
        competencies: Array<{
            code: string;
            name: string;
            score: number;
            maxScore: number;
            observations?: string;
        }>;
        overallScore: number;
        date: Date;
    };
    generatedAt: Date;
}
