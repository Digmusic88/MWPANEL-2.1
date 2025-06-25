import { StreamableFile } from '@nestjs/common';
import { Response } from 'express';
import { TasksService } from './tasks.service';
import { CreateTaskDto, UpdateTaskDto, SubmitTaskDto, GradeTaskDto, TaskQueryDto, StudentTaskQueryDto, FamilyTaskQueryDto, TaskStatisticsDto, StudentTaskStatisticsDto } from './dto';
import { Task, TaskSubmission } from './entities';
export declare class TasksController {
    private readonly tasksService;
    constructor(tasksService: TasksService);
    create(createTaskDto: CreateTaskDto, req: any): Promise<Task>;
    findMyTasks(query: TaskQueryDto, req: any): Promise<{
        tasks: Task[];
        total: number;
    }>;
    getTeacherStatistics(req: any): Promise<TaskStatisticsDto>;
    uploadTaskAttachments(id: string, files: Express.Multer.File[], req: any): Promise<{
        message: string;
        files: string[];
    }>;
    downloadTaskAttachment(attachmentId: string, res: Response): Promise<StreamableFile>;
    downloadSubmissionAttachment(attachmentId: string, res: Response): Promise<StreamableFile>;
    deleteTaskAttachment(attachmentId: string, req: any): Promise<void>;
    deleteSubmissionAttachment(attachmentId: string, req: any): Promise<void>;
    update(id: string, updateTaskDto: UpdateTaskDto, req: any): Promise<Task>;
    remove(id: string, req: any): Promise<void>;
    getSubmission(submissionId: string, req: any): Promise<TaskSubmission>;
    gradeSubmission(submissionId: string, gradeDto: GradeTaskDto, req: any): Promise<TaskSubmission>;
    getMyTasks(query: StudentTaskQueryDto, req: any): Promise<{
        tasks: Task[];
        total: number;
    }>;
    getStudentStatistics(req: any): Promise<StudentTaskStatisticsDto>;
    submitTask(id: string, submitDto: SubmitTaskDto, req: any): Promise<TaskSubmission>;
    uploadSubmissionAttachments(submissionId: string, files: Express.Multer.File[], req: any): Promise<{
        message: string;
        files: string[];
    }>;
    getFamilyTasks(query: FamilyTaskQueryDto, req: any): Promise<{
        tasks: Task[];
        total: number;
    }>;
    getFamilyStudentStatistics(studentId: string, req: any): Promise<StudentTaskStatisticsDto>;
    findOne(id: string): Promise<Task>;
    getAllTasks(query: TaskQueryDto): Promise<{
        message: string;
    }>;
    getSystemStatistics(): Promise<{
        totalTasks: number;
        totalSubmissions: number;
        pendingGrading: number;
        overdueTasks: number;
        submissionRate: number;
        averageGradingTime: number;
        lastUpdated: Date;
    }>;
    getAdvancedTeacherStatistics(req: any): Promise<{
        overview: {
            totalTasks: number;
            totalSubmissions: number;
            pendingGrading: number;
            completionRate: number;
        };
        subjectStats: any[];
        studentPerformance: any[];
        timeAnalytics: {
            tasksCreatedLast30Days: number;
            submissionsLast30Days: number;
            averageSubmissionsPerTask: number;
        };
        engagementMetrics: {
            submissionRate: number;
            onTimeRate: number;
            averageAttachmentsPerSubmission: number;
        };
        pendingGrading: TaskSubmission[];
    }>;
    getTaskSubmissionAnalytics(id: string, req: any): Promise<{
        taskInfo: {
            id: string;
            title: string;
            dueDate: Date;
            status: import("./entities").TaskStatus;
            totalStudents: number;
        };
        submissionAnalysis: {
            total: number;
            onTime: number;
            late: number;
            graded: number;
            pending: number;
            notSubmitted: number;
        };
        gradeAnalysis: {
            average: number;
            highest: number;
            lowest: number;
            distribution: {
                label: string;
                min: number;
                max: number;
                count: number;
            }[];
        };
        submissionTimeline: any[];
        recentSubmissions: TaskSubmission[];
    }>;
    getPendingGrading(req: any): Promise<{
        id: string;
        taskTitle: string;
        taskId: string;
        studentName: string;
        studentId: string;
        submittedAt: Date;
        daysPending: number;
        hasAttachments: boolean;
        isLate: boolean;
    }[]>;
    getTestPendingGrading(): Promise<{
        id: string;
        taskTitle: string;
        taskId: string;
        studentName: string;
        studentId: string;
        submittedAt: Date;
        daysPending: number;
        hasAttachments: boolean;
        isLate: boolean;
    }[]>;
    getTestSubmission(submissionId: string): Promise<TaskSubmission>;
    getOverdueTasks(req: any): Promise<{
        id: string;
        title: string;
        dueDate: Date;
        subjectName: string;
        totalStudents: number;
        submittedCount: number;
        missingSubmissions: number;
        completionRate: number;
        daysOverdue: number;
    }[]>;
    sendBulkReminders(body: {
        taskIds: string[];
        message?: string;
    }, req: any): Promise<{
        message: string;
        taskCount: number;
        reminderCount: number;
        sentAt: Date;
    }>;
    getUpcomingDeadlines(req: any): Promise<{
        id: string;
        title: string;
        dueDate: string;
        subject: string;
        classGroup: string;
        submissionCount: number;
        totalStudents: number;
        status: "upcoming" | "due_today" | "overdue";
    }[]>;
}
