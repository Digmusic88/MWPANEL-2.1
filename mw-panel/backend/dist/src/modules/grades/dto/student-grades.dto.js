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
exports.ClassGradesResponseDto = exports.StudentGradesResponseDto = exports.GradeDetailDto = exports.SubjectGradeDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class SubjectGradeDto {
}
exports.SubjectGradeDto = SubjectGradeDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Subject ID' }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], SubjectGradeDto.prototype, "subjectId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Subject name' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SubjectGradeDto.prototype, "subjectName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Subject code' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SubjectGradeDto.prototype, "subjectCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Average grade from all sources', example: 8.5 }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], SubjectGradeDto.prototype, "averageGrade", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Task grades average', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], SubjectGradeDto.prototype, "taskAverage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Activity assessments average', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], SubjectGradeDto.prototype, "activityAverage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Competency evaluations average', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], SubjectGradeDto.prototype, "competencyAverage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Number of graded tasks' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], SubjectGradeDto.prototype, "gradedTasks", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Number of pending tasks' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], SubjectGradeDto.prototype, "pendingTasks", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Number of activity assessments' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], SubjectGradeDto.prototype, "activityAssessments", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Last update date' }),
    (0, class_transformer_1.Type)(() => Date),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], SubjectGradeDto.prototype, "lastUpdated", void 0);
class GradeDetailDto {
}
exports.GradeDetailDto = GradeDetailDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Grade source ID' }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], GradeDetailDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Type of grade', enum: ['task', 'activity', 'evaluation', 'exam'] }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GradeDetailDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Title of the graded item' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GradeDetailDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Grade value' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], GradeDetailDto.prototype, "grade", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Maximum possible grade' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], GradeDetailDto.prototype, "maxGrade", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Weight of this grade', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], GradeDetailDto.prototype, "weight", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Date when graded' }),
    (0, class_transformer_1.Type)(() => Date),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], GradeDetailDto.prototype, "gradedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Teacher feedback', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GradeDetailDto.prototype, "feedback", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Subject information' }),
    __metadata("design:type", Object)
], GradeDetailDto.prototype, "subject", void 0);
class StudentGradesResponseDto {
}
exports.StudentGradesResponseDto = StudentGradesResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Student information' }),
    __metadata("design:type", Object)
], StudentGradesResponseDto.prototype, "student", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Overall academic summary' }),
    __metadata("design:type", Object)
], StudentGradesResponseDto.prototype, "summary", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Grades by subject', type: [SubjectGradeDto] }),
    (0, class_validator_1.IsArray)(),
    (0, class_transformer_1.Type)(() => SubjectGradeDto),
    __metadata("design:type", Array)
], StudentGradesResponseDto.prototype, "subjectGrades", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Recent grade details', type: [GradeDetailDto] }),
    (0, class_validator_1.IsArray)(),
    (0, class_transformer_1.Type)(() => GradeDetailDto),
    __metadata("design:type", Array)
], StudentGradesResponseDto.prototype, "recentGrades", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Academic period' }),
    __metadata("design:type", Object)
], StudentGradesResponseDto.prototype, "academicPeriod", void 0);
class ClassGradesResponseDto {
}
exports.ClassGradesResponseDto = ClassGradesResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Class group information' }),
    __metadata("design:type", Object)
], ClassGradesResponseDto.prototype, "classGroup", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Subject information' }),
    __metadata("design:type", Object)
], ClassGradesResponseDto.prototype, "subject", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Students with their grades' }),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], ClassGradesResponseDto.prototype, "students", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Class statistics' }),
    __metadata("design:type", Object)
], ClassGradesResponseDto.prototype, "statistics", void 0);
//# sourceMappingURL=student-grades.dto.js.map