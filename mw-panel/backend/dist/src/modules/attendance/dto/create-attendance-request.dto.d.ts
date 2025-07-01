import { AttendanceRequestType } from '../entities/attendance-request.entity';
export declare class CreateAttendanceRequestDto {
    studentId: string;
    type: AttendanceRequestType;
    date: string;
    reason: string;
    expectedArrivalTime?: string;
    expectedDepartureTime?: string;
}
