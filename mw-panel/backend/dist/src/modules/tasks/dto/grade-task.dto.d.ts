export declare class GradeTaskDto {
    grade: number;
    teacherFeedback?: string;
    privateNotes?: string;
    needsRevision?: boolean;
}
export declare class BulkGradeTaskDto {
    grades: Array<{
        submissionId: string;
        grade: number;
        teacherFeedback?: string;
        privateNotes?: string;
        needsRevision?: boolean;
    }>;
}
export declare class ReturnTaskDto {
    returnReason: string;
    additionalComments?: string;
}
