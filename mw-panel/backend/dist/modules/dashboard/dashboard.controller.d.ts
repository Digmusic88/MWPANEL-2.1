import { DashboardService } from './dashboard.service';
export declare class DashboardController {
    private readonly dashboardService;
    constructor(dashboardService: DashboardService);
    getStats(): Promise<{
        totalStudents: number;
        totalTeachers: number;
        totalClasses: number;
        completedEvaluations: number;
        pendingEvaluations: number;
        averageGrade: number;
        levelDistribution: {
            infantil: number;
            primaria: number;
            secundaria: number;
            other: number;
        };
        lastUpdated: Date;
    }>;
}
