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
exports.AcademicRecordQueryDto = exports.UpdateAcademicRecordGradeDto = exports.CreateAcademicRecordGradeDto = exports.UpdateAcademicRecordEntryDto = exports.CreateAcademicRecordEntryDto = exports.UpdateAcademicRecordDto = exports.CreateAcademicRecordDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const academic_record_types_1 = require("../entities/academic-record.types");
class CreateAcademicRecordDto {
}
exports.CreateAcademicRecordDto = CreateAcademicRecordDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ID del estudiante',
        example: 'student-uuid',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateAcademicRecordDto.prototype, "studentId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Año académico',
        enum: academic_record_types_1.AcademicYear,
        example: academic_record_types_1.AcademicYear.YEAR_2024_2025,
    }),
    (0, class_validator_1.IsEnum)(academic_record_types_1.AcademicYear),
    __metadata("design:type", String)
], CreateAcademicRecordDto.prototype, "academicYear", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Estado del expediente',
        enum: academic_record_types_1.RecordStatus,
        example: academic_record_types_1.RecordStatus.ACTIVE,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(academic_record_types_1.RecordStatus),
    __metadata("design:type", String)
], CreateAcademicRecordDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Créditos totales',
        example: 120,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateAcademicRecordDto.prototype, "totalCredits", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Fecha de inicio del año académico',
        example: '2024-09-01',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateAcademicRecordDto.prototype, "startDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Fecha de fin del año académico',
        example: '2025-06-30',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateAcademicRecordDto.prototype, "endDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Observaciones generales',
        example: 'Estudiante destacado en matemáticas',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAcademicRecordDto.prototype, "observations", void 0);
class UpdateAcademicRecordDto {
}
exports.UpdateAcademicRecordDto = UpdateAcademicRecordDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Estado del expediente',
        enum: academic_record_types_1.RecordStatus,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(academic_record_types_1.RecordStatus),
    __metadata("design:type", String)
], UpdateAcademicRecordDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Promedio general final',
        example: 8.5,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDecimal)({ decimal_digits: '0,2' }),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(10),
    __metadata("design:type", Number)
], UpdateAcademicRecordDto.prototype, "finalGPA", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Créditos completados',
        example: 95,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdateAcademicRecordDto.prototype, "completedCredits", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Número de faltas',
        example: 5,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdateAcademicRecordDto.prototype, "absences", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Número de retrasos',
        example: 2,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdateAcademicRecordDto.prototype, "tardiness", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Si fue promovido',
        example: true,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateAcademicRecordDto.prototype, "isPromoted", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Notas sobre la promoción',
        example: 'Promovido con excelencia académica',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateAcademicRecordDto.prototype, "promotionNotes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Observaciones generales',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateAcademicRecordDto.prototype, "observations", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Logros destacados (JSON)',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateAcademicRecordDto.prototype, "achievements", void 0);
class CreateAcademicRecordEntryDto {
}
exports.CreateAcademicRecordEntryDto = CreateAcademicRecordEntryDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ID del expediente académico',
        example: 'record-uuid',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateAcademicRecordEntryDto.prototype, "academicRecordId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Tipo de entrada',
        enum: academic_record_types_1.EntryType,
        example: academic_record_types_1.EntryType.ACADEMIC,
    }),
    (0, class_validator_1.IsEnum)(academic_record_types_1.EntryType),
    __metadata("design:type", String)
], CreateAcademicRecordEntryDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Período académico',
        enum: academic_record_types_1.AcademicPeriod,
        example: academic_record_types_1.AcademicPeriod.FIRST_TRIMESTER,
    }),
    (0, class_validator_1.IsEnum)(academic_record_types_1.AcademicPeriod),
    __metadata("design:type", String)
], CreateAcademicRecordEntryDto.prototype, "period", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Título de la entrada',
        example: 'Calificaciones del primer trimestre - Matemáticas',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateAcademicRecordEntryDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Descripción detallada',
        example: 'Evaluación continua y examen final',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAcademicRecordEntryDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Fecha de la entrada',
        example: '2024-12-15',
    }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateAcademicRecordEntryDto.prototype, "entryDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'ID de la asignación de asignatura',
        example: 'subject-assignment-uuid',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAcademicRecordEntryDto.prototype, "subjectAssignmentId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Valor numérico (calificación)',
        example: 8.5,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDecimal)({ decimal_digits: '0,2' }),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(10),
    __metadata("design:type", Number)
], CreateAcademicRecordEntryDto.prototype, "numericValue", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Calificación con letra',
        example: 'A',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAcademicRecordEntryDto.prototype, "letterGrade", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Comentarios',
        example: 'Excelente progreso durante el trimestre',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAcademicRecordEntryDto.prototype, "comments", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Créditos de la materia',
        example: 6,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateAcademicRecordEntryDto.prototype, "credits", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Si la calificación es aprobatoria',
        example: true,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateAcademicRecordEntryDto.prototype, "isPassing", void 0);
class UpdateAcademicRecordEntryDto {
}
exports.UpdateAcademicRecordEntryDto = UpdateAcademicRecordEntryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Título de la entrada',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateAcademicRecordEntryDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Descripción detallada',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateAcademicRecordEntryDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Valor numérico (calificación)',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDecimal)({ decimal_digits: '0,2' }),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(10),
    __metadata("design:type", Number)
], UpdateAcademicRecordEntryDto.prototype, "numericValue", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Calificación con letra',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateAcademicRecordEntryDto.prototype, "letterGrade", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Comentarios',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateAcademicRecordEntryDto.prototype, "comments", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Si la calificación es aprobatoria',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateAcademicRecordEntryDto.prototype, "isPassing", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Si está exento',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateAcademicRecordEntryDto.prototype, "isExempt", void 0);
class CreateAcademicRecordGradeDto {
}
exports.CreateAcademicRecordGradeDto = CreateAcademicRecordGradeDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ID de la entrada del expediente',
        example: 'entry-uuid',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateAcademicRecordGradeDto.prototype, "entryId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Tipo de calificación',
        enum: academic_record_types_1.GradeType,
        example: academic_record_types_1.GradeType.EXAM,
    }),
    (0, class_validator_1.IsEnum)(academic_record_types_1.GradeType),
    __metadata("design:type", String)
], CreateAcademicRecordGradeDto.prototype, "gradeType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Nombre de la evaluación',
        example: 'Examen Final de Matemáticas',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateAcademicRecordGradeDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Descripción de la evaluación',
        example: 'Examen comprensivo de álgebra y geometría',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAcademicRecordGradeDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Puntos obtenidos',
        example: 85,
    }),
    (0, class_validator_1.IsDecimal)({ decimal_digits: '0,2' }),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateAcademicRecordGradeDto.prototype, "earnedPoints", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Puntos totales posibles',
        example: 100,
    }),
    (0, class_validator_1.IsDecimal)({ decimal_digits: '0,2' }),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateAcademicRecordGradeDto.prototype, "totalPoints", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Peso en la calificación final (0.0 - 1.0)',
        example: 0.3,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDecimal)({ decimal_digits: '0,2' }),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(1),
    __metadata("design:type", Number)
], CreateAcademicRecordGradeDto.prototype, "weight", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Fecha de la evaluación',
        example: '2024-12-10',
    }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateAcademicRecordGradeDto.prototype, "gradeDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Fecha límite de entrega',
        example: '2024-12-10',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateAcademicRecordGradeDto.prototype, "dueDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Comentarios del profesor',
        example: 'Excelente comprensión de los conceptos',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAcademicRecordGradeDto.prototype, "teacherComments", void 0);
class UpdateAcademicRecordGradeDto {
}
exports.UpdateAcademicRecordGradeDto = UpdateAcademicRecordGradeDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Puntos obtenidos',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDecimal)({ decimal_digits: '0,2' }),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdateAcademicRecordGradeDto.prototype, "earnedPoints", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Comentarios del profesor',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateAcademicRecordGradeDto.prototype, "teacherComments", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Si fue entregado tarde',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateAcademicRecordGradeDto.prototype, "isLate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Si está justificado',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateAcademicRecordGradeDto.prototype, "isExcused", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Si se descarta de cálculos',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateAcademicRecordGradeDto.prototype, "isDropped", void 0);
class AcademicRecordQueryDto {
}
exports.AcademicRecordQueryDto = AcademicRecordQueryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Año académico',
        enum: academic_record_types_1.AcademicYear,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(academic_record_types_1.AcademicYear),
    __metadata("design:type", String)
], AcademicRecordQueryDto.prototype, "academicYear", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Estado del expediente',
        enum: academic_record_types_1.RecordStatus,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(academic_record_types_1.RecordStatus),
    __metadata("design:type", String)
], AcademicRecordQueryDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Página',
        example: 1,
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], AcademicRecordQueryDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Límite por página',
        example: 10,
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], AcademicRecordQueryDto.prototype, "limit", void 0);
//# sourceMappingURL=academic-record.dto.js.map