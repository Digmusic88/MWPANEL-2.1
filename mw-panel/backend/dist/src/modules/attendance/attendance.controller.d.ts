import { AttendanceService } from './attendance.service';
import { CreateAttendanceRecordDto, UpdateAttendanceRecordDto, CreateAttendanceRequestDto, ReviewAttendanceRequestDto, BulkMarkPresentDto } from './dto';
import { AttendanceRequestStatus } from './entities/attendance-request.entity';
export declare class AttendanceController {
    private readonly attendanceService;
    constructor(attendanceService: AttendanceService);
    createRecord(req: any, createDto: CreateAttendanceRecordDto): Promise<import("./entities/attendance-record.entity").AttendanceRecord>;
    updateRecord(id: string, req: any, updateDto: UpdateAttendanceRecordDto): Promise<import("./entities/attendance-record.entity").AttendanceRecord>;
    getByGroup(classGroupId: string, date: string): Promise<import("./entities/attendance-record.entity").AttendanceRecord[]>;
    getByStudent(req: any, studentId: string, startDate?: string, endDate?: string): Promise<import("./entities/attendance-record.entity").AttendanceRecord[]>;
    bulkMarkPresent(req: any, bulkDto: BulkMarkPresentDto): Promise<{
        created: number;
        skipped: number;
    }>;
    createRequest(req: any, createDto: CreateAttendanceRequestDto): Promise<import("./entities/attendance-request.entity").AttendanceRequest>;
    reviewRequest(id: string, req: any, reviewDto: ReviewAttendanceRequestDto): Promise<import("./entities/attendance-request.entity").AttendanceRequest>;
    getRequestsByStudent(req: any, studentId: string, status?: AttendanceRequestStatus): Promise<import("./entities/attendance-request.entity").AttendanceRequest[]>;
    getPendingRequestsByGroup(classGroupId: string): Promise<import("./entities/attendance-request.entity").AttendanceRequest[]>;
    getMyRequests(req: any): Promise<import("./entities/attendance-request.entity").AttendanceRequest[]>;
    getMyChildren(req: any): Promise<any[]>;
    getMyChildAttendance(req: any, studentId: string, startDate?: string, endDate?: string): Promise<import("./entities/attendance-record.entity").AttendanceRecord[]>;
    getMyChildRequests(req: any, studentId: string, status?: AttendanceRequestStatus): Promise<import("./entities/attendance-request.entity").AttendanceRequest[]>;
    getGroupStats(classGroupId: string, startDate: string, endDate: string): Promise<any>;
}
