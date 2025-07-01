import { AttendanceRequestStatus } from '../entities/attendance-request.entity';
export declare class ReviewAttendanceRequestDto {
    status: AttendanceRequestStatus.APPROVED | AttendanceRequestStatus.REJECTED;
    reviewNote?: string;
}
