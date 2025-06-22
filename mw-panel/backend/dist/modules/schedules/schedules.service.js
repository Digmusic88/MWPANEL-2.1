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
exports.SchedulesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const classroom_entity_1 = require("../students/entities/classroom.entity");
const time_slot_entity_1 = require("../students/entities/time-slot.entity");
const schedule_session_entity_1 = require("../students/entities/schedule-session.entity");
const academic_calendar_entity_1 = require("../students/entities/academic-calendar.entity");
const educational_level_entity_1 = require("../students/entities/educational-level.entity");
const subject_assignment_entity_1 = require("../students/entities/subject-assignment.entity");
const academic_year_entity_1 = require("../students/entities/academic-year.entity");
let SchedulesService = class SchedulesService {
    constructor(classroomRepository, timeSlotRepository, scheduleSessionRepository, academicCalendarRepository, educationalLevelRepository, subjectAssignmentRepository, academicYearRepository) {
        this.classroomRepository = classroomRepository;
        this.timeSlotRepository = timeSlotRepository;
        this.scheduleSessionRepository = scheduleSessionRepository;
        this.academicCalendarRepository = academicCalendarRepository;
        this.educationalLevelRepository = educationalLevelRepository;
        this.subjectAssignmentRepository = subjectAssignmentRepository;
        this.academicYearRepository = academicYearRepository;
    }
    async findAllClassrooms() {
        return this.classroomRepository.find({
            relations: ['preferredEducationalLevel'],
            order: { building: 'ASC', floor: 'ASC', name: 'ASC' },
        });
    }
    async findOneClassroom(id) {
        const classroom = await this.classroomRepository.findOne({
            where: { id },
            relations: ['preferredEducationalLevel'],
        });
        if (!classroom) {
            throw new common_1.NotFoundException(`Aula con ID ${id} no encontrada`);
        }
        return classroom;
    }
    async createClassroom(createClassroomDto) {
        const { preferredEducationalLevelId, ...classroomData } = createClassroomDto;
        const existingClassroom = await this.classroomRepository.findOne({
            where: { code: createClassroomDto.code },
        });
        if (existingClassroom) {
            throw new common_1.ConflictException(`Ya existe un aula con el código ${createClassroomDto.code}`);
        }
        const classroom = this.classroomRepository.create(classroomData);
        if (preferredEducationalLevelId) {
            const educationalLevel = await this.educationalLevelRepository.findOne({
                where: { id: preferredEducationalLevelId },
            });
            if (!educationalLevel) {
                throw new common_1.NotFoundException(`Nivel educativo con ID ${preferredEducationalLevelId} no encontrado`);
            }
            classroom.preferredEducationalLevel = educationalLevel;
        }
        return this.classroomRepository.save(classroom);
    }
    async updateClassroom(id, updateClassroomDto) {
        const classroom = await this.findOneClassroom(id);
        const { preferredEducationalLevelId, ...updateData } = updateClassroomDto;
        if (updateData.code && updateData.code !== classroom.code) {
            const existingClassroom = await this.classroomRepository.findOne({
                where: { code: updateData.code },
            });
            if (existingClassroom) {
                throw new common_1.ConflictException(`Ya existe un aula con el código ${updateData.code}`);
            }
        }
        if (preferredEducationalLevelId) {
            const educationalLevel = await this.educationalLevelRepository.findOne({
                where: { id: preferredEducationalLevelId },
            });
            if (!educationalLevel) {
                throw new common_1.NotFoundException(`Nivel educativo con ID ${preferredEducationalLevelId} no encontrado`);
            }
            classroom.preferredEducationalLevel = educationalLevel;
        }
        Object.assign(classroom, updateData);
        return this.classroomRepository.save(classroom);
    }
    async removeClassroom(id) {
        const classroom = await this.findOneClassroom(id);
        const activeSchedules = await this.scheduleSessionRepository.count({
            where: { classroom: { id }, isActive: true },
        });
        if (activeSchedules > 0) {
            throw new common_1.BadRequestException(`No se puede eliminar el aula ${classroom.name} porque tiene horarios activos asignados`);
        }
        await this.classroomRepository.remove(classroom);
    }
    async findAllTimeSlots() {
        return this.timeSlotRepository.find({
            relations: ['educationalLevel'],
            order: { educationalLevel: { code: 'ASC' }, order: 'ASC' },
        });
    }
    async findTimeSlotsByEducationalLevel(educationalLevelId) {
        return this.timeSlotRepository.find({
            where: { educationalLevel: { id: educationalLevelId } },
            relations: ['educationalLevel'],
            order: { order: 'ASC' },
        });
    }
    async findOneTimeSlot(id) {
        const timeSlot = await this.timeSlotRepository.findOne({
            where: { id },
            relations: ['educationalLevel'],
        });
        if (!timeSlot) {
            throw new common_1.NotFoundException(`Franja horaria con ID ${id} no encontrada`);
        }
        return timeSlot;
    }
    async createTimeSlot(createTimeSlotDto) {
        const { educationalLevelId, ...timeSlotData } = createTimeSlotDto;
        const educationalLevel = await this.educationalLevelRepository.findOne({
            where: { id: educationalLevelId },
        });
        if (!educationalLevel) {
            throw new common_1.NotFoundException(`Nivel educativo con ID ${educationalLevelId} no encontrado`);
        }
        if (timeSlotData.startTime >= timeSlotData.endTime) {
            throw new common_1.BadRequestException('La hora de inicio debe ser anterior a la hora de fin');
        }
        const overlappingSlot = await this.timeSlotRepository
            .createQueryBuilder('timeSlot')
            .where('timeSlot.educationalLevel.id = :educationalLevelId', { educationalLevelId })
            .andWhere('timeSlot.isActive = true')
            .andWhere('(timeSlot.startTime < :endTime AND timeSlot.endTime > :startTime)', {
            startTime: timeSlotData.startTime,
            endTime: timeSlotData.endTime,
        })
            .getOne();
        if (overlappingSlot) {
            throw new common_1.ConflictException(`Ya existe una franja horaria que se superpone: ${overlappingSlot.name}`);
        }
        const timeSlot = this.timeSlotRepository.create({
            ...timeSlotData,
            educationalLevel,
        });
        return this.timeSlotRepository.save(timeSlot);
    }
    async updateTimeSlot(id, updateTimeSlotDto) {
        const timeSlot = await this.findOneTimeSlot(id);
        const { educationalLevelId, ...updateData } = updateTimeSlotDto;
        if (educationalLevelId) {
            const educationalLevel = await this.educationalLevelRepository.findOne({
                where: { id: educationalLevelId },
            });
            if (!educationalLevel) {
                throw new common_1.NotFoundException(`Nivel educativo con ID ${educationalLevelId} no encontrado`);
            }
            timeSlot.educationalLevel = educationalLevel;
        }
        const startTime = updateData.startTime || timeSlot.startTime;
        const endTime = updateData.endTime || timeSlot.endTime;
        if (startTime >= endTime) {
            throw new common_1.BadRequestException('La hora de inicio debe ser anterior a la hora de fin');
        }
        Object.assign(timeSlot, updateData);
        return this.timeSlotRepository.save(timeSlot);
    }
    async removeTimeSlot(id) {
        const timeSlot = await this.findOneTimeSlot(id);
        const activeSchedules = await this.scheduleSessionRepository.count({
            where: { timeSlot: { id }, isActive: true },
        });
        if (activeSchedules > 0) {
            throw new common_1.BadRequestException(`No se puede eliminar la franja horaria ${timeSlot.name} porque tiene horarios activos asignados`);
        }
        await this.timeSlotRepository.remove(timeSlot);
    }
    async findAllScheduleSessions() {
        return this.scheduleSessionRepository.find({
            relations: [
                'subjectAssignment',
                'subjectAssignment.teacher',
                'subjectAssignment.teacher.user',
                'subjectAssignment.teacher.user.profile',
                'subjectAssignment.subject',
                'subjectAssignment.classGroup',
                'classroom',
                'timeSlot',
                'academicYear',
            ],
            order: { dayOfWeek: 'ASC', timeSlot: { order: 'ASC' } },
        });
    }
    async findScheduleSessionsByTeacher(teacherId) {
        return this.scheduleSessionRepository.find({
            where: {
                subjectAssignment: { teacher: { id: teacherId } },
                isActive: true
            },
            relations: [
                'subjectAssignment',
                'subjectAssignment.subject',
                'subjectAssignment.classGroup',
                'classroom',
                'timeSlot',
                'academicYear',
            ],
            order: { dayOfWeek: 'ASC', timeSlot: { order: 'ASC' } },
        });
    }
    async findScheduleSessionsByClassGroup(classGroupId) {
        return this.scheduleSessionRepository.find({
            where: {
                subjectAssignment: { classGroup: { id: classGroupId } },
                isActive: true
            },
            relations: [
                'subjectAssignment',
                'subjectAssignment.teacher',
                'subjectAssignment.teacher.user',
                'subjectAssignment.teacher.user.profile',
                'subjectAssignment.subject',
                'classroom',
                'timeSlot',
                'academicYear',
            ],
            order: { dayOfWeek: 'ASC', timeSlot: { order: 'ASC' } },
        });
    }
    async findScheduleSessionsByClassroom(classroomId) {
        return this.scheduleSessionRepository.find({
            where: {
                classroom: { id: classroomId },
                isActive: true
            },
            relations: [
                'subjectAssignment',
                'subjectAssignment.teacher',
                'subjectAssignment.teacher.user',
                'subjectAssignment.teacher.user.profile',
                'subjectAssignment.subject',
                'subjectAssignment.classGroup',
                'timeSlot',
                'academicYear',
            ],
            order: { dayOfWeek: 'ASC', timeSlot: { order: 'ASC' } },
        });
    }
    async createScheduleSession(createScheduleSessionDto) {
        const { subjectAssignmentId, classroomId, timeSlotId, academicYearId, ...sessionData } = createScheduleSessionDto;
        const subjectAssignment = await this.subjectAssignmentRepository.findOne({
            where: { id: subjectAssignmentId },
            relations: ['teacher', 'subject', 'classGroup'],
        });
        if (!subjectAssignment) {
            throw new common_1.NotFoundException(`Asignación de asignatura con ID ${subjectAssignmentId} no encontrada`);
        }
        const classroom = await this.classroomRepository.findOne({
            where: { id: classroomId },
        });
        if (!classroom) {
            throw new common_1.NotFoundException(`Aula con ID ${classroomId} no encontrada`);
        }
        const timeSlot = await this.timeSlotRepository.findOne({
            where: { id: timeSlotId },
        });
        if (!timeSlot) {
            throw new common_1.NotFoundException(`Franja horaria con ID ${timeSlotId} no encontrada`);
        }
        const academicYear = await this.academicYearRepository.findOne({
            where: { id: academicYearId },
        });
        if (!academicYear) {
            throw new common_1.NotFoundException(`Año académico con ID ${academicYearId} no encontrado`);
        }
        await this.checkScheduleConflicts(createScheduleSessionDto);
        const scheduleSession = this.scheduleSessionRepository.create({
            ...sessionData,
            subjectAssignment,
            classroom,
            timeSlot,
            academicYear,
        });
        return this.scheduleSessionRepository.save(scheduleSession);
    }
    async checkScheduleConflicts(scheduleDto) {
        const { subjectAssignmentId, classroomId, timeSlotId, dayOfWeek, academicYearId } = scheduleDto;
        const classroomConflict = await this.scheduleSessionRepository.findOne({
            where: {
                classroom: { id: classroomId },
                timeSlot: { id: timeSlotId },
                dayOfWeek,
                academicYear: { id: academicYearId },
                isActive: true,
            },
        });
        if (classroomConflict) {
            throw new common_1.ConflictException('El aula ya está ocupada en ese horario');
        }
        const subjectAssignment = await this.subjectAssignmentRepository.findOne({
            where: { id: subjectAssignmentId },
            relations: ['teacher', 'classGroup'],
        });
        if (!subjectAssignment) {
            throw new common_1.NotFoundException(`Asignación de asignatura con ID ${subjectAssignmentId} no encontrada`);
        }
        if (!subjectAssignment.teacher) {
            throw new common_1.NotFoundException(`La asignación de asignatura con ID ${subjectAssignmentId} no tiene profesor asignado`);
        }
        if (!subjectAssignment.classGroup) {
            throw new common_1.NotFoundException(`La asignación de asignatura con ID ${subjectAssignmentId} no tiene grupo de clase asignado`);
        }
        const teacherConflict = await this.scheduleSessionRepository.findOne({
            where: {
                subjectAssignment: { teacher: { id: subjectAssignment.teacher.id } },
                timeSlot: { id: timeSlotId },
                dayOfWeek,
                academicYear: { id: academicYearId },
                isActive: true,
            },
        });
        if (teacherConflict) {
            throw new common_1.ConflictException('El profesor ya tiene una clase asignada en ese horario');
        }
        const classGroupConflict = await this.scheduleSessionRepository.findOne({
            where: {
                subjectAssignment: { classGroup: { id: subjectAssignment.classGroup.id } },
                timeSlot: { id: timeSlotId },
                dayOfWeek,
                academicYear: { id: academicYearId },
                isActive: true,
            },
        });
        if (classGroupConflict) {
            throw new common_1.ConflictException('El grupo de clase ya tiene una asignatura asignada en ese horario');
        }
    }
    async updateScheduleSession(id, updateScheduleSessionDto) {
        const scheduleSession = await this.scheduleSessionRepository.findOne({
            where: { id },
            relations: ['subjectAssignment', 'classroom', 'timeSlot', 'academicYear'],
        });
        if (!scheduleSession) {
            throw new common_1.NotFoundException(`Sesión de horario con ID ${id} no encontrada`);
        }
        const conflictFields = ['subjectAssignmentId', 'classroomId', 'timeSlotId', 'dayOfWeek', 'academicYearId'];
        const hasConflictChanges = conflictFields.some(field => updateScheduleSessionDto[field] !== undefined);
        if (hasConflictChanges) {
            const conflictDto = {
                subjectAssignmentId: updateScheduleSessionDto.subjectAssignmentId || scheduleSession.subjectAssignment.id,
                classroomId: updateScheduleSessionDto.classroomId || scheduleSession.classroom.id,
                timeSlotId: updateScheduleSessionDto.timeSlotId || scheduleSession.timeSlot.id,
                dayOfWeek: updateScheduleSessionDto.dayOfWeek || scheduleSession.dayOfWeek,
                academicYearId: updateScheduleSessionDto.academicYearId || scheduleSession.academicYear.id,
            };
            scheduleSession.isActive = false;
            await this.scheduleSessionRepository.save(scheduleSession);
            try {
                await this.checkScheduleConflicts(conflictDto);
            }
            catch (error) {
                scheduleSession.isActive = true;
                await this.scheduleSessionRepository.save(scheduleSession);
                throw error;
            }
            scheduleSession.isActive = true;
        }
        if (updateScheduleSessionDto.subjectAssignmentId) {
            const subjectAssignment = await this.subjectAssignmentRepository.findOne({
                where: { id: updateScheduleSessionDto.subjectAssignmentId },
            });
            if (!subjectAssignment) {
                throw new common_1.NotFoundException(`Asignación de asignatura con ID ${updateScheduleSessionDto.subjectAssignmentId} no encontrada`);
            }
            scheduleSession.subjectAssignment = subjectAssignment;
        }
        if (updateScheduleSessionDto.classroomId) {
            const classroom = await this.classroomRepository.findOne({
                where: { id: updateScheduleSessionDto.classroomId },
            });
            if (!classroom) {
                throw new common_1.NotFoundException(`Aula con ID ${updateScheduleSessionDto.classroomId} no encontrada`);
            }
            scheduleSession.classroom = classroom;
        }
        if (updateScheduleSessionDto.timeSlotId) {
            const timeSlot = await this.timeSlotRepository.findOne({
                where: { id: updateScheduleSessionDto.timeSlotId },
            });
            if (!timeSlot) {
                throw new common_1.NotFoundException(`Franja horaria con ID ${updateScheduleSessionDto.timeSlotId} no encontrada`);
            }
            scheduleSession.timeSlot = timeSlot;
        }
        if (updateScheduleSessionDto.academicYearId) {
            const academicYear = await this.academicYearRepository.findOne({
                where: { id: updateScheduleSessionDto.academicYearId },
            });
            if (!academicYear) {
                throw new common_1.NotFoundException(`Año académico con ID ${updateScheduleSessionDto.academicYearId} no encontrado`);
            }
            scheduleSession.academicYear = academicYear;
        }
        Object.assign(scheduleSession, {
            dayOfWeek: updateScheduleSessionDto.dayOfWeek,
            startDate: updateScheduleSessionDto.startDate,
            endDate: updateScheduleSessionDto.endDate,
            isActive: updateScheduleSessionDto.isActive,
            notes: updateScheduleSessionDto.notes,
        });
        return this.scheduleSessionRepository.save(scheduleSession);
    }
    async removeScheduleSession(id) {
        const scheduleSession = await this.scheduleSessionRepository.findOne({
            where: { id },
        });
        if (!scheduleSession) {
            throw new common_1.NotFoundException(`Sesión de horario con ID ${id} no encontrada`);
        }
        await this.scheduleSessionRepository.remove(scheduleSession);
    }
};
exports.SchedulesService = SchedulesService;
exports.SchedulesService = SchedulesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(classroom_entity_1.Classroom)),
    __param(1, (0, typeorm_1.InjectRepository)(time_slot_entity_1.TimeSlot)),
    __param(2, (0, typeorm_1.InjectRepository)(schedule_session_entity_1.ScheduleSession)),
    __param(3, (0, typeorm_1.InjectRepository)(academic_calendar_entity_1.AcademicCalendar)),
    __param(4, (0, typeorm_1.InjectRepository)(educational_level_entity_1.EducationalLevel)),
    __param(5, (0, typeorm_1.InjectRepository)(subject_assignment_entity_1.SubjectAssignment)),
    __param(6, (0, typeorm_1.InjectRepository)(academic_year_entity_1.AcademicYear)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], SchedulesService);
//# sourceMappingURL=schedules.service.js.map