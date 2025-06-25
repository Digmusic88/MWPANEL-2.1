export declare class ActivityStatisticsDto {
    activityId: string;
    activityName: string;
    totalStudents: number;
    assessedStudents: number;
    pendingStudents: number;
    emojiDistribution?: {
        happy: number;
        neutral: number;
        sad: number;
    };
    scoreStatistics?: {
        average: number;
        min: number;
        max: number;
        maxPossible: number;
    };
    completionPercentage: number;
}
export declare class TeacherActivitySummaryDto {
    todayActivities: number;
    pendingAssessments: number;
    weekAssessments: number;
    positiveRatio: number;
}
