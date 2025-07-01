import { EvaluationsService, CreateEvaluationDto, UpdateEvaluationDto } from './evaluations.service';
export declare const IS_PUBLIC_KEY = "isPublic";
export declare const Public: () => import("@nestjs/common").CustomDecorator<string>;
export declare class EvaluationsController {
    private readonly evaluationsService;
    constructor(evaluationsService: EvaluationsService);
    findAll(): Promise<import("./entities/evaluation.entity").Evaluation[]>;
    getStats(): Promise<{
        total: number;
        completed: number;
        pending: number;
        overdue: number;
        averageScore: number;
        completionRate: number;
    }>;
    findByStudent(studentId: string): Promise<import("./entities/evaluation.entity").Evaluation[]>;
    findByTeacher(teacherId: string): Promise<import("./entities/evaluation.entity").Evaluation[]>;
    getRadarChart(studentId: string, periodId: string): Promise<import("./entities/radar-evaluation.entity").RadarEvaluation>;
    generateRadarChart(studentId: string, periodId: string): Promise<import("./entities/radar-evaluation.entity").RadarEvaluation>;
    getAllPeriods(): Promise<import("./entities/evaluation-period.entity").EvaluationPeriod[]>;
    getActivePeriod(): Promise<import("./entities/evaluation-period.entity").EvaluationPeriod>;
    createEvaluationPeriods(): Promise<import("./entities/evaluation-period.entity").EvaluationPeriod[]>;
    createTestData(): Promise<any>;
    initPeriods(): Promise<import("./entities/evaluation-period.entity").EvaluationPeriod[]>;
    findOne(id: string): Promise<import("./entities/evaluation.entity").Evaluation>;
    create(createEvaluationDto: CreateEvaluationDto): Promise<import("./entities/evaluation.entity").Evaluation>;
    update(id: string, updateEvaluationDto: UpdateEvaluationDto): Promise<import("./entities/evaluation.entity").Evaluation>;
    remove(id: string): Promise<void>;
}
