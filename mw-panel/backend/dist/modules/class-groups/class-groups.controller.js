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
exports.ClassGroupsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const class_groups_service_1 = require("./class-groups.service");
const create_class_group_dto_1 = require("./dto/create-class-group.dto");
const update_class_group_dto_1 = require("./dto/update-class-group.dto");
const assign_students_dto_1 = require("./dto/assign-students.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const user_entity_1 = require("../users/entities/user.entity");
let ClassGroupsController = class ClassGroupsController {
    constructor(classGroupsService) {
        this.classGroupsService = classGroupsService;
    }
    async findAll(academicYearId, courseId, tutorId) {
        if (academicYearId) {
            return this.classGroupsService.findByAcademicYear(academicYearId);
        }
        if (courseId) {
            return this.classGroupsService.findByCourse(courseId);
        }
        if (tutorId) {
            return this.classGroupsService.findByTutor(tutorId);
        }
        return this.classGroupsService.findAll();
    }
    async getAvailableStudents(courseId) {
        return this.classGroupsService.getAvailableStudents(courseId);
    }
    async getAvailableTeachers() {
        return this.classGroupsService.getAvailableTeachers();
    }
    async getAvailableCourses() {
        return this.classGroupsService.getAvailableCourses();
    }
    async findOne(id) {
        return this.classGroupsService.findOne(id);
    }
    async create(createClassGroupDto) {
        return this.classGroupsService.create(createClassGroupDto);
    }
    async update(id, updateClassGroupDto) {
        return this.classGroupsService.update(id, updateClassGroupDto);
    }
    async assignStudents(id, assignStudentsDto) {
        return this.classGroupsService.assignStudents(id, assignStudentsDto);
    }
    async removeStudent(id, studentId) {
        return this.classGroupsService.removeStudent(id, studentId);
    }
    async assignTutor(id, tutorId) {
        return this.classGroupsService.assignTutor(id, tutorId);
    }
    async removeTutor(id) {
        return this.classGroupsService.removeTutor(id);
    }
    async remove(id) {
        return this.classGroupsService.remove(id);
    }
};
exports.ClassGroupsController = ClassGroupsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener todos los grupos de clase' }),
    (0, swagger_1.ApiQuery)({ name: 'academicYearId', required: false, description: 'Filtrar por año académico' }),
    (0, swagger_1.ApiQuery)({ name: 'courseId', required: false, description: 'Filtrar por curso' }),
    (0, swagger_1.ApiQuery)({ name: 'tutorId', required: false, description: 'Filtrar por tutor' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lista de grupos de clase obtenida exitosamente' }),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.TEACHER),
    __param(0, (0, common_1.Query)('academicYearId')),
    __param(1, (0, common_1.Query)('courseId')),
    __param(2, (0, common_1.Query)('tutorId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], ClassGroupsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('available-students'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener estudiantes disponibles para asignar' }),
    (0, swagger_1.ApiQuery)({ name: 'courseId', required: false, description: 'Filtrar por curso' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lista de estudiantes disponibles' }),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN),
    __param(0, (0, common_1.Query)('courseId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ClassGroupsController.prototype, "getAvailableStudents", null);
__decorate([
    (0, common_1.Get)('available-teachers'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener profesores disponibles para asignar como tutores' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lista de profesores disponibles' }),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ClassGroupsController.prototype, "getAvailableTeachers", null);
__decorate([
    (0, common_1.Get)('available-courses'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener cursos disponibles' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lista de cursos disponibles' }),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.TEACHER),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ClassGroupsController.prototype, "getAvailableCourses", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener un grupo de clase por ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Grupo de clase encontrado' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Grupo de clase no encontrado' }),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.TEACHER),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ClassGroupsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Crear un nuevo grupo de clase' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Grupo de clase creado exitosamente' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Datos de entrada inválidos' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Grupo de clase ya existe' }),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_class_group_dto_1.CreateClassGroupDto]),
    __metadata("design:returntype", Promise)
], ClassGroupsController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Actualizar un grupo de clase' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Grupo de clase actualizado exitosamente' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Grupo de clase no encontrado' }),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_class_group_dto_1.UpdateClassGroupDto]),
    __metadata("design:returntype", Promise)
], ClassGroupsController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/students'),
    (0, swagger_1.ApiOperation)({ summary: 'Asignar estudiantes a un grupo de clase' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Estudiantes asignados exitosamente' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Grupo de clase o estudiantes no encontrados' }),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, assign_students_dto_1.AssignStudentsDto]),
    __metadata("design:returntype", Promise)
], ClassGroupsController.prototype, "assignStudents", null);
__decorate([
    (0, common_1.Delete)(':id/students/:studentId'),
    (0, swagger_1.ApiOperation)({ summary: 'Remover un estudiante de un grupo de clase' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Estudiante removido exitosamente' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Grupo de clase no encontrado' }),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('studentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ClassGroupsController.prototype, "removeStudent", null);
__decorate([
    (0, common_1.Post)(':id/tutor/:tutorId'),
    (0, swagger_1.ApiOperation)({ summary: 'Asignar tutor a un grupo de clase' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Tutor asignado exitosamente' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Grupo de clase o profesor no encontrado' }),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('tutorId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ClassGroupsController.prototype, "assignTutor", null);
__decorate([
    (0, common_1.Delete)(':id/tutor'),
    (0, swagger_1.ApiOperation)({ summary: 'Remover tutor de un grupo de clase' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Tutor removido exitosamente' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Grupo de clase no encontrado' }),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ClassGroupsController.prototype, "removeTutor", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Eliminar un grupo de clase' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Grupo de clase eliminado exitosamente' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Grupo de clase no encontrado' }),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ClassGroupsController.prototype, "remove", null);
exports.ClassGroupsController = ClassGroupsController = __decorate([
    (0, swagger_1.ApiTags)('Grupos de Clase'),
    (0, common_1.Controller)('class-groups'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [class_groups_service_1.ClassGroupsService])
], ClassGroupsController);
//# sourceMappingURL=class-groups.controller.js.map