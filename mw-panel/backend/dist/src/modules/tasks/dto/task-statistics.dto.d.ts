export declare class TaskStatisticsDto {
    totalTasks: number;
    publishedTasks: number;
    draftTasks: number;
    closedTasks: number;
    overdueTasks: number;
    totalSubmissions: number;
    gradedSubmissions: number;
    pendingSubmissions: number;
    lateSubmissions: number;
    averageGrade: number;
    submissionRate: number;
}
export declare class StudentTaskStatisticsDto {
    totalAssigned: number;
    submitted: number;
    pending: number;
    graded: number;
    lateSubmissions: number;
    averageGrade: number;
    submissionRate: number;
    nextDueDate?: Date;
}
export declare class SubjectTaskSummaryDto {
    subjectId: string;
    subjectName: string;
    subjectCode: string;
    totalTasks: number;
    pendingTasks: number;
    completedTasks: number;
    averageGrade: number;
    lastTaskDate?: Date;
    nextDueDate?: Date;
}
