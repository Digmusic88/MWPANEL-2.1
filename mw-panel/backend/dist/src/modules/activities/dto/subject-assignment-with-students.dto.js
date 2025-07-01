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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubjectAssignmentWithStudentsDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class SubjectAssignmentWithStudentsDto {
}
exports.SubjectAssignmentWithStudentsDto = SubjectAssignmentWithStudentsDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID de la asignación de asignatura' }),
    __metadata("design:type", String)
], SubjectAssignmentWithStudentsDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Información de la asignatura' }),
    __metadata("design:type", Object)
], SubjectAssignmentWithStudentsDto.prototype, "subject", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Información del grupo de clase' }),
    __metadata("design:type", Object)
], SubjectAssignmentWithStudentsDto.prototype, "classGroup", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Información del año académico' }),
    __metadata("design:type", Object)
], SubjectAssignmentWithStudentsDto.prototype, "academicYear", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Horas semanales' }),
    __metadata("design:type", Number)
], SubjectAssignmentWithStudentsDto.prototype, "weeklyHours", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Estudiantes del grupo en esta asignatura' }),
    __metadata("design:type", Array)
], SubjectAssignmentWithStudentsDto.prototype, "students", void 0);
//# sourceMappingURL=subject-assignment-with-students.dto.js.map