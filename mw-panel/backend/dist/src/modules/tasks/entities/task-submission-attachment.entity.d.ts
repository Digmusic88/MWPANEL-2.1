import { TaskSubmission } from './task-submission.entity';
export declare enum SubmissionAttachmentStatus {
    UPLOADED = "uploaded",
    PROCESSING = "processing",
    VALIDATED = "validated",
    REJECTED = "rejected",
    CORRUPTED = "corrupted"
}
export declare class TaskSubmissionAttachment {
    id: string;
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    path: string;
    status: SubmissionAttachmentStatus;
    description: string;
    rejectionReason: string;
    isMainSubmission: boolean;
    version: number;
    isActive: boolean;
    uploadedAt: Date;
    validatedAt: Date;
    submissionId: string;
    submission: TaskSubmission;
    get fileExtension(): string;
    get sizeInMB(): number;
    get isImage(): boolean;
    get isDocument(): boolean;
    get isSpreadsheet(): boolean;
    get isPresentation(): boolean;
    get isVideo(): boolean;
    get isAudio(): boolean;
    get isArchive(): boolean;
    get statusColor(): string;
}
