import { Injectable, NotFoundException, BadRequestException, ForbiddenException, forwardRef, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, IsNull, Not } from 'typeorm';
import { AttendanceRecord, AttendanceStatus } from './entities/attendance-record.entity';
import { AttendanceRequest, AttendanceRequestStatus, AttendanceRequestType } from './entities/attendance-request.entity';
import { Student } from '../students/entities/student.entity';
import { User, UserRole } from '../users/entities/user.entity';
import { ClassGroup } from '../students/entities/class-group.entity';
import { Family, FamilyStudent } from '../users/entities/family.entity';
import { CommunicationsService } from '../communications/communications.service';
import { MessageType, MessagePriority } from '../communications/entities/message.entity';
import {
  CreateAttendanceRecordDto,
  UpdateAttendanceRecordDto,
  CreateAttendanceRequestDto,
  ReviewAttendanceRequestDto,
  BulkMarkPresentDto,
} from './dto';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(AttendanceRecord)
    private readonly attendanceRecordRepository: Repository<AttendanceRecord>,
    @InjectRepository(AttendanceRequest)
    private readonly attendanceRequestRepository: Repository<AttendanceRequest>,
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(ClassGroup)
    private readonly classGroupRepository: Repository<ClassGroup>,
    @InjectRepository(Family)
    private readonly familyRepository: Repository<Family>,
    @InjectRepository(FamilyStudent)
    private readonly familyStudentRepository: Repository<FamilyStudent>,
    @Inject(forwardRef(() => CommunicationsService))
    private readonly communicationsService: CommunicationsService,
  ) {}

  // ==================== ATTENDANCE RECORDS ====================

  async createAttendanceRecord(
    createDto: CreateAttendanceRecordDto,
    userId: string,
  ): Promise<AttendanceRecord> {
    // Verificar que el estudiante existe
    const student = await this.studentRepository.findOne({
      where: { id: createDto.studentId },
    });

    if (!student) {
      throw new NotFoundException('Estudiante no encontrado');
    }

    // Verificar si ya existe un registro para esa fecha
    const existingRecord = await this.attendanceRecordRepository.findOne({
      where: {
        studentId: createDto.studentId,
        date: new Date(createDto.date),
      },
    });

    if (existingRecord) {
      throw new BadRequestException('Ya existe un registro de asistencia para este estudiante en esta fecha');
    }

    const record = this.attendanceRecordRepository.create({
      ...createDto,
      date: new Date(createDto.date),
      markedById: userId,
      markedAt: new Date(),
    });

    return await this.attendanceRecordRepository.save(record);
  }

  async updateAttendanceRecord(
    id: string,
    updateDto: UpdateAttendanceRecordDto,
    userId: string,
  ): Promise<AttendanceRecord> {
    const record = await this.attendanceRecordRepository.findOne({
      where: { id },
      relations: ['student'],
    });

    if (!record) {
      throw new NotFoundException('Registro de asistencia no encontrado');
    }

    Object.assign(record, updateDto);
    record.markedById = userId;
    record.markedAt = new Date();

    return await this.attendanceRecordRepository.save(record);
  }

  async getAttendanceByGroup(
    classGroupId: string,
    date: string,
  ): Promise<AttendanceRecord[]> {
    // Obtener todos los estudiantes del grupo
    const classGroup = await this.classGroupRepository.findOne({
      where: { id: classGroupId },
      relations: ['students', 'students.user', 'students.user.profile'],
    });

    if (!classGroup) {
      throw new NotFoundException('Grupo de clase no encontrado');
    }

    const students = classGroup.students;

    const studentIds = students.map(s => s.id);

    // Obtener registros de asistencia para esos estudiantes en la fecha especificada
    const records = await this.attendanceRecordRepository.find({
      where: {
        studentId: studentIds as any,
        date: new Date(date),
      },
      relations: ['student', 'student.user', 'student.user.profile', 'markedBy'],
    });

    return records;
  }

  async getAttendanceByStudent(
    studentId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<AttendanceRecord[]> {
    const where: any = { studentId };

    if (startDate && endDate) {
      where.date = Between(new Date(startDate), new Date(endDate));
    }

    return await this.attendanceRecordRepository.find({
      where,
      relations: ['markedBy', 'approvedRequest'],
      order: { date: 'DESC' },
    });
  }

  async bulkMarkPresent(
    bulkDto: BulkMarkPresentDto,
    userId: string,
  ): Promise<{ created: number; skipped: number }> {
    // Obtener todos los estudiantes del grupo
    const classGroup = await this.classGroupRepository.findOne({
      where: { id: bulkDto.classGroupId },
      relations: ['students'],
    });

    if (!classGroup) {
      throw new NotFoundException('Grupo de clase no encontrado');
    }

    const students = classGroup.students;

    const targetDate = new Date(bulkDto.date);
    let created = 0;
    let skipped = 0;

    for (const student of students) {
      // Saltar si está en la lista de exclusión
      if (bulkDto.excludeStudentIds?.includes(student.id)) {
        skipped++;
        continue;
      }

      // Verificar si ya existe un registro
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

      // Crear registro como presente
      const record = this.attendanceRecordRepository.create({
        studentId: student.id,
        date: targetDate,
        status: AttendanceStatus.PRESENT,
        markedById: userId,
        markedAt: new Date(),
      });

      await this.attendanceRecordRepository.save(record);
      created++;
    }

    return { created, skipped };
  }

  // ==================== ATTENDANCE REQUESTS ====================

  async createAttendanceRequest(
    createDto: CreateAttendanceRequestDto,
    userId: string,
  ): Promise<AttendanceRequest> {
    // Verificar que el usuario puede crear solicitudes para este estudiante
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Si es familia, verificar que el estudiante está relacionado
    if (user.role === UserRole.FAMILY) {
      const familyRelation = await this.familyStudentRepository.findOne({
        where: {
          family: { primaryContact: { id: userId } },
          student: { id: createDto.studentId },
        },
        relations: ['family', 'family.primaryContact', 'family.secondaryContact', 'student'],
      });

      // También verificar si es contacto secundario
      const familyRelationSecondary = !familyRelation ? await this.familyStudentRepository.findOne({
        where: {
          family: { secondaryContact: { id: userId } },
          student: { id: createDto.studentId },
        },
        relations: ['family', 'family.primaryContact', 'family.secondaryContact', 'student'],
      }) : null;

      if (!familyRelation && !familyRelationSecondary) {
        throw new ForbiddenException('No tienes permisos para crear solicitudes para este estudiante');
      }
    }

    // Verificar que no haya una solicitud pendiente para la misma fecha
    const existingRequest = await this.attendanceRequestRepository.findOne({
      where: {
        studentId: createDto.studentId,
        date: new Date(createDto.date),
        status: AttendanceRequestStatus.PENDING,
      },
    });

    if (existingRequest) {
      throw new BadRequestException('Ya existe una solicitud pendiente para esta fecha');
    }

    // Validar fechas (no permitir fechas muy pasadas o muy futuras)
    const requestDate = new Date(createDto.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const daysDiff = Math.floor((requestDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff < -7) {
      throw new BadRequestException('No se pueden crear solicitudes para fechas de más de 7 días atrás');
    }
    
    if (daysDiff > 30) {
      throw new BadRequestException('No se pueden crear solicitudes para fechas de más de 30 días en el futuro');
    }

    const request = this.attendanceRequestRepository.create({
      ...createDto,
      date: requestDate,
      requestedById: userId,
    });

    return await this.attendanceRequestRepository.save(request);
  }

  async reviewAttendanceRequest(
    id: string,
    reviewDto: ReviewAttendanceRequestDto,
    userId: string,
  ): Promise<AttendanceRequest> {
    const request = await this.attendanceRequestRepository.findOne({
      where: { id },
      relations: ['student', 'student.classGroup', 'requestedBy'],
    });

    if (!request) {
      throw new NotFoundException('Solicitud no encontrada');
    }

    if (request.status !== AttendanceRequestStatus.PENDING) {
      throw new BadRequestException('Esta solicitud ya ha sido revisada');
    }

    // Actualizar la solicitud
    request.status = reviewDto.status;
    request.reviewNote = reviewDto.reviewNote;
    request.reviewedById = userId;
    request.reviewedAt = new Date();

    const updatedRequest = await this.attendanceRequestRepository.save(request);

    // Si se aprueba, crear/actualizar el registro de asistencia
    if (reviewDto.status === AttendanceRequestStatus.APPROVED) {
      await this.applyApprovedRequest(request, userId);
    }

    // Enviar notificación a la familia sobre el resultado de la revisión
    await this.sendAttendanceReviewNotification(updatedRequest, userId);

    return updatedRequest;
  }

  private async applyApprovedRequest(
    request: AttendanceRequest,
    userId: string,
  ): Promise<void> {
    // Buscar si ya existe un registro para esa fecha
    let record = await this.attendanceRecordRepository.findOne({
      where: {
        studentId: request.studentId,
        date: request.date,
      },
    });

    // Determinar el estado según el tipo de solicitud
    let status: AttendanceStatus;
    switch (request.type) {
      case AttendanceRequestType.ABSENCE:
        status = AttendanceStatus.JUSTIFIED_ABSENCE;
        break;
      case AttendanceRequestType.LATE_ARRIVAL:
        status = AttendanceStatus.LATE;
        break;
      case AttendanceRequestType.EARLY_DEPARTURE:
        status = AttendanceStatus.EARLY_DEPARTURE;
        break;
    }

    if (record) {
      // Actualizar registro existente
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
    } else {
      // Crear nuevo registro
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

  async getRequestsByStudent(
    studentId: string,
    status?: AttendanceRequestStatus,
  ): Promise<AttendanceRequest[]> {
    const where: any = { studentId };
    
    if (status) {
      where.status = status;
    }

    return await this.attendanceRequestRepository.find({
      where,
      relations: ['requestedBy', 'reviewedBy'],
      order: { createdAt: 'DESC' },
    });
  }

  async getPendingRequestsByGroup(classGroupId: string): Promise<AttendanceRequest[]> {
    // Obtener grupo con estudiantes
    const classGroup = await this.classGroupRepository.findOne({
      where: { id: classGroupId },
      relations: ['students'],
    });

    if (!classGroup) {
      throw new NotFoundException('Grupo de clase no encontrado');
    }

    const studentIds = classGroup.students.map(s => s.id);

    return await this.attendanceRequestRepository.find({
      where: {
        studentId: studentIds as any,
        status: AttendanceRequestStatus.PENDING,
      },
      relations: ['student', 'student.user', 'student.user.profile', 'requestedBy'],
      order: { createdAt: 'ASC' },
    });
  }

  async getRequestsByUser(userId: string): Promise<AttendanceRequest[]> {
    return await this.attendanceRequestRepository.find({
      where: { requestedById: userId },
      relations: ['student', 'student.user', 'student.user.profile', 'reviewedBy'],
      order: { createdAt: 'DESC' },
    });
  }

  // ==================== STATISTICS ====================

  async getAttendanceStats(
    classGroupId: string,
    startDate: string,
    endDate: string,
  ): Promise<any> {
    // Obtener grupo con estudiantes
    const classGroup = await this.classGroupRepository.findOne({
      where: { id: classGroupId },
      relations: ['students', 'students.user', 'students.user.profile'],
    });

    if (!classGroup) {
      throw new NotFoundException('Grupo de clase no encontrado');
    }

    const students = classGroup.students;
    const stats = [];

    for (const student of students) {
      const records = await this.attendanceRecordRepository.find({
        where: {
          studentId: student.id,
          date: Between(new Date(startDate), new Date(endDate)),
        },
      });

      const studentStats = {
        student: {
          id: student.id,
          name: `${student.user.profile.firstName} ${student.user.profile.lastName}`,
        },
        present: records.filter(r => r.status === AttendanceStatus.PRESENT).length,
        absent: records.filter(r => r.status === AttendanceStatus.ABSENT).length,
        late: records.filter(r => r.status === AttendanceStatus.LATE).length,
        earlyDeparture: records.filter(r => r.status === AttendanceStatus.EARLY_DEPARTURE).length,
        justifiedAbsence: records.filter(r => r.status === AttendanceStatus.JUSTIFIED_ABSENCE).length,
        totalDays: records.length,
      };

      stats.push(studentStats);
    }

    return stats;
  }

  // ==================== NOTIFICATIONS ====================

  private async sendAttendanceReviewNotification(
    request: AttendanceRequest,
    reviewerUserId: string,
  ): Promise<void> {
    try {
      // Cargar información completa del request si no está cargada
      const fullRequest = await this.attendanceRequestRepository.findOne({
        where: { id: request.id },
        relations: ['student', 'student.user', 'student.user.profile', 'requestedBy', 'reviewedBy'],
      });

      if (!fullRequest) return;

      const studentName = `${fullRequest.student.user.profile.firstName} ${fullRequest.student.user.profile.lastName}`;
      const reviewerName = fullRequest.reviewedBy ? 
        `${fullRequest.reviewedBy.profile?.firstName || ''} ${fullRequest.reviewedBy.profile?.lastName || ''}` : 
        'el profesor';

      let subject: string;
      let content: string;
      let priority = MessagePriority.NORMAL;

      if (request.status === AttendanceRequestStatus.APPROVED) {
        subject = `✅ Solicitud de asistencia aprobada - ${studentName}`;
        content = `La solicitud de ${this.getRequestTypeText(request.type)} para ${studentName} el día ${request.date.toLocaleDateString()} ha sido APROBADA por ${reviewerName}.`;
        
        if (request.reviewNote) {
          content += `\n\nNota del profesor: ${request.reviewNote}`;
        }
      } else {
        subject = `❌ Solicitud de asistencia rechazada - ${studentName}`;
        content = `La solicitud de ${this.getRequestTypeText(request.type)} para ${studentName} el día ${request.date.toLocaleDateString()} ha sido RECHAZADA por ${reviewerName}.`;
        priority = MessagePriority.HIGH;
        
        if (request.reviewNote) {
          content += `\n\nMotivo: ${request.reviewNote}`;
        }
      }

      // Crear mensaje de notificación
      await this.communicationsService.createMessage(reviewerUserId, {
        type: MessageType.NOTIFICATION,
        subject,
        content,
        priority,
        recipientId: fullRequest.requestedById,
        relatedStudentId: fullRequest.studentId,
        attendanceRequestId: fullRequest.id,
      });
    } catch (error) {
      // Log error but don't throw - notification failure shouldn't break the main flow
      console.error('Error sending attendance review notification:', error);
    }
  }

  private getRequestTypeText(type: AttendanceRequestType): string {
    switch (type) {
      case AttendanceRequestType.ABSENCE:
        return 'ausencia';
      case AttendanceRequestType.LATE_ARRIVAL:
        return 'retraso';
      case AttendanceRequestType.EARLY_DEPARTURE:
        return 'salida anticipada';
      default:
        return 'asistencia';
    }
  }
}