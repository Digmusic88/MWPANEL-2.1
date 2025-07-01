export declare class SubjectActivitySummaryDto {
    subjectAssignmentId: string;
    subjectName: string;
    subjectCode: string;
    classGroupName: string;
    totalActivities: number;
    activeActivities: number;
    archivedActivities: number;
    templatesCount: number;
    pendingAssessments: number;
    weekCompletedAssessments: number;
    positiveRatio: number;
    lastActivityDate?: Date;
}
