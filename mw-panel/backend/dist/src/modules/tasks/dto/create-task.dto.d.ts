import { TaskType, TaskPriority } from '../entities/task.entity';
export declare class CreateTaskDto {
    title: string;
    description?: string;
    instructions?: string;
    taskType: TaskType;
    priority?: TaskPriority;
    assignedDate: string;
    dueDate: string;
    subjectAssignmentId: string;
    maxPoints?: number;
    allowLateSubmission?: boolean;
    latePenalty?: number;
    notifyFamilies?: boolean;
    requiresFile?: boolean;
    allowedFileTypes?: string[];
    maxFileSizeMB?: number;
    rubric?: string;
    targetStudentIds?: string[];
}
