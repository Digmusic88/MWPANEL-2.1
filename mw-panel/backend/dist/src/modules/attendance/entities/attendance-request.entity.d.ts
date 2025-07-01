import { Student } from '../../students/entities/student.entity';
import { User } from '../../users/entities/user.entity';
export declare enum AttendanceRequestType {
    ABSENCE = "absence",
    LATE_ARRIVAL = "late_arrival",
    EARLY_DEPARTURE = "early_departure"
}
export declare enum AttendanceRequestStatus {
    PENDING = "pending",
    APPROVED = "approved",
    REJECTED = "rejected",
    CANCELLED = "cancelled"
}
export declare class AttendanceRequest {
    id: string;
    studentId: string;
    student: Student;
    requestedById: string;
    requestedBy: User;
    type: AttendanceRequestType;
    date: Date;
    reason: string;
    status: AttendanceRequestStatus;
    reviewedById?: string;
    reviewedBy?: User;
    reviewedAt?: Date;
    reviewNote?: string;
    expectedArrivalTime?: string;
    expectedDepartureTime?: string;
    messageId?: string;
    createdAt: Date;
    updatedAt: Date;
}
