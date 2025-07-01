import { Task } from './task.entity';
export declare enum AttachmentType {
    INSTRUCTION = "instruction",
    TEMPLATE = "template",
    REFERENCE = "reference",
    EXAMPLE = "example",
    RESOURCE = "resource"
}
export declare class TaskAttachment {
    id: string;
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    path: string;
    type: AttachmentType;
    description: string;
    downloadCount: number;
    isActive: boolean;
    uploadedAt: Date;
    taskId: string;
    task: Task;
    get fileExtension(): string;
    get sizeInMB(): number;
    get isImage(): boolean;
    get isDocument(): boolean;
    get isSpreadsheet(): boolean;
    get isPresentation(): boolean;
}
