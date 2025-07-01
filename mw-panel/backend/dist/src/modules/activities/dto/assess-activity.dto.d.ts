export declare class AssessActivityDto {
    value: string;
    comment?: string;
}
export declare class BulkAssessActivityDto {
    value: string;
    comment?: string;
    studentIds?: string[];
}
export declare class AssessmentResponseDto {
    id: string;
    value: string;
    comment?: string;
    assessedAt: Date;
    isAssessed: boolean;
    studentId: string;
    activityId: string;
}
