import { Repository } from 'typeorm';
import { Task, TaskSubmission, TaskAttachment, TaskSubmissionAttachment, TaskStatus } from './entities';
import { CreateTaskDto, UpdateTaskDto, SubmitTaskDto, GradeTaskDto, TaskQueryDto, StudentTaskQueryDto, FamilyTaskQueryDto, TaskStatisticsDto, StudentTaskStatisticsDto } from './dto';
import { Teacher } from '../teachers/entities/teacher.entity';
import { Student } from '../students/entities/student.entity';
import { SubjectAssignment } from '../students/entities/subject-assignment.entity';
import { Family, FamilyStudent } from '../users/entities/family.entity';
import { User } from '../users/entities/user.entity';
export declare class TasksService {
    private tasksRepository;
    private submissionsRepository;
    private attachmentsRepository;
    private submissionAttachmentsRepository;
    private teachersRepository;
    private studentsRepository;
    private subjectAssignmentsRepository;
    private familiesRepository;
    private familyStudentsRepository;
    private usersRepository;
    constructor(tasksRepository: Repository<Task>, submissionsRepository: Repository<TaskSubmission>, attachmentsRepository: Repository<TaskAttachment>, submissionAttachmentsRepository: Repository<TaskSubmissionAttachment>, teachersRepository: Repository<Teacher>, studentsRepository: Repository<Student>, subjectAssignmentsRepository: Repository<SubjectAssignment>, familiesRepository: Repository<Family>, familyStudentsRepository: Repository<FamilyStudent>, usersRepository: Repository<User>);
    create(createTaskDto: CreateTaskDto, userId: string): Promise<Task>;
    findAllByTeacher(userId: string, query: TaskQueryDto): Promise<{
        tasks: Task[];
        total: number;
    }>;
    findOne(id: string): Promise<Task>;
    update(id: string, updateTaskDto: UpdateTaskDto, userId: string): Promise<Task>;
    remove(id: string, userId: string): Promise<void>;
    getStudentByUserId(userId: string): Promise<Student | null>;
    getTeacherByUserId(userId: string): Promise<Teacher | null>;
    submitTask(taskId: string, submitDto: SubmitTaskDto, userId: string): Promise<TaskSubmission>;
    private resolveStudentIdFromUserId;
    getStudentTasks(userId: string, query: StudentTaskQueryDto): Promise<{
        tasks: Task[];
        total: number;
    }>;
    getSubmission(submissionId: string, userId: string): Promise<TaskSubmission>;
    gradeSubmission(submissionId: string, gradeDto: GradeTaskDto, userId: string): Promise<TaskSubmission>;
    getTeacherStatistics(userId: string): Promise<TaskStatisticsDto>;
    getStudentStatistics(userId: string): Promise<StudentTaskStatisticsDto>;
    private verifyTeacherSubjectAssignmentAccess;
    private createSubmissionRecordsForTask;
    private createNotificationsForExamTask;
    getFamilyTasks(userId: string, query: FamilyTaskQueryDto): Promise<{
        tasks: Task[];
        total: number;
    }>;
    private getFamilyStudentIds;
    uploadTaskAttachments(taskId: string, files: Express.Multer.File[], userId: string, descriptions?: string[]): Promise<void>;
    uploadSubmissionAttachments(submissionId: string, files: Express.Multer.File[], studentId: string, descriptions?: string[]): Promise<void>;
    downloadAttachment(attachmentId: string, type?: 'task' | 'submission'): Promise<{
        filePath: string;
        originalName: string;
    }>;
    deleteTaskAttachment(attachmentId: string, userId: string): Promise<void>;
    deleteSubmissionAttachment(attachmentId: string, studentId: string): Promise<void>;
    getSystemStatistics(): Promise<{
        totalTasks: number;
        totalSubmissions: number;
        pendingGrading: number;
        overdueTasks: number;
        submissionRate: number;
        averageGradingTime: number;
        lastUpdated: Date;
    }>;
    getAdvancedTeacherStatistics(userId: string): Promise<{
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
    getTaskSubmissionAnalytics(taskId: string, teacherId: string): Promise<{
        taskInfo: {
            id: string;
            title: string;
            dueDate: Date;
            status: TaskStatus;
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
    getPendingGrading(teacherId: string): Promise<{
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
    getOverdueTasks(teacherId: string): Promise<{
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
    sendBulkReminders(taskIds: string[], teacherId: string, customMessage?: string): Promise<{
        message: string;
        taskCount: number;
        reminderCount: number;
        sentAt: Date;
    }>;
    private calculateSubjectStatistics;
    private calculateStudentPerformance;
    private calculateTimeAnalytics;
    private calculateEngagementMetrics;
    private calculateGradeDistribution;
    private calculateAverageGradingTime;
    private getFileTypeFromMimeType;
    getUpcomingDeadlines(teacherId: string): Promise<{
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
