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
exports.SchedulesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const schedules_service_1 = require("./schedules.service");
const create_classroom_dto_1 = require("./dto/create-classroom.dto");
const update_classroom_dto_1 = require("./dto/update-classroom.dto");
const create_time_slot_dto_1 = require("./dto/create-time-slot.dto");
const update_time_slot_dto_1 = require("./dto/update-time-slot.dto");
const create_schedule_session_dto_1 = require("./dto/create-schedule-session.dto");
const update_schedule_session_dto_1 = require("./dto/update-schedule-session.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const user_entity_1 = require("../users/entities/user.entity");
let SchedulesController = class SchedulesController {
    constructor(schedulesService) {
        this.schedulesService = schedulesService;
    }
    findAllClassrooms() {
        return this.schedulesService.findAllClassrooms();
    }
    createClassroom(createClassroomDto) {
        return this.schedulesService.createClassroom(createClassroomDto);
    }
    findOneClassroom(id) {
        return this.schedulesService.findOneClassroom(id);
    }
    updateClassroom(id, updateClassroomDto) {
        return this.schedulesService.updateClassroom(id, updateClassroomDto);
    }
    removeClassroom(id) {
        return this.schedulesService.removeClassroom(id);
    }
    findAllTimeSlots() {
        return this.schedulesService.findAllTimeSlots();
    }
    findTimeSlotsByEducationalLevel(educationalLevelId) {
        return this.schedulesService.findTimeSlotsByEducationalLevel(educationalLevelId);
    }
    createTimeSlot(createTimeSlotDto) {
        return this.schedulesService.createTimeSlot(createTimeSlotDto);
    }
    findOneTimeSlot(id) {
        return this.schedulesService.findOneTimeSlot(id);
    }
    updateTimeSlot(id, updateTimeSlotDto) {
        return this.schedulesService.updateTimeSlot(id, updateTimeSlotDto);
    }
    removeTimeSlot(id) {
        return this.schedulesService.removeTimeSlot(id);
    }
    findAllScheduleSessions() {
        return this.schedulesService.findAllScheduleSessions();
    }
    findScheduleSessionsByTeacher(teacherId) {
        return this.schedulesService.findScheduleSessionsByTeacher(teacherId);
    }
    findScheduleSessionsByClassGroup(classGroupId) {
        return this.schedulesService.findScheduleSessionsByClassGroup(classGroupId);
    }
    findScheduleSessionsByClassroom(classroomId) {
        return this.schedulesService.findScheduleSessionsByClassroom(classroomId);
    }
    createScheduleSession(createScheduleSessionDto) {
        return this.schedulesService.createScheduleSession(createScheduleSessionDto);
    }
    updateScheduleSession(id, updateScheduleSessionDto) {
        return this.schedulesService.updateScheduleSession(id, updateScheduleSessionDto);
    }
    removeScheduleSession(id) {
        return this.schedulesService.removeScheduleSession(id);
    }
    findCurrentTeacherSchedule(request) {
        return this.schedulesService.findScheduleSessionsByTeacher(request.user?.id);
    }
};
exports.SchedulesController = SchedulesController;
__decorate([
    (0, common_1.Get)('classrooms'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener todas las aulas' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lista de aulas obtenida exitosamente' }),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.TEACHER),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SchedulesController.prototype, "findAllClassrooms", null);
__decorate([
    (0, common_1.Post)('classrooms'),
    (0, swagger_1.ApiOperation)({ summary: 'Crear nueva aula' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Aula creada exitosamente' }),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_classroom_dto_1.CreateClassroomDto]),
    __metadata("design:returntype", void 0)
], SchedulesController.prototype, "createClassroom", null);
__decorate([
    (0, common_1.Get)('classrooms/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener aula por ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Aula obtenida exitosamente' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Aula no encontrada' }),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.TEACHER),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SchedulesController.prototype, "findOneClassroom", null);
__decorate([
    (0, common_1.Patch)('classrooms/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Actualizar aula' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Aula actualizada exitosamente' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Aula no encontrada' }),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_classroom_dto_1.UpdateClassroomDto]),
    __metadata("design:returntype", void 0)
], SchedulesController.prototype, "updateClassroom", null);
__decorate([
    (0, common_1.Delete)('classrooms/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Eliminar aula' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Aula eliminada exitosamente' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Aula no encontrada' }),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SchedulesController.prototype, "removeClassroom", null);
__decorate([
    (0, common_1.Get)('time-slots'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener todas las franjas horarias' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lista de franjas horarias obtenida exitosamente' }),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.TEACHER),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SchedulesController.prototype, "findAllTimeSlots", null);
__decorate([
    (0, common_1.Get)('time-slots/by-educational-level/:educationalLevelId'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener franjas horarias por nivel educativo' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Franjas horarias del nivel educativo obtenidas exitosamente' }),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.TEACHER),
    __param(0, (0, common_1.Param)('educationalLevelId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SchedulesController.prototype, "findTimeSlotsByEducationalLevel", null);
__decorate([
    (0, common_1.Post)('time-slots'),
    (0, swagger_1.ApiOperation)({ summary: 'Crear nueva franja horaria' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Franja horaria creada exitosamente' }),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_time_slot_dto_1.CreateTimeSlotDto]),
    __metadata("design:returntype", void 0)
], SchedulesController.prototype, "createTimeSlot", null);
__decorate([
    (0, common_1.Get)('time-slots/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener franja horaria por ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Franja horaria obtenida exitosamente' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Franja horaria no encontrada' }),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.TEACHER),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SchedulesController.prototype, "findOneTimeSlot", null);
__decorate([
    (0, common_1.Patch)('time-slots/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Actualizar franja horaria' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Franja horaria actualizada exitosamente' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Franja horaria no encontrada' }),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_time_slot_dto_1.UpdateTimeSlotDto]),
    __metadata("design:returntype", void 0)
], SchedulesController.prototype, "updateTimeSlot", null);
__decorate([
    (0, common_1.Delete)('time-slots/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Eliminar franja horaria' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Franja horaria eliminada exitosamente' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Franja horaria no encontrada' }),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SchedulesController.prototype, "removeTimeSlot", null);
__decorate([
    (0, common_1.Get)('sessions'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener todas las sesiones de horario' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lista de sesiones de horario obtenida exitosamente' }),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.TEACHER),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SchedulesController.prototype, "findAllScheduleSessions", null);
__decorate([
    (0, common_1.Get)('sessions/by-teacher/:teacherId'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener horario por profesor' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Horario del profesor obtenido exitosamente' }),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.TEACHER),
    __param(0, (0, common_1.Param)('teacherId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SchedulesController.prototype, "findScheduleSessionsByTeacher", null);
__decorate([
    (0, common_1.Get)('sessions/by-class-group/:classGroupId'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener horario por grupo de clase' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Horario del grupo obtenido exitosamente' }),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.TEACHER),
    __param(0, (0, common_1.Param)('classGroupId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SchedulesController.prototype, "findScheduleSessionsByClassGroup", null);
__decorate([
    (0, common_1.Get)('sessions/by-classroom/:classroomId'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener horario por aula' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Horario del aula obtenido exitosamente' }),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.TEACHER),
    __param(0, (0, common_1.Param)('classroomId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SchedulesController.prototype, "findScheduleSessionsByClassroom", null);
__decorate([
    (0, common_1.Post)('sessions'),
    (0, swagger_1.ApiOperation)({ summary: 'Crear nueva sesión de horario' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Sesión de horario creada exitosamente' }),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_schedule_session_dto_1.CreateScheduleSessionDto]),
    __metadata("design:returntype", void 0)
], SchedulesController.prototype, "createScheduleSession", null);
__decorate([
    (0, common_1.Patch)('sessions/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Actualizar sesión de horario' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Sesión de horario actualizada exitosamente' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Sesión de horario no encontrada' }),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_schedule_session_dto_1.UpdateScheduleSessionDto]),
    __metadata("design:returntype", void 0)
], SchedulesController.prototype, "updateScheduleSession", null);
__decorate([
    (0, common_1.Delete)('sessions/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Eliminar sesión de horario' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Sesión de horario eliminada exitosamente' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Sesión de horario no encontrada' }),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SchedulesController.prototype, "removeScheduleSession", null);
__decorate([
    (0, common_1.Get)('teacher/current'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener horario del profesor actual' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Horario del profesor obtenido exitosamente' }),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.TEACHER),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SchedulesController.prototype, "findCurrentTeacherSchedule", null);
exports.SchedulesController = SchedulesController = __decorate([
    (0, swagger_1.ApiTags)('schedules'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('schedules'),
    __metadata("design:paramtypes", [schedules_service_1.SchedulesService])
], SchedulesController);
//# sourceMappingURL=schedules.controller.js.map