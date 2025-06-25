import { ActivityValuationType } from '../entities/activity.entity';
export declare class CreateActivityDto {
    name: string;
    description?: string;
    assignedDate: string;
    reviewDate?: string;
    classGroupId: string;
    subjectAssignmentId: string;
    valuationType: ActivityValuationType;
    maxScore?: number;
    notifyFamilies: boolean;
    notifyOnHappy?: boolean;
    notifyOnNeutral?: boolean;
    notifyOnSad?: boolean;
    targetStudentIds?: string[];
    isTemplate?: boolean;
}
