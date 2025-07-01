import { AttendanceStatus } from '../entities/attendance-record.entity';
export declare class CreateAttendanceRecordDto {
    studentId: string;
    date: string;
    status: AttendanceStatus;
    justification?: string;
    arrivalTime?: string;
    departureTime?: string;
}
