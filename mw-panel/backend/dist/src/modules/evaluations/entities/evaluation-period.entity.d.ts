import { AcademicYear } from '../../students/entities/academic-year.entity';
export declare enum PeriodType {
    CONTINUOUS = "continuous",
    TRIMESTER_1 = "trimester_1",
    TRIMESTER_2 = "trimester_2",
    TRIMESTER_3 = "trimester_3",
    FINAL = "final",
    EXTRAORDINARY = "extraordinary"
}
export declare class EvaluationPeriod {
    id: string;
    name: string;
    type: PeriodType;
    startDate: Date;
    endDate: Date;
    academicYear: AcademicYear;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
