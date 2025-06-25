"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttendanceService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const attendance_record_entity_1 = require("./entities/attendance-record.entity");
const attendance_request_entity_1 = require("./entities/attendance-request.entity");
const student_entity_1 = require("../students/entities/student.entity");
const user_entity_1 = require("../users/entities/user.entity");
const class_group_entity_1 = require("../students/entities/class-group.entity");
const family_entity_1 = require("../users/entities/family.entity");
const communications_service_1 = require("../communications/communications.service");
const message_entity_1 = require("../communications/entities/message.entity");
let AttendanceService = class AttendanceService {
    constructor(attendanceRecordRepository, attendanceRequestRepository, studentRepository, userRepository, classGroupRepository, familyRepository, familyStudentRepository, communicationsService) {
        this.attendanceRecordRepository = attendanceRecordRepository;
        this.attendanceRequestRepository = attendanceRequestRepository;
        this.studentRepository = studentRepository;
        this.userRepository = userRepository;
        this.classGroupRepository = classGroupRepository;
        this.familyRepository = familyRepository;
        this.familyStudentRepository = familyStudentRepository;
        this.communicationsService = communicationsService;
    }
    async createAttendanceRecord(createDto, userId) {
        const student = await this.studentRepository.findOne({
            where: { id: createDto.studentId },
        });
        if (!student) {
            throw new common_1.NotFoundException('Estudiante no encontrado');
        }
        const existingRecord = await this.attendanceRecordRepository.findOne({
            where: {
                studentId: createDto.studentId,
                date: new Date(createDto.date),
            },
        });
        if (existingRecord) {
            throw new common_1.BadRequestException('Ya existe un registro de asistencia para este estudiante en esta fecha');
        }
        const record = this.attendanceRecordRepository.create({
            ...createDto,
            date: new Date(createDto.date),
            markedById: userId,
            markedAt: new Date(),
        });
        return await this.attendanceRecordRepository.save(record);
    }
    async updateAttendanceRecord(id, updateDto, userId) {
        const record = await this.attendanceRecordRepository.findOne({
            where: { id },
            relations: ['student'],
        });
        if (!record) {
            throw new common_1.NotFoundException('Registro de asistencia no encontrado');
        }
        Object.assign(record, updateDto);
        record.markedById = userId;
        record.markedAt = new Date();
        return await this.attendanceRecordRepository.save(record);
    }
    async getAttendanceByGroup(classGroupId, date) {
        const classGroup = await this.classGroupRepository.findOne({
            where: { id: classGroupId },
            relations: ['students', 'students.user', 'students.user.profile'],
        });
        if (!classGroup) {
            throw new common_1.NotFoundException('Grupo de clase no encontrado');
        }
        const students = classGroup.students;
        const studentIds = students.map(s => s.id);
        const records = await this.attendanceRecordRepository.find({
            where: {
                studentId: (0, typeorm_2.In)(studentIds),
                date: new Date(date),
            },
            relations: ['student', 'student.user', 'student.user.profile', 'markedBy'],
        });
        return records;
    }
    async getAttendanceByStudent(studentId, startDate, endDate, requestingUserId, requestingUserRole) {
        if (requestingUserRole === 'family' && requestingUserId) {
            const hasAccess = await this.verifyFamilyStudentAccess(requestingUserId, studentId);
            if (!hasAccess) {
                throw new common_1.ForbiddenException('No tienes permisos para ver la asistencia de este estudiante');
            }
        }
        const where = { studentId };
        if (startDate && endDate) {
            where.date = (0, typeorm_2.Between)(new Date(startDate), new Date(endDate));
        }
        return await this.attendanceRecordRepository.find({
            where,
            relations: ['markedBy', 'approvedRequest'],
            order: { date: 'DESC' },
        });
    }
    async bulkMarkPresent(bulkDto, userId) {
        const classGroup = await this.classGroupRepository.findOne({
            where: { id: bulkDto.classGroupId },
            relations: ['students'],
        });
        if (!classGroup) {
            throw new common_1.NotFoundException('Grupo de clase no encontrado');
        }
        const students = classGroup.students;
        const targetDate = new Date(bulkDto.date);
        let created = 0;
        let skipped = 0;
        for (const student of students) {
            if (bulkDto.excludeStudentIds?.includes(student.id)) {
                skipped++;
                continue;
            }
            const existingRecord = await this.attendanceRecordRepository.findOne({
                where: {
                    studentId: student.id,
                    date: targetDate,
                },
            });
            if (existingRecord) {
                skipped++;
                continue;
            }
            const record = this.attendanceRecordRepository.create({
                studentId: student.id,
                date: targetDate,
                status: attendance_record_entity_1.AttendanceStatus.PRESENT,
                markedById: userId,
                markedAt: new Date(),
            });
            await this.attendanceRecordRepository.save(record);
            created++;
        }
        return { created, skipped };
    }
    async createAttendanceRequest(createDto, userId) {
        const user = await this.userRepository.findOne({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.NotFoundException('Usuario no encontrado');
        }
        if (user.role === user_entity_1.UserRole.FAMILY) {
            const familyRelation = await this.familyStudentRepository.findOne({
                where: {
                    family: { primaryContact: { id: userId } },
                    student: { id: createDto.studentId },
                },
                relations: ['family', 'family.primaryContact', 'family.secondaryContact', 'student'],
            });
            const familyRelationSecondary = !familyRelation ? await this.familyStudentRepository.findOne({
                where: {
                    family: { secondaryContact: { id: userId } },
                    student: { id: createDto.studentId },
                },
                relations: ['family', 'family.primaryContact', 'family.secondaryContact', 'student'],
            }) : null;
            if (!familyRelation && !familyRelationSecondary) {
                throw new common_1.ForbiddenException('No tienes permisos para crear solicitudes para este estudiante');
            }
        }
        const existingRequest = await this.attendanceRequestRepository.findOne({
            where: {
                studentId: createDto.studentId,
                date: new Date(createDto.date),
                status: attendance_request_entity_1.AttendanceRequestStatus.PENDING,
            },
        });
        if (existingRequest) {
            throw new common_1.BadRequestException('Ya existe una solicitud pendiente para esta fecha');
        }
        const requestDate = new Date(createDto.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const daysDiff = Math.floor((requestDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        if (daysDiff < -7) {
            throw new common_1.BadRequestException('No se pueden crear solicitudes para fechas de más de 7 días atrás');
        }
        if (daysDiff > 30) {
            throw new common_1.BadRequestException('No se pueden crear solicitudes para fechas de más de 30 días en el futuro');
        }
        const request = this.attendanceRequestRepository.create({
            ...createDto,
            date: requestDate,
            requestedById: userId,
        });
        return await this.attendanceRequestRepository.save(request);
    }
    async reviewAttendanceRequest(id, reviewDto, userId) {
        const request = await this.attendanceRequestRepository.findOne({
            where: { id },
            relations: ['student', 'student.classGroups', 'requestedBy'],
        });
        if (!request) {
            throw new common_1.NotFoundException('Solicitud no encontrada');
        }
        if (request.status !== attendance_request_entity_1.AttendanceRequestStatus.PENDING) {
            throw new common_1.BadRequestException('Esta solicitud ya ha sido revisada');
        }
        request.status = reviewDto.status;
        request.reviewNote = reviewDto.reviewNote;
        request.reviewedById = userId;
        request.reviewedAt = new Date();
        const updatedRequest = await this.attendanceRequestRepository.save(request);
        if (reviewDto.status === attendance_request_entity_1.AttendanceRequestStatus.APPROVED) {
            await this.applyApprovedRequest(request, userId);
        }
        await this.sendAttendanceReviewNotification(updatedRequest, userId);
        return updatedRequest;
    }
    async applyApprovedRequest(request, userId) {
        let record = await this.attendanceRecordRepository.findOne({
            where: {
                studentId: request.studentId,
                date: request.date,
            },
        });
        let status;
        switch (request.type) {
            case attendance_request_entity_1.AttendanceRequestType.ABSENCE:
                status = attendance_record_entity_1.AttendanceStatus.JUSTIFIED_ABSENCE;
                break;
            case attendance_request_entity_1.AttendanceRequestType.LATE_ARRIVAL:
                status = attendance_record_entity_1.AttendanceStatus.LATE;
                break;
            case attendance_request_entity_1.AttendanceRequestType.EARLY_DEPARTURE:
                status = attendance_record_entity_1.AttendanceStatus.EARLY_DEPARTURE;
                break;
        }
        if (record) {
            record.status = status;
            record.justification = request.reason;
            record.approvedRequestId = request.id;
            record.markedById = userId;
            record.markedAt = new Date();
            if (request.expectedArrivalTime) {
                record.arrivalTime = request.expectedArrivalTime;
            }
            if (request.expectedDepartureTime) {
                record.departureTime = request.expectedDepartureTime;
            }
        }
        else {
            record = this.attendanceRecordRepository.create({
                studentId: request.studentId,
                date: request.date,
                status,
                justification: request.reason,
                approvedRequestId: request.id,
                markedById: userId,
                markedAt: new Date(),
                arrivalTime: request.expectedArrivalTime,
                departureTime: request.expectedDepartureTime,
            });
        }
        await this.attendanceRecordRepository.save(record);
    }
    async getRequestsByStudent(studentId, status, requestingUserId, requestingUserRole) {
        if (requestingUserRole === 'family' && requestingUserId) {
            const hasAccess = await this.verifyFamilyStudentAccess(requestingUserId, studentId);
            if (!hasAccess) {
                throw new common_1.ForbiddenException('No tienes permisos para ver las solicitudes de este estudiante');
            }
        }
        const where = { studentId };
        if (status) {
            where.status = status;
        }
        return await this.attendanceRequestRepository.find({
            where,
            relations: ['requestedBy', 'reviewedBy'],
            order: { createdAt: 'DESC' },
        });
    }
    async getPendingRequestsByGroup(classGroupId) {
        const classGroup = await this.classGroupRepository.findOne({
            where: { id: classGroupId },
            relations: ['students'],
        });
        if (!classGroup) {
            throw new common_1.NotFoundException('Grupo de clase no encontrado');
        }
        const studentIds = classGroup.students.map(s => s.id);
        return await this.attendanceRequestRepository.find({
            where: {
                studentId: (0, typeorm_2.In)(studentIds),
                status: attendance_request_entity_1.AttendanceRequestStatus.PENDING,
            },
            relations: ['student', 'student.user', 'student.user.profile', 'requestedBy'],
            order: { createdAt: 'ASC' },
        });
    }
    async getRequestsByUser(userId) {
        return await this.attendanceRequestRepository.find({
            where: { requestedById: userId },
            relations: ['student', 'student.user', 'student.user.profile', 'reviewedBy'],
            order: { createdAt: 'DESC' },
        });
    }
    async getAttendanceStats(classGroupId, startDate, endDate) {
        const classGroup = await this.classGroupRepository.findOne({
            where: { id: classGroupId },
            relations: ['students', 'students.user', 'students.user.profile'],
        });
        if (!classGroup) {
            throw new common_1.NotFoundException('Grupo de clase no encontrado');
        }
        const students = classGroup.students;
        const stats = [];
        for (const student of students) {
            const records = await this.attendanceRecordRepository.find({
                where: {
                    studentId: student.id,
                    date: (0, typeorm_2.Between)(new Date(startDate), new Date(endDate)),
                },
            });
            const studentStats = {
                student: {
                    id: student.id,
                    name: `${student.user.profile.firstName} ${student.user.profile.lastName}`,
                },
                present: records.filter(r => r.status === attendance_record_entity_1.AttendanceStatus.PRESENT).length,
                absent: records.filter(r => r.status === attendance_record_entity_1.AttendanceStatus.ABSENT).length,
                late: records.filter(r => r.status === attendance_record_entity_1.AttendanceStatus.LATE).length,
                earlyDeparture: records.filter(r => r.status === attendance_record_entity_1.AttendanceStatus.EARLY_DEPARTURE).length,
                justifiedAbsence: records.filter(r => r.status === attendance_record_entity_1.AttendanceStatus.JUSTIFIED_ABSENCE).length,
                totalDays: records.length,
            };
            stats.push(studentStats);
        }
        return stats;
    }
    async sendAttendanceReviewNotification(request, reviewerUserId) {
        try {
            const fullRequest = await this.attendanceRequestRepository.findOne({
                where: { id: request.id },
                relations: ['student', 'student.user', 'student.user.profile', 'requestedBy', 'reviewedBy'],
            });
            if (!fullRequest)
                return;
            const studentName = `${fullRequest.student.user.profile.firstName} ${fullRequest.student.user.profile.lastName}`;
            const reviewerName = fullRequest.reviewedBy ?
                `${fullRequest.reviewedBy.profile?.firstName || ''} ${fullRequest.reviewedBy.profile?.lastName || ''}` :
                'el profesor';
            let subject;
            let content;
            let priority = message_entity_1.MessagePriority.NORMAL;
            if (request.status === attendance_request_entity_1.AttendanceRequestStatus.APPROVED) {
                subject = `✅ Solicitud de asistencia aprobada - ${studentName}`;
                content = `La solicitud de ${this.getRequestTypeText(request.type)} para ${studentName} el día ${request.date.toLocaleDateString()} ha sido APROBADA por ${reviewerName}.`;
                if (request.reviewNote) {
                    content += `\n\nNota del profesor: ${request.reviewNote}`;
                }
            }
            else {
                subject = `❌ Solicitud de asistencia rechazada - ${studentName}`;
                content = `La solicitud de ${this.getRequestTypeText(request.type)} para ${studentName} el día ${request.date.toLocaleDateString()} ha sido RECHAZADA por ${reviewerName}.`;
                priority = message_entity_1.MessagePriority.HIGH;
                if (request.reviewNote) {
                    content += `\n\nMotivo: ${request.reviewNote}`;
                }
            }
            await this.communicationsService.createMessage(reviewerUserId, {
                type: message_entity_1.MessageType.NOTIFICATION,
                subject,
                content,
                priority,
                recipientId: fullRequest.requestedById,
                relatedStudentId: fullRequest.studentId,
                attendanceRequestId: fullRequest.id,
            });
        }
        catch (error) {
            console.error('Error sending attendance review notification:', error);
        }
    }
    getRequestTypeText(type) {
        switch (type) {
            case attendance_request_entity_1.AttendanceRequestType.ABSENCE:
                return 'ausencia';
            case attendance_request_entity_1.AttendanceRequestType.LATE_ARRIVAL:
                return 'retraso';
            case attendance_request_entity_1.AttendanceRequestType.EARLY_DEPARTURE:
                return 'salida anticipada';
            default:
                return 'asistencia';
        }
    }
    async getFamilyChildren(familyUserId) {
        try {
            const familyRelations = await this.familyStudentRepository.find({
                where: [
                    {
                        family: { primaryContact: { id: familyUserId } },
                    },
                    {
                        family: { secondaryContact: { id: familyUserId } },
                    },
                ],
                relations: [
                    'student',
                    'student.user',
                    'student.user.profile',
                    'student.classGroups',
                ],
            });
            const children = familyRelations.map(relation => ({
                id: relation.student.id,
                name: `${relation.student.user.profile.firstName} ${relation.student.user.profile.lastName}`,
                firstName: relation.student.user.profile.firstName,
                lastName: relation.student.user.profile.lastName,
                classGroups: relation.student.classGroups?.map(group => ({
                    id: group.id,
                    name: group.name,
                })) || [],
            }));
            return children;
        }
        catch (error) {
            console.error('Error getting family children:', error);
            throw new common_1.BadRequestException('Error al obtener la lista de hijos');
        }
    }
    async verifyFamilyStudentAccess(familyUserId, studentId) {
        try {
            const familyRelation = await this.familyStudentRepository.findOne({
                where: [
                    {
                        family: { primaryContact: { id: familyUserId } },
                        student: { id: studentId },
                    },
                    {
                        family: { secondaryContact: { id: familyUserId } },
                        student: { id: studentId },
                    },
                ],
            });
            return !!familyRelation;
        }
        catch (error) {
            console.error('Error verifying family-student access:', error);
            return false;
        }
    }
};
exports.AttendanceService = AttendanceService;
exports.AttendanceService = AttendanceService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(attendance_record_entity_1.AttendanceRecord)),
    __param(1, (0, typeorm_1.InjectRepository)(attendance_request_entity_1.AttendanceRequest)),
    __param(2, (0, typeorm_1.InjectRepository)(student_entity_1.Student)),
    __param(3, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(4, (0, typeorm_1.InjectRepository)(class_group_entity_1.ClassGroup)),
    __param(5, (0, typeorm_1.InjectRepository)(family_entity_1.Family)),
    __param(6, (0, typeorm_1.InjectRepository)(family_entity_1.FamilyStudent)),
    __param(7, (0, common_1.Inject)((0, common_1.forwardRef)(() => communications_service_1.CommunicationsService))),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        communications_service_1.CommunicationsService])
], AttendanceService);
//# sourceMappingURL=attendance.service.js.map