export declare class CreateRubricAssessmentCriterionDto {
    criterionId: string;
    levelId: string;
    cellId: string;
    comments?: string;
}
export declare class CreateRubricAssessmentDto {
    activityAssessmentId: string;
    rubricId: string;
    studentId: string;
    comments?: string;
    criterionAssessments: CreateRubricAssessmentCriterionDto[];
}
export declare class UpdateRubricAssessmentDto {
    comments?: string;
    criterionAssessments?: CreateRubricAssessmentCriterionDto[];
}
export declare class RubricAssessmentResponseDto {
    id: string;
    totalScore: number;
    maxPossibleScore: number;
    percentage: number;
    comments: string;
    isComplete: boolean;
    criterionAssessments: any[];
    student: any;
    rubric: any;
}
