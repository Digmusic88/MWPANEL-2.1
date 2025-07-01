import { Task } from './task.entity';
import { Student } from '../../students/entities/student.entity';
import { TaskSubmissionAttachment } from './task-submission-attachment.entity';
export declare enum SubmissionStatus {
    NOT_SUBMITTED = "not_submitted",
    SUBMITTED = "submitted",
    LATE = "late",
    GRADED = "graded",
    RETURNED = "returned",
    RESUBMITTED = "resubmitted"
}
export declare class TaskSubmission {
    id: string;
    content: string;
    status: SubmissionStatus;
    submittedAt: Date;
    firstSubmittedAt: Date;
    gradedAt: Date;
    returnedAt: Date;
    grade: number;
    finalGrade: number;
    teacherFeedback: string;
    privateNotes: string;
    isLate: boolean;
    isGraded: boolean;
    needsRevision: boolean;
    attemptNumber: number;
    revisionCount: number;
    submissionNotes: string;
    isExamNotification: boolean;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    taskId: string;
    task: Task;
    studentId: string;
    student: Student;
    attachments: TaskSubmissionAttachment[];
    get wasSubmittedLate(): boolean;
    get daysSinceSubmission(): number;
    get hasAttachments(): boolean;
    get gradePercentage(): number;
}
