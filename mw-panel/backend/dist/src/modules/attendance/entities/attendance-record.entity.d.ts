import { Student } from '../../students/entities/student.entity';
import { User } from '../../users/entities/user.entity';
import { AttendanceRequest } from './attendance-request.entity';
export declare enum AttendanceStatus {
    PRESENT = "present",
    ABSENT = "absent",
    LATE = "late",
    EARLY_DEPARTURE = "early_departure",
    JUSTIFIED_ABSENCE = "justified_absence"
}
export declare class AttendanceRecord {
    id: string;
    studentId: string;
    student: Student;
    date: Date;
    status: AttendanceStatus;
    justification?: string;
    approvedRequestId?: string;
    approvedRequest?: AttendanceRequest;
    markedById: string;
    markedBy: User;
    markedAt: Date;
    arrivalTime?: string;
    departureTime?: string;
    createdAt: Date;
    updatedAt: Date;
}
