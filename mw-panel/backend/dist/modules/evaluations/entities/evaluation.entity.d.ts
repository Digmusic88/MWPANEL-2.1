import { Student } from '../../students/entities/student.entity';
import { Subject } from '../../students/entities/subject.entity';
import { Teacher } from '../../teachers/entities/teacher.entity';
import { EvaluationPeriod } from './evaluation-period.entity';
import { CompetencyEvaluation } from './competency-evaluation.entity';
export declare enum EvaluationStatus {
    DRAFT = "draft",
    SUBMITTED = "submitted",
    REVIEWED = "reviewed",
    FINALIZED = "finalized"
}
export declare class Evaluation {
    id: string;
    student: Student;
    subject: Subject;
    teacher: Teacher;
    period: EvaluationPeriod;
    status: EvaluationStatus;
    generalObservations: string;
    overallScore: number;
    competencyEvaluations: CompetencyEvaluation[];
    createdAt: Date;
    updatedAt: Date;
}
