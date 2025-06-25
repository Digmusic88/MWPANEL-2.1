import { User } from '../../users/entities/user.entity';
import { Student } from '../../students/entities/student.entity';
import { ClassGroup } from '../../students/entities/class-group.entity';
export declare enum NotificationType {
    EVALUATION = "evaluation",
    MESSAGE = "message",
    ANNOUNCEMENT = "announcement",
    ACADEMIC = "academic",
    ATTENDANCE = "attendance",
    REMINDER = "reminder",
    SYSTEM = "system"
}
export declare enum NotificationStatus {
    UNREAD = "unread",
    READ = "read",
    DISMISSED = "dismissed"
}
export declare class Notification {
    id: string;
    title: string;
    content: string;
    type: NotificationType;
    status: NotificationStatus;
    user: User;
    userId: string;
    triggeredBy: User;
    triggeredById: string;
    relatedStudent: Student;
    relatedStudentId: string;
    relatedGroup: ClassGroup;
    relatedGroupId: string;
    relatedResourceId: string;
    relatedResourceType: string;
    actionUrl: string;
    readAt: Date;
    dismissedAt: Date;
    createdAt: Date;
    updatedAt: Date;
}
