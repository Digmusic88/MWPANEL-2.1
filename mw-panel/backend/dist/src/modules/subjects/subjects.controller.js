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
exports.SubjectsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const subjects_service_1 = require("./subjects.service");
const create_subject_dto_1 = require("./dto/create-subject.dto");
const update_subject_dto_1 = require("./dto/update-subject.dto");
const create_subject_assignment_dto_1 = require("./dto/create-subject-assignment.dto");
const update_subject_assignment_dto_1 = require("./dto/update-subject-assignment.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const user_entity_1 = require("../users/entities/user.entity");
let SubjectsController = class SubjectsController {
    constructor(subjectsService) {
        this.subjectsService = subjectsService;
    }
    findAllSubjects() {
        return this.subjectsService.findAllSubjects();
    }
    createSubject(createSubjectDto) {
        return this.subjectsService.createSubject(createSubjectDto);
    }
    getMyAssignments(req) {
        return this.subjectsService.findAssignmentsByTeacher(req.user.sub);
    }
    findSubjectsByCourse(courseId) {
        return this.subjectsService.findSubjectsByCourse(courseId);
    }
    findOneSubject(id) {
        return this.subjectsService.findOneSubject(id);
    }
    updateSubject(id, updateSubjectDto) {
        return this.subjectsService.updateSubject(id, updateSubjectDto);
    }
    removeSubject(id) {
        return this.subjectsService.removeSubject(id);
    }
    findAllAssignments() {
        return this.subjectsService.findAllAssignments();
    }
    createAssignment(createAssignmentDto) {
        return this.subjectsService.createAssignment(createAssignmentDto);
    }
    findAssignmentsByTeacher(teacherId) {
        return this.subjectsService.findAssignmentsByTeacher(teacherId);
    }
    findAssignmentsByClassGroup(classGroupId) {
        return this.subjectsService.findAssignmentsByClassGroup(classGroupId);
    }
    findAssignmentsByAcademicYear(academicYearId) {
        return this.subjectsService.findAssignmentsByAcademicYear(academicYearId);
    }
    findOneAssignment(id) {
        return this.subjectsService.findOneAssignment(id);
    }
    updateAssignment(id, updateAssignmentDto) {
        return this.subjectsService.updateAssignment(id, updateAssignmentDto);
    }
    removeAssignment(id) {
        return this.subjectsService.removeAssignment(id);
    }
    findSubjectsByStudent(studentId) {
        return this.subjectsService.findSubjectsByStudent(studentId);
    }
    findSubjectsByTeacher(teacherId) {
        return this.subjectsService.findSubjectsByTeacher(teacherId);
    }
    findSubjectsByTeacherAndGroup(teacherId, groupId) {
        return this.subjectsService.findSubjectsByTeacherAndGroup(teacherId, groupId);
    }
    findAssignmentDetails(teacherId, subjectId, classGroupId) {
        return this.subjectsService.findAssignmentDetails(teacherId, subjectId, classGroupId);
    }
    getSubjectStatistics() {
        return this.subjectsService.getSubjectStatistics();
    }
    canTeacherEvaluateSubject(teacherId, subjectId, studentId) {
        return this.subjectsService.canTeacherEvaluateSubject(teacherId, subjectId, studentId);
    }
};
exports.SubjectsController = SubjectsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener todas las asignaturas' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lista de asignaturas obtenida exitosamente' }),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.TEACHER),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SubjectsController.prototype, "findAllSubjects", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Crear nueva asignatura' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Asignatura creada exitosamente' }),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_subject_dto_1.CreateSubjectDto]),
    __metadata("design:returntype", void 0)
], SubjectsController.prototype, "createSubject", null);
__decorate([
    (0, common_1.Get)('my-assignments'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener asignaciones del profesor logueado' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Asignaciones del profesor obtenidas exitosamente' }),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.TEACHER),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SubjectsController.prototype, "getMyAssignments", null);
__decorate([
    (0, common_1.Get)('by-course/:courseId'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener asignaturas por curso' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Asignaturas del curso obtenidas exitosamente' }),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.TEACHER),
    __param(0, (0, common_1.Param)('courseId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SubjectsController.prototype, "findSubjectsByCourse", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener asignatura por ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Asignatura obtenida exitosamente' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Asignatura no encontrada' }),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.TEACHER),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SubjectsController.prototype, "findOneSubject", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Actualizar asignatura' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Asignatura actualizada exitosamente' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Asignatura no encontrada' }),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_subject_dto_1.UpdateSubjectDto]),
    __metadata("design:returntype", void 0)
], SubjectsController.prototype, "updateSubject", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Eliminar asignatura' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Asignatura eliminada exitosamente' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Asignatura no encontrada' }),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SubjectsController.prototype, "removeSubject", null);
__decorate([
    (0, common_1.Get)('assignments/all'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener todas las asignaciones de asignaturas' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lista de asignaciones obtenida exitosamente' }),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.TEACHER),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SubjectsController.prototype, "findAllAssignments", null);
__decorate([
    (0, common_1.Post)('assignments'),
    (0, swagger_1.ApiOperation)({ summary: 'Crear nueva asignación de asignatura' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Asignación creada exitosamente' }),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_subject_assignment_dto_1.CreateSubjectAssignmentDto]),
    __metadata("design:returntype", void 0)
], SubjectsController.prototype, "createAssignment", null);
__decorate([
    (0, common_1.Get)('assignments/teacher/:teacherId'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener asignaciones por profesor' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Asignaciones del profesor obtenidas exitosamente' }),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.TEACHER),
    __param(0, (0, common_1.Param)('teacherId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SubjectsController.prototype, "findAssignmentsByTeacher", null);
__decorate([
    (0, common_1.Get)('assignments/class-group/:classGroupId'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener asignaciones por grupo de clase' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Asignaciones del grupo obtenidas exitosamente' }),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.TEACHER),
    __param(0, (0, common_1.Param)('classGroupId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SubjectsController.prototype, "findAssignmentsByClassGroup", null);
__decorate([
    (0, common_1.Get)('assignments/academic-year/:academicYearId'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener asignaciones por año académico' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Asignaciones del año académico obtenidas exitosamente' }),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.TEACHER),
    __param(0, (0, common_1.Param)('academicYearId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SubjectsController.prototype, "findAssignmentsByAcademicYear", null);
__decorate([
    (0, common_1.Get)('assignments/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener asignación por ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Asignación obtenida exitosamente' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Asignación no encontrada' }),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.TEACHER),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SubjectsController.prototype, "findOneAssignment", null);
__decorate([
    (0, common_1.Patch)('assignments/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Actualizar asignación de asignatura' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Asignación actualizada exitosamente' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Asignación no encontrada' }),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_subject_assignment_dto_1.UpdateSubjectAssignmentDto]),
    __metadata("design:returntype", void 0)
], SubjectsController.prototype, "updateAssignment", null);
__decorate([
    (0, common_1.Delete)('assignments/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Eliminar asignación de asignatura' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Asignación eliminada exitosamente' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Asignación no encontrada' }),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SubjectsController.prototype, "removeAssignment", null);
__decorate([
    (0, common_1.Get)('student/:studentId'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener asignaturas de un estudiante' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Asignaturas del estudiante obtenidas exitosamente' }),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.TEACHER, user_entity_1.UserRole.FAMILY),
    __param(0, (0, common_1.Param)('studentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SubjectsController.prototype, "findSubjectsByStudent", null);
__decorate([
    (0, common_1.Get)('teacher/:teacherId'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener asignaturas que imparte un profesor' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Asignaturas del profesor obtenidas exitosamente' }),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.TEACHER),
    __param(0, (0, common_1.Param)('teacherId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SubjectsController.prototype, "findSubjectsByTeacher", null);
__decorate([
    (0, common_1.Get)('teacher/:teacherId/group/:groupId'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener asignaturas que un profesor imparte a un grupo específico' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Asignaturas obtenidas exitosamente' }),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.TEACHER),
    __param(0, (0, common_1.Param)('teacherId')),
    __param(1, (0, common_1.Param)('groupId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], SubjectsController.prototype, "findSubjectsByTeacherAndGroup", null);
__decorate([
    (0, common_1.Get)('assignment-details'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener detalles de asignación específica' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Detalles de asignación obtenidos exitosamente' }),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.TEACHER),
    __param(0, (0, common_1.Query)('teacherId')),
    __param(1, (0, common_1.Query)('subjectId')),
    __param(2, (0, common_1.Query)('classGroupId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], SubjectsController.prototype, "findAssignmentDetails", null);
__decorate([
    (0, common_1.Get)('statistics'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener estadísticas del sistema de asignaturas' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Estadísticas obtenidas exitosamente' }),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SubjectsController.prototype, "getSubjectStatistics", null);
__decorate([
    (0, common_1.Get)('can-evaluate'),
    (0, swagger_1.ApiOperation)({ summary: 'Verificar si un profesor puede evaluar una asignatura para un estudiante' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Verificación completada' }),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.TEACHER),
    __param(0, (0, common_1.Query)('teacherId')),
    __param(1, (0, common_1.Query)('subjectId')),
    __param(2, (0, common_1.Query)('studentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], SubjectsController.prototype, "canTeacherEvaluateSubject", null);
exports.SubjectsController = SubjectsController = __decorate([
    (0, swagger_1.ApiTags)('subjects'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('subjects'),
    __metadata("design:paramtypes", [subjects_service_1.SubjectsService])
], SubjectsController);
//# sourceMappingURL=subjects.controller.js.map