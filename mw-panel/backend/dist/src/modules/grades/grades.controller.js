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
exports.GradesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const user_entity_1 = require("../users/entities/user.entity");
const grades_service_1 = require("./grades.service");
const student_grades_dto_1 = require("./dto/student-grades.dto");
let GradesController = class GradesController {
    constructor(gradesService) {
        this.gradesService = gradesService;
    }
    async getStudentGrades(studentId, req) {
        return this.gradesService.getStudentGrades(studentId, req.user.id, req.user.role);
    }
    async getMyGrades(req) {
        const student = await this.gradesService.getStudentByUserId(req.user.id);
        return this.gradesService.getStudentGrades(student.id, req.user.id, user_entity_1.UserRole.STUDENT);
    }
    async getFamilyChildrenGrades(req) {
        return this.gradesService.getFamilyChildrenGrades(req.user.id);
    }
    async getFamilyChildGrades(studentId, req) {
        return this.gradesService.getStudentGrades(studentId, req.user.id, user_entity_1.UserRole.FAMILY);
    }
    async getClassGrades(classGroupId, subjectId, req) {
        return this.gradesService.getClassGrades(classGroupId, subjectId, req.user.id);
    }
    async getTeacherClassesSummary(req) {
        return this.gradesService.getTeacherClassesSummary(req.user.id);
    }
    async getSchoolGradesOverview(levelId, courseId, classGroupId) {
        return this.gradesService.getSchoolGradesOverview({
            levelId,
            courseId,
            classGroupId,
        });
    }
    async exportStudentGrades(studentId, period, req) {
        return this.gradesService.exportStudentGrades(studentId, req.user.id, req.user.role, period);
    }
};
exports.GradesController = GradesController;
__decorate([
    (0, common_1.Get)('student/:studentId'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.TEACHER, user_entity_1.UserRole.STUDENT, user_entity_1.UserRole.FAMILY),
    (0, swagger_1.ApiOperation)({ summary: 'Get all grades for a specific student' }),
    (0, swagger_1.ApiParam)({ name: 'studentId', description: 'Student ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Student grades retrieved successfully',
        type: student_grades_dto_1.StudentGradesResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Student not found' }),
    __param(0, (0, common_1.Param)('studentId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], GradesController.prototype, "getStudentGrades", null);
__decorate([
    (0, common_1.Get)('my-grades'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.STUDENT),
    (0, swagger_1.ApiOperation)({ summary: 'Get current student\'s own grades' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Student grades retrieved successfully',
        type: student_grades_dto_1.StudentGradesResponseDto,
    }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GradesController.prototype, "getMyGrades", null);
__decorate([
    (0, common_1.Get)('family/children'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.FAMILY),
    (0, swagger_1.ApiOperation)({ summary: 'Get grades for all children of a family' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Children grades retrieved successfully',
        type: [student_grades_dto_1.StudentGradesResponseDto],
    }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GradesController.prototype, "getFamilyChildrenGrades", null);
__decorate([
    (0, common_1.Get)('family/child/:studentId'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.FAMILY),
    (0, swagger_1.ApiOperation)({ summary: 'Get grades for a specific child' }),
    (0, swagger_1.ApiParam)({ name: 'studentId', description: 'Student ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Child grades retrieved successfully',
        type: student_grades_dto_1.StudentGradesResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Not authorized to view this student' }),
    __param(0, (0, common_1.Param)('studentId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], GradesController.prototype, "getFamilyChildGrades", null);
__decorate([
    (0, common_1.Get)('teacher/class/:classGroupId/subject/:subjectId'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.TEACHER),
    (0, swagger_1.ApiOperation)({ summary: 'Get grades for all students in a class for a specific subject' }),
    (0, swagger_1.ApiParam)({ name: 'classGroupId', description: 'Class group ID' }),
    (0, swagger_1.ApiParam)({ name: 'subjectId', description: 'Subject ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Class grades retrieved successfully',
        type: student_grades_dto_1.ClassGradesResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Not authorized for this class/subject' }),
    __param(0, (0, common_1.Param)('classGroupId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Param)('subjectId', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], GradesController.prototype, "getClassGrades", null);
__decorate([
    (0, common_1.Get)('teacher/my-classes'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.TEACHER),
    (0, swagger_1.ApiOperation)({ summary: 'Get summary of grades for all teacher\'s classes' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Teacher classes summary retrieved successfully',
    }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GradesController.prototype, "getTeacherClassesSummary", null);
__decorate([
    (0, common_1.Get)('admin/overview'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get grades overview for the entire school' }),
    (0, swagger_1.ApiQuery)({ name: 'levelId', required: false, description: 'Filter by educational level' }),
    (0, swagger_1.ApiQuery)({ name: 'courseId', required: false, description: 'Filter by course' }),
    (0, swagger_1.ApiQuery)({ name: 'classGroupId', required: false, description: 'Filter by class group' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'School grades overview retrieved successfully',
    }),
    __param(0, (0, common_1.Query)('levelId')),
    __param(1, (0, common_1.Query)('courseId')),
    __param(2, (0, common_1.Query)('classGroupId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], GradesController.prototype, "getSchoolGradesOverview", null);
__decorate([
    (0, common_1.Get)('export/student/:studentId'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.TEACHER, user_entity_1.UserRole.FAMILY),
    (0, swagger_1.ApiOperation)({ summary: 'Export student grades as PDF' }),
    (0, swagger_1.ApiParam)({ name: 'studentId', description: 'Student ID' }),
    (0, swagger_1.ApiQuery)({ name: 'period', required: false, description: 'Academic period' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'PDF generated successfully',
        content: {
            'application/pdf': {
                schema: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    }),
    __param(0, (0, common_1.Param)('studentId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Query)('period')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], GradesController.prototype, "exportStudentGrades", null);
exports.GradesController = GradesController = __decorate([
    (0, swagger_1.ApiTags)('grades'),
    (0, common_1.Controller)('grades'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [grades_service_1.GradesService])
], GradesController);
//# sourceMappingURL=grades.controller.js.map