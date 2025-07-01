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
exports.CalendarService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const entities_1 = require("./entities");
const user_entity_1 = require("../users/entities/user.entity");
const teacher_entity_1 = require("../teachers/entities/teacher.entity");
const student_entity_1 = require("../students/entities/student.entity");
const family_entity_1 = require("../users/entities/family.entity");
let CalendarService = class CalendarService {
    constructor(calendarEventsRepository, eventGroupsRepository, eventSubjectsRepository, eventStudentsRepository, eventRemindersRepository, usersRepository, teachersRepository, studentsRepository, familiesRepository, familyStudentsRepository) {
        this.calendarEventsRepository = calendarEventsRepository;
        this.eventGroupsRepository = eventGroupsRepository;
        this.eventSubjectsRepository = eventSubjectsRepository;
        this.eventStudentsRepository = eventStudentsRepository;
        this.eventRemindersRepository = eventRemindersRepository;
        this.usersRepository = usersRepository;
        this.teachersRepository = teachersRepository;
        this.studentsRepository = studentsRepository;
        this.familiesRepository = familiesRepository;
        this.familyStudentsRepository = familyStudentsRepository;
    }
    async create(createEventDto, userId) {
        const startDate = new Date(createEventDto.startDate);
        const endDate = new Date(createEventDto.endDate);
        if (endDate <= startDate) {
            throw new common_1.BadRequestException('La fecha de fin debe ser posterior a la fecha de inicio');
        }
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
        await this.createEventAssignments(savedEvent.id, createEventDto);
        if (createEventDto.autoNotify) {
            await this.createAutoReminders(savedEvent);
        }
        return this.findOne(savedEvent.id, userId);
    }
    async findAll(query, userId) {
        const user = await this.usersRepository.findOne({
            where: { id: userId },
            relations: ['profile'],
        });
        if (!user) {
            throw new common_1.NotFoundException('Usuario no encontrado');
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
        if (query.startDate && query.endDate) {
            queryBuilder.andWhere('event.startDate >= :startDate AND event.endDate <= :endDate', {
                startDate: new Date(query.startDate),
                endDate: new Date(query.endDate),
            });
        }
        if (query.type) {
            queryBuilder.andWhere('event.type = :type', { type: query.type });
        }
        if (query.search) {
            queryBuilder.andWhere('(event.title ILIKE :search OR event.description ILIKE :search)', { search: `%${query.search}%` });
        }
        if (query.tags && query.tags.length > 0) {
            queryBuilder.andWhere('event.tags && :tags', { tags: query.tags });
        }
        await this.applyVisibilityFilters(queryBuilder, user, query);
        queryBuilder.orderBy('event.startDate', 'ASC');
        return queryBuilder.getMany();
    }
    async findOne(id, userId) {
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
            throw new common_1.NotFoundException('Evento no encontrado');
        }
        await this.checkViewPermissions(event, userId);
        return event;
    }
    async update(id, updateEventDto, userId) {
        const event = await this.findOne(id, userId);
        await this.checkEditPermissions(event, userId);
        if (updateEventDto.startDate || updateEventDto.endDate) {
            const startDate = updateEventDto.startDate
                ? new Date(updateEventDto.startDate)
                : event.startDate;
            const endDate = updateEventDto.endDate
                ? new Date(updateEventDto.endDate)
                : event.endDate;
            if (endDate <= startDate) {
                throw new common_1.BadRequestException('La fecha de fin debe ser posterior a la fecha de inicio');
            }
        }
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
        if (updateEventDto.classGroupIds ||
            updateEventDto.subjectIds ||
            updateEventDto.studentIds) {
            await this.updateEventAssignments(id, updateEventDto);
        }
        return this.findOne(id, userId);
    }
    async remove(id, userId) {
        const event = await this.findOne(id, userId);
        await this.checkEditPermissions(event, userId);
        await this.calendarEventsRepository.update(id, {
            isActive: false,
            lastModifiedById: userId,
        });
    }
    async createEventAssignments(eventId, createEventDto) {
        if (createEventDto.classGroupIds && createEventDto.classGroupIds.length > 0) {
            const groupAssignments = createEventDto.classGroupIds.map((groupId) => this.eventGroupsRepository.create({ eventId, classGroupId: groupId }));
            await this.eventGroupsRepository.save(groupAssignments);
        }
        if (createEventDto.subjectIds && createEventDto.subjectIds.length > 0) {
            const subjectAssignments = createEventDto.subjectIds.map((subjectId) => this.eventSubjectsRepository.create({ eventId, subjectId }));
            await this.eventSubjectsRepository.save(subjectAssignments);
        }
        if (createEventDto.studentIds && createEventDto.studentIds.length > 0) {
            const studentAssignments = createEventDto.studentIds.map((studentId) => this.eventStudentsRepository.create({ eventId, studentId }));
            await this.eventStudentsRepository.save(studentAssignments);
        }
    }
    async updateEventAssignments(eventId, updateEventDto) {
        if (updateEventDto.classGroupIds) {
            await this.eventGroupsRepository.delete({ eventId });
            if (updateEventDto.classGroupIds.length > 0) {
                const groupAssignments = updateEventDto.classGroupIds.map((groupId) => this.eventGroupsRepository.create({ eventId, classGroupId: groupId }));
                await this.eventGroupsRepository.save(groupAssignments);
            }
        }
        if (updateEventDto.subjectIds) {
            await this.eventSubjectsRepository.delete({ eventId });
            if (updateEventDto.subjectIds.length > 0) {
                const subjectAssignments = updateEventDto.subjectIds.map((subjectId) => this.eventSubjectsRepository.create({ eventId, subjectId }));
                await this.eventSubjectsRepository.save(subjectAssignments);
            }
        }
        if (updateEventDto.studentIds) {
            await this.eventStudentsRepository.delete({ eventId });
            if (updateEventDto.studentIds.length > 0) {
                const studentAssignments = updateEventDto.studentIds.map((studentId) => this.eventStudentsRepository.create({ eventId, studentId }));
                await this.eventStudentsRepository.save(studentAssignments);
            }
        }
    }
    async createAutoReminders(event) {
        const reminderTime = new Date(event.startDate.getTime() - (event.notifyBefore || 60) * 60 * 1000);
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
    async applyVisibilityFilters(queryBuilder, user, query) {
        const publicEvents = 'event.visibility = :publicVisibility';
        const visibilityParams = { publicVisibility: entities_1.CalendarEventVisibility.PUBLIC };
        switch (user.role) {
            case 'admin':
                break;
            case 'teacher':
                queryBuilder.andWhere(`(${publicEvents} OR event.visibility = :teachersOnly OR event.createdById = :userId)`, {
                    ...visibilityParams,
                    teachersOnly: entities_1.CalendarEventVisibility.TEACHERS_ONLY,
                    userId: user.id,
                });
                break;
            case 'student':
                queryBuilder.andWhere(`(${publicEvents} OR event.visibility = :studentsOnly)`, {
                    ...visibilityParams,
                    studentsOnly: entities_1.CalendarEventVisibility.STUDENTS_ONLY,
                });
                break;
            case 'family':
                queryBuilder.andWhere(`(${publicEvents} OR event.visibility = :familiesOnly)`, {
                    ...visibilityParams,
                    familiesOnly: entities_1.CalendarEventVisibility.FAMILIES_ONLY,
                });
                break;
            default:
                queryBuilder.andWhere(publicEvents, visibilityParams);
        }
    }
    async checkViewPermissions(event, userId) {
        const user = await this.usersRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new common_1.NotFoundException('Usuario no encontrado');
        }
        if (event.visibility === entities_1.CalendarEventVisibility.PRIVATE && event.createdById !== userId) {
            throw new common_1.ForbiddenException('No tienes permisos para ver este evento');
        }
        if (event.visibility === entities_1.CalendarEventVisibility.ADMIN_ONLY && user.role !== 'admin') {
            throw new common_1.ForbiddenException('Solo los administradores pueden ver este evento');
        }
    }
    async checkEditPermissions(event, userId) {
        const user = await this.usersRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new common_1.NotFoundException('Usuario no encontrado');
        }
        if (event.createdById !== userId && user.role !== 'admin') {
            throw new common_1.ForbiddenException('No tienes permisos para editar este evento');
        }
    }
    async getEventsByDateRange(startDate, endDate, userId) {
        const query = {
            startDate,
            endDate,
            onlyActive: true,
        };
        return this.findAll(query, userId);
    }
    async getUpcomingEvents(userId, days = 7) {
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + days);
        return this.getEventsByDateRange(startDate.toISOString(), endDate.toISOString(), userId);
    }
    async getEventsByType(type, userId) {
        const query = {
            type,
            onlyActive: true,
        };
        return this.findAll(query, userId);
    }
    async getEventsByStudent(studentId, userId) {
        const query = {
            studentId,
            onlyActive: true,
        };
        return this.findAll(query, userId);
    }
    async getTeacherClassEvents(userId) {
        const teacher = await this.teachersRepository.findOne({
            where: { user: { id: userId } },
            relations: ['subjectAssignments', 'subjectAssignments.classGroup'],
        });
        if (!teacher) {
            throw new common_1.NotFoundException('Profesor no encontrado');
        }
        const classGroupIds = teacher.subjectAssignments?.map(sa => sa.classGroup.id) || [];
        if (classGroupIds.length === 0) {
            return [];
        }
        const query = {
            visibility: entities_1.CalendarEventVisibility.CLASS_SPECIFIC,
            onlyActive: true,
        };
        const allEvents = await this.findAll(query, userId);
        return allEvents.filter(event => event.eventGroups?.some(eg => classGroupIds.includes(eg.classGroup.id)));
    }
};
exports.CalendarService = CalendarService;
exports.CalendarService = CalendarService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.CalendarEvent)),
    __param(1, (0, typeorm_1.InjectRepository)(entities_1.CalendarEventGroup)),
    __param(2, (0, typeorm_1.InjectRepository)(entities_1.CalendarEventSubject)),
    __param(3, (0, typeorm_1.InjectRepository)(entities_1.CalendarEventStudent)),
    __param(4, (0, typeorm_1.InjectRepository)(entities_1.CalendarEventReminder)),
    __param(5, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(6, (0, typeorm_1.InjectRepository)(teacher_entity_1.Teacher)),
    __param(7, (0, typeorm_1.InjectRepository)(student_entity_1.Student)),
    __param(8, (0, typeorm_1.InjectRepository)(family_entity_1.Family)),
    __param(9, (0, typeorm_1.InjectRepository)(family_entity_1.FamilyStudent)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], CalendarService);
//# sourceMappingURL=calendar.service.js.map