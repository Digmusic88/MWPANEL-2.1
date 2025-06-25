import { ActivityAssessment } from './activity-assessment.entity';
import { Family } from '../../users/entities/family.entity';
export declare class ActivityNotification {
    id: string;
    viewedAt?: Date;
    assessmentId: string;
    familyId: string;
    assessment: ActivityAssessment;
    family: Family;
    createdAt: Date;
}
