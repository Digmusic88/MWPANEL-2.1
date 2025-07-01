import { TaskType, TaskStatus, TaskPriority } from '../entities/task.entity';
import { SubmissionStatus } from '../entities/task-submission.entity';
export declare class TaskQueryDto {
    classGroupId?: string;
    subjectAssignmentId?: string;
    taskType?: TaskType;
    status?: TaskStatus;
    priority?: TaskPriority;
    startDate?: string;
    endDate?: string;
    onlyOverdue?: boolean;
    hasPendingSubmissions?: boolean;
    page?: string;
    limit?: string;
    search?: string;
}
export declare class StudentTaskQueryDto {
    submissionStatus?: SubmissionStatus;
    onlyPending?: boolean;
    onlyGraded?: boolean;
    subjectId?: string;
    startDate?: string;
    endDate?: string;
    page?: string;
    limit?: string;
}
export declare class FamilyTaskQueryDto extends StudentTaskQueryDto {
    studentId?: string;
}
