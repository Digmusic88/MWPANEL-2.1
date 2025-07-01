import { Repository } from 'typeorm';
import { Evaluation, EvaluationStatus } from './entities/evaluation.entity';
import { CompetencyEvaluation } from './entities/competency-evaluation.entity';
import { EvaluationPeriod } from './entities/evaluation-period.entity';
import { RadarEvaluation } from './entities/radar-evaluation.entity';
import { Student } from '../students/entities/student.entity';
import { Teacher } from '../teachers/entities/teacher.entity';
import { Subject } from '../students/entities/subject.entity';
import { AcademicYear } from '../students/entities/academic-year.entity';
import { Competency } from '../competencies/entities/competency.entity';
export interface CreateEvaluationDto {
    studentId: string;
    teacherId: string;
    subjectId: string;
    periodId: string;
    generalObservations?: string;
    competencyEvaluations: {
        competencyId: string;
        score: number;
        observations?: string;
    }[];
}
export interface UpdateEvaluationDto {
    generalObservations?: string;
    status?: EvaluationStatus;
    competencyEvaluations?: {
        competencyId: string;
        score: number;
        observations?: string;
    }[];
}
export declare class EvaluationsService {
    private evaluationsRepository;
    private competencyEvaluationsRepository;
    private evaluationPeriodsRepository;
    private radarEvaluationsRepository;
    private studentsRepository;
    private teachersRepository;
    private subjectsRepository;
    private academicYearsRepository;
    private competenciesRepository;
    constructor(evaluationsRepository: Repository<Evaluation>, competencyEvaluationsRepository: Repository<CompetencyEvaluation>, evaluationPeriodsRepository: Repository<EvaluationPeriod>, radarEvaluationsRepository: Repository<RadarEvaluation>, studentsRepository: Repository<Student>, teachersRepository: Repository<Teacher>, subjectsRepository: Repository<Subject>, academicYearsRepository: Repository<AcademicYear>, competenciesRepository: Repository<Competency>);
    findAll(): Promise<Evaluation[]>;
    findOne(id: string): Promise<Evaluation>;
    findByStudent(studentId: string): Promise<Evaluation[]>;
    findByTeacher(teacherId: string): Promise<Evaluation[]>;
    create(createEvaluationDto: CreateEvaluationDto): Promise<Evaluation>;
    update(id: string, updateEvaluationDto: UpdateEvaluationDto): Promise<Evaluation>;
    remove(id: string): Promise<void>;
    generateRadarChart(studentId: string, periodId: string): Promise<RadarEvaluation>;
    getRadarChart(studentId: string, periodId: string): Promise<RadarEvaluation>;
    getAllPeriods(): Promise<EvaluationPeriod[]>;
    getActivePeriod(): Promise<EvaluationPeriod>;
    createEvaluationPeriods(): Promise<EvaluationPeriod[]>;
    createTestData(): Promise<any>;
    getEvaluationStats(): Promise<{
        total: number;
        completed: number;
        pending: number;
        overdue: number;
        averageScore: number;
        completionRate: number;
    }>;
}
