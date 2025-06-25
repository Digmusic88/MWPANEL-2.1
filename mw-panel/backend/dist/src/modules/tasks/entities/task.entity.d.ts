import { Teacher } from '../../teachers/entities/teacher.entity';
import { SubjectAssignment } from '../../students/entities/subject-assignment.entity';
import { TaskSubmission } from './task-submission.entity';
import { TaskAttachment } from './task-attachment.entity';
export declare enum TaskType {
    ASSIGNMENT = "assignment",
    PROJECT = "project",
    EXAM = "exam",
    HOMEWORK = "homework",
    RESEARCH = "research",
    PRESENTATION = "presentation",
    QUIZ = "quiz"
}
export declare enum TaskStatus {
    DRAFT = "draft",
    PUBLISHED = "published",
    CLOSED = "closed",
    ARCHIVED = "archived"
}
export declare enum TaskPriority {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    URGENT = "urgent"
}
export declare class Task {
    id: string;
    title: string;
    description: string;
    instructions: string;
    taskType: TaskType;
    status: TaskStatus;
    priority: TaskPriority;
    assignedDate: Date;
    dueDate: Date;
    publishedAt: Date;
    closedAt: Date;
    maxPoints: number;
    allowLateSubmission: boolean;
    latePenalty: number;
    notifyFamilies: boolean;
    requiresFile: boolean;
    allowedFileTypes: string;
    maxFileSize: number;
    rubric: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    teacherId: string;
    teacher: Teacher;
    subjectAssignmentId: string;
    subjectAssignment: SubjectAssignment;
    submissions: TaskSubmission[];
    attachments: TaskAttachment[];
    get isOverdue(): boolean;
    get submissionCount(): number;
    get gradedSubmissionCount(): number;
}
