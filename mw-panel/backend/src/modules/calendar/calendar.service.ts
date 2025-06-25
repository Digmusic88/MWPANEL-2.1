import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In, Like, QueryBuilder } from 'typeorm';
import {
  CalendarEvent,
  CalendarEventGroup,
  CalendarEventSubject,
  CalendarEventStudent,
  CalendarEventReminder,
  CalendarEventType,
  CalendarEventVisibility,
} from './entities';
import {
  CreateCalendarEventDto,
  UpdateCalendarEventDto,
  CalendarEventQueryDto,
} from './dto';
import { User } from '../users/entities/user.entity';
import { Teacher } from '../teachers/entities/teacher.entity';
import { Student } from '../students/entities/student.entity';
import { Family, FamilyStudent } from '../users/entities/family.entity';

@Injectable()
export class CalendarService {
  constructor(
    @InjectRepository(CalendarEvent)
    private calendarEventsRepository: Repository<CalendarEvent>,
    @InjectRepository(CalendarEventGroup)
    private eventGroupsRepository: Repository<CalendarEventGroup>,
    @InjectRepository(CalendarEventSubject)
    private eventSubjectsRepository: Repository<CalendarEventSubject>,
    @InjectRepository(CalendarEventStudent)
    private eventStudentsRepository: Repository<CalendarEventStudent>,
    @InjectRepository(CalendarEventReminder)
    private eventRemindersRepository: Repository<CalendarEventReminder>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Teacher)
    private teachersRepository: Repository<Teacher>,
    @InjectRepository(Student)
    private studentsRepository: Repository<Student>,
    @InjectRepository(Family)
    private familiesRepository: Repository<Family>,
    @InjectRepository(FamilyStudent)
    private familyStudentsRepository: Repository<FamilyStudent>,
  ) {}

  // ==================== CRUD EVENTOS ====================

  async create(
    createEventDto: CreateCalendarEventDto,
    userId: string,
  ): Promise<CalendarEvent> {
    // Validar fechas
    const startDate = new Date(createEventDto.startDate);
    const endDate = new Date(createEventDto.endDate);

    if (endDate <= startDate) {
      throw new BadRequestException(
        'La fecha de fin debe ser posterior a la fecha de inicio',
      );
    }

    // Crear el evento
    const event = this.calendarEventsRepository.create({
      ...createEventDto,
      startDate,
      endDate,
      recurrenceEnd: createEventDto.recurrenceEnd
        ? new Date(createEventDto.recurrenceEnd)
        : null,
      createdById: userId,
    });

    const savedEvent = await this.calendarEventsRepository.save(event);

    // Crear asignaciones si se proporcionan
    await this.createEventAssignments(savedEvent.id, createEventDto);

    // Crear recordatorios automáticos si está habilitado
    if (createEventDto.autoNotify) {
      await this.createAutoReminders(savedEvent);
    }

    return this.findOne(savedEvent.id, userId);
  }

  async findAll(
    query: CalendarEventQueryDto,
    userId: string,
  ): Promise<CalendarEvent[]> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['profile'],
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const queryBuilder = this.calendarEventsRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.createdBy', 'createdBy')
      .leftJoinAndSelect('createdBy.profile', 'createdByProfile')
      .leftJoinAndSelect('event.eventGroups', 'eventGroups')
      .leftJoinAndSelect('eventGroups.classGroup', 'classGroup')
      .leftJoinAndSelect('event.eventSubjects', 'eventSubjects')
      .leftJoinAndSelect('eventSubjects.subject', 'subject')
      .leftJoinAndSelect('event.eventStudents', 'eventStudents')
      .leftJoinAndSelect('eventStudents.student', 'student')
      .leftJoinAndSelect('event.relatedTask', 'relatedTask')
      .where('event.isActive = :isActive', { isActive: true });

    // Aplicar filtros de fecha
    if (query.startDate && query.endDate) {
      queryBuilder.andWhere(
        'event.startDate >= :startDate AND event.endDate <= :endDate',
        {
          startDate: new Date(query.startDate),
          endDate: new Date(query.endDate),
        },
      );
    }

    // Filtrar por tipo
    if (query.type) {
      queryBuilder.andWhere('event.type = :type', { type: query.type });
    }

    // Filtrar por texto de búsqueda
    if (query.search) {
      queryBuilder.andWhere(
        '(event.title ILIKE :search OR event.description ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    // Filtrar por tags
    if (query.tags && query.tags.length > 0) {
      queryBuilder.andWhere('event.tags && :tags', { tags: query.tags });
    }

    // Aplicar filtros de visibilidad según el rol del usuario
    await this.applyVisibilityFilters(queryBuilder, user, query);

    queryBuilder.orderBy('event.startDate', 'ASC');

    return queryBuilder.getMany();
  }

  async findOne(id: string, userId: string): Promise<CalendarEvent> {
    const event = await this.calendarEventsRepository.findOne({
      where: { id, isActive: true },
      relations: [
        'createdBy',
        'createdBy.profile',
        'lastModifiedBy',
        'lastModifiedBy.profile',
        'eventGroups',
        'eventGroups.classGroup',
        'eventSubjects',
        'eventSubjects.subject',
        'eventStudents',
        'eventStudents.student',
        'eventStudents.student.user',
        'eventStudents.student.user.profile',
        'relatedTask',
        'reminders',
      ],
    });

    if (!event) {
      throw new NotFoundException('Evento no encontrado');
    }

    // Verificar permisos de visualización
    await this.checkViewPermissions(event, userId);

    return event;
  }

  async update(
    id: string,
    updateEventDto: UpdateCalendarEventDto,
    userId: string,
  ): Promise<CalendarEvent> {
    const event = await this.findOne(id, userId);

    // Verificar permisos de edición
    await this.checkEditPermissions(event, userId);

    // Validar fechas si se actualizan
    if (updateEventDto.startDate || updateEventDto.endDate) {
      const startDate = updateEventDto.startDate
        ? new Date(updateEventDto.startDate)
        : event.startDate;
      const endDate = updateEventDto.endDate
        ? new Date(updateEventDto.endDate)
        : event.endDate;

      if (endDate <= startDate) {
        throw new BadRequestException(
          'La fecha de fin debe ser posterior a la fecha de inicio',
        );
      }
    }

    // Actualizar evento
    await this.calendarEventsRepository.update(id, {
      ...updateEventDto,
      lastModifiedById: userId,
      startDate: updateEventDto.startDate
        ? new Date(updateEventDto.startDate)
        : undefined,
      endDate: updateEventDto.endDate
        ? new Date(updateEventDto.endDate)
        : undefined,
      recurrenceEnd: updateEventDto.recurrenceEnd
        ? new Date(updateEventDto.recurrenceEnd)
        : undefined,
    });

    // Actualizar asignaciones si se proporcionan
    if (
      updateEventDto.classGroupIds ||
      updateEventDto.subjectIds ||
      updateEventDto.studentIds
    ) {
      await this.updateEventAssignments(id, updateEventDto);
    }

    return this.findOne(id, userId);
  }

  async remove(id: string, userId: string): Promise<void> {
    const event = await this.findOne(id, userId);

    // Verificar permisos de eliminación
    await this.checkEditPermissions(event, userId);

    // Soft delete
    await this.calendarEventsRepository.update(id, {
      isActive: false,
      lastModifiedById: userId,
    });
  }

  // ==================== MÉTODOS AUXILIARES ====================

  private async createEventAssignments(
    eventId: string,
    createEventDto: CreateCalendarEventDto,
  ): Promise<void> {
    // Crear asignaciones a grupos
    if (createEventDto.classGroupIds && createEventDto.classGroupIds.length > 0) {
      const groupAssignments = createEventDto.classGroupIds.map((groupId) =>
        this.eventGroupsRepository.create({ eventId, classGroupId: groupId }),
      );
      await this.eventGroupsRepository.save(groupAssignments);
    }

    // Crear asignaciones a asignaturas
    if (createEventDto.subjectIds && createEventDto.subjectIds.length > 0) {
      const subjectAssignments = createEventDto.subjectIds.map((subjectId) =>
        this.eventSubjectsRepository.create({ eventId, subjectId }),
      );
      await this.eventSubjectsRepository.save(subjectAssignments);
    }

    // Crear asignaciones a estudiantes específicos
    if (createEventDto.studentIds && createEventDto.studentIds.length > 0) {
      const studentAssignments = createEventDto.studentIds.map((studentId) =>
        this.eventStudentsRepository.create({ eventId, studentId }),
      );
      await this.eventStudentsRepository.save(studentAssignments);
    }
  }

  private async updateEventAssignments(
    eventId: string,
    updateEventDto: UpdateCalendarEventDto,
  ): Promise<void> {
    // Actualizar asignaciones a grupos
    if (updateEventDto.classGroupIds) {
      await this.eventGroupsRepository.delete({ eventId });
      if (updateEventDto.classGroupIds.length > 0) {
        const groupAssignments = updateEventDto.classGroupIds.map((groupId) =>
          this.eventGroupsRepository.create({ eventId, classGroupId: groupId }),
        );
        await this.eventGroupsRepository.save(groupAssignments);
      }
    }

    // Actualizar asignaciones a asignaturas
    if (updateEventDto.subjectIds) {
      await this.eventSubjectsRepository.delete({ eventId });
      if (updateEventDto.subjectIds.length > 0) {
        const subjectAssignments = updateEventDto.subjectIds.map((subjectId) =>
          this.eventSubjectsRepository.create({ eventId, subjectId }),
        );
        await this.eventSubjectsRepository.save(subjectAssignments);
      }
    }

    // Actualizar asignaciones a estudiantes
    if (updateEventDto.studentIds) {
      await this.eventStudentsRepository.delete({ eventId });
      if (updateEventDto.studentIds.length > 0) {
        const studentAssignments = updateEventDto.studentIds.map((studentId) =>
          this.eventStudentsRepository.create({ eventId, studentId }),
        );
        await this.eventStudentsRepository.save(studentAssignments);
      }
    }
  }

  private async createAutoReminders(event: CalendarEvent): Promise<void> {
    // Por ahora, crear recordatorio simple basado en notifyBefore
    const reminderTime = new Date(
      event.startDate.getTime() - (event.notifyBefore || 60) * 60 * 1000,
    );

    if (reminderTime > new Date()) {
      const reminder = this.eventRemindersRepository.create({
        eventId: event.id,
        userId: event.createdById,
        reminderTime,
        message: `Recordatorio: ${event.title}`,
        type: 'notification',
      });

      await this.eventRemindersRepository.save(reminder);
    }
  }

  private async applyVisibilityFilters(
    queryBuilder: any,
    user: User,
    query: CalendarEventQueryDto,
  ): Promise<void> {
    // Implementar filtros de visibilidad según el rol del usuario
    // Este es un ejemplo simplificado, se puede expandir según necesidades
    
    const publicEvents = 'event.visibility = :publicVisibility';
    const visibilityParams: any = { publicVisibility: CalendarEventVisibility.PUBLIC };

    switch (user.role) {
      case 'admin':
        // Los admins pueden ver todos los eventos
        break;
      case 'teacher':
        queryBuilder.andWhere(
          `(${publicEvents} OR event.visibility = :teachersOnly OR event.createdById = :userId)`,
          {
            ...visibilityParams,
            teachersOnly: CalendarEventVisibility.TEACHERS_ONLY,
            userId: user.id,
          },
        );
        break;
      case 'student':
        queryBuilder.andWhere(
          `(${publicEvents} OR event.visibility = :studentsOnly)`,
          {
            ...visibilityParams,
            studentsOnly: CalendarEventVisibility.STUDENTS_ONLY,
          },
        );
        break;
      case 'family':
        queryBuilder.andWhere(
          `(${publicEvents} OR event.visibility = :familiesOnly)`,
          {
            ...visibilityParams,
            familiesOnly: CalendarEventVisibility.FAMILIES_ONLY,
          },
        );
        break;
      default:
        queryBuilder.andWhere(publicEvents, visibilityParams);
    }
  }

  private async checkViewPermissions(
    event: CalendarEvent,
    userId: string,
  ): Promise<void> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Verificar permisos de visualización según visibilidad del evento
    if (event.visibility === CalendarEventVisibility.PRIVATE && event.createdById !== userId) {
      throw new ForbiddenException('No tienes permisos para ver este evento');
    }

    if (event.visibility === CalendarEventVisibility.ADMIN_ONLY && user.role !== 'admin') {
      throw new ForbiddenException('Solo los administradores pueden ver este evento');
    }

    // Agregar más validaciones según sea necesario
  }

  private async checkEditPermissions(
    event: CalendarEvent,
    userId: string,
  ): Promise<void> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Solo el creador o un admin pueden editar
    if (event.createdById !== userId && user.role !== 'admin') {
      throw new ForbiddenException('No tienes permisos para editar este evento');
    }
  }

  // ==================== MÉTODOS ESPECÍFICOS ====================

  async getEventsByDateRange(
    startDate: string,
    endDate: string,
    userId: string,
  ): Promise<CalendarEvent[]> {
    const query: CalendarEventQueryDto = {
      startDate,
      endDate,
      onlyActive: true,
    };

    return this.findAll(query, userId);
  }

  async getUpcomingEvents(userId: string, days: number = 7): Promise<CalendarEvent[]> {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days);

    return this.getEventsByDateRange(
      startDate.toISOString(),
      endDate.toISOString(),
      userId,
    );
  }

  async getEventsByType(
    type: CalendarEventType,
    userId: string,
  ): Promise<CalendarEvent[]> {
    const query: CalendarEventQueryDto = {
      type,
      onlyActive: true,
    };

    return this.findAll(query, userId);
  }

  async getEventsByStudent(
    studentId: string,
    userId: string,
  ): Promise<CalendarEvent[]> {
    const query: CalendarEventQueryDto = {
      studentId,
      onlyActive: true,
    };

    return this.findAll(query, userId);
  }

  async getTeacherClassEvents(userId: string): Promise<CalendarEvent[]> {
    // Find teacher by user ID
    const teacher = await this.teachersRepository.findOne({
      where: { user: { id: userId } },
      relations: ['subjectAssignments', 'subjectAssignments.classGroup'],
    });

    if (!teacher) {
      throw new NotFoundException('Profesor no encontrado');
    }

    // Get class group IDs for this teacher
    const classGroupIds = teacher.subjectAssignments?.map(sa => sa.classGroup.id) || [];

    if (classGroupIds.length === 0) {
      return [];
    }

    // Filter events for teacher's classes
    const query: CalendarEventQueryDto = {
      visibility: CalendarEventVisibility.CLASS_SPECIFIC,
      onlyActive: true,
    };

    const allEvents = await this.findAll(query, userId);

    // Filter events that belong to teacher's classes
    return allEvents.filter(event => 
      event.eventGroups?.some(eg => classGroupIds.includes(eg.classGroup.id))
    );
  }
}