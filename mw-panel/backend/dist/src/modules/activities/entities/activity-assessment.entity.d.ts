import { Activity } from './activity.entity';
import { Student } from '../../students/entities/student.entity';
import { User } from '../../users/entities/user.entity';
export declare enum EmojiValue {
    HAPPY = "happy",
    NEUTRAL = "neutral",
    SAD = "sad"
}
export declare class ActivityAssessment {
    id: string;
    value?: string;
    comment?: string;
    assessedAt?: Date;
    notifiedAt?: Date;
    isAssessed: boolean;
    activityId: string;
    studentId: string;
    assessedById?: string;
    activity: Activity;
    student: Student;
    assessedBy: User;
    createdAt: Date;
    updatedAt: Date;
}
