import { Repository } from 'typeorm';
import { AttendanceRecord } from './entities/attendance-record.entity';
import { AttendanceRequest, AttendanceRequestStatus } from './entities/attendance-request.entity';
import { Student } from '../students/entities/student.entity';
import { User } from '../users/entities/user.entity';
import { ClassGroup } from '../students/entities/class-group.entity';
import { Family, FamilyStudent } from '../users/entities/family.entity';
import { CommunicationsService } from '../communications/communications.service';
import { CreateAttendanceRecordDto, UpdateAttendanceRecordDto, CreateAttendanceRequestDto, ReviewAttendanceRequestDto, BulkMarkPresentDto } from './dto';
export declare class AttendanceService {
    private readonly attendanceRecordRepository;
    private readonly attendanceRequestRepository;
    private readonly studentRepository;
    private readonly userRepository;
    private readonly classGroupRepository;
    private readonly familyRepository;
    private readonly familyStudentRepository;
    private readonly communicationsService;
    constructor(attendanceRecordRepository: Repository<AttendanceRecord>, attendanceRequestRepository: Repository<AttendanceRequest>, studentRepository: Repository<Student>, userRepository: Repository<User>, classGroupRepository: Repository<ClassGroup>, familyRepository: Repository<Family>, familyStudentRepository: Repository<FamilyStudent>, communicationsService: CommunicationsService);
    createAttendanceRecord(createDto: CreateAttendanceRecordDto, userId: string): Promise<AttendanceRecord>;
    updateAttendanceRecord(id: string, updateDto: UpdateAttendanceRecordDto, userId: string): Promise<AttendanceRecord>;
    getAttendanceByGroup(classGroupId: string, date: string): Promise<AttendanceRecord[]>;
    getAttendanceByStudent(studentId: string, startDate?: string, endDate?: string, requestingUserId?: string, requestingUserRole?: string): Promise<AttendanceRecord[]>;
    bulkMarkPresent(bulkDto: BulkMarkPresentDto, userId: string): Promise<{
        created: number;
        skipped: number;
    }>;
    createAttendanceRequest(createDto: CreateAttendanceRequestDto, userId: string): Promise<AttendanceRequest>;
    reviewAttendanceRequest(id: string, reviewDto: ReviewAttendanceRequestDto, userId: string): Promise<AttendanceRequest>;
    private applyApprovedRequest;
    getRequestsByStudent(studentId: string, status?: AttendanceRequestStatus, requestingUserId?: string, requestingUserRole?: string): Promise<AttendanceRequest[]>;
    getPendingRequestsByGroup(classGroupId: string): Promise<AttendanceRequest[]>;
    getRequestsByUser(userId: string): Promise<AttendanceRequest[]>;
    getAttendanceStats(classGroupId: string, startDate: string, endDate: string): Promise<any>;
    private sendAttendanceReviewNotification;
    private getRequestTypeText;
    getFamilyChildren(familyUserId: string): Promise<any[]>;
    private verifyFamilyStudentAccess;
}
