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
exports.Activity = exports.ActivityValuationType = void 0;
const typeorm_1 = require("typeorm");
const swagger_1 = require("@nestjs/swagger");
const class_group_entity_1 = require("../../students/entities/class-group.entity");
const teacher_entity_1 = require("../../teachers/entities/teacher.entity");
const subject_assignment_entity_1 = require("../../students/entities/subject-assignment.entity");
const activity_assessment_entity_1 = require("./activity-assessment.entity");
const rubric_entity_1 = require("./rubric.entity");
var ActivityValuationType;
(function (ActivityValuationType) {
    ActivityValuationType["EMOJI"] = "emoji";
    ActivityValuationType["SCORE"] = "score";
    ActivityValuationType["RUBRIC"] = "rubric";
})(ActivityValuationType || (exports.ActivityValuationType = ActivityValuationType = {}));
let Activity = class Activity {
};
exports.Activity = Activity;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID único de la actividad' }),
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Activity.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Nombre de la actividad', example: 'Ejercicios de matemáticas' }),
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], Activity.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Descripción opcional de la actividad' }),
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Activity.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Fecha de asignación de la actividad' }),
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], Activity.prototype, "assignedDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Fecha opcional de revisión' }),
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Activity.prototype, "reviewDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Tipo de valoración', enum: ActivityValuationType }),
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ActivityValuationType,
        default: ActivityValuationType.EMOJI,
    }),
    __metadata("design:type", String)
], Activity.prototype, "valuationType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Puntuación máxima (solo para tipo score)' }),
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], Activity.prototype, "maxScore", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Si se notifica a las familias' }),
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], Activity.prototype, "notifyFamilies", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Notificar cuando el emoji sea happy (cara sonriente)' }),
    (0, typeorm_1.Column)({ type: 'boolean', default: false, name: 'notify_on_happy' }),
    __metadata("design:type", Boolean)
], Activity.prototype, "notifyOnHappy", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Notificar cuando el emoji sea neutral (cara neutral)' }),
    (0, typeorm_1.Column)({ type: 'boolean', default: true, name: 'notify_on_neutral' }),
    __metadata("design:type", Boolean)
], Activity.prototype, "notifyOnNeutral", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Notificar cuando el emoji sea sad (cara triste)' }),
    (0, typeorm_1.Column)({ type: 'boolean', default: true, name: 'notify_on_sad' }),
    __metadata("design:type", Boolean)
], Activity.prototype, "notifyOnSad", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Si la actividad está activa' }),
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], Activity.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Si la actividad está archivada' }),
    (0, typeorm_1.Column)({ type: 'boolean', default: false, name: 'is_archived' }),
    __metadata("design:type", Boolean)
], Activity.prototype, "isArchived", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Si la actividad es una plantilla reutilizable' }),
    (0, typeorm_1.Column)({ type: 'boolean', default: false, name: 'is_template' }),
    __metadata("design:type", Boolean)
], Activity.prototype, "isTemplate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID del grupo de clase' }),
    (0, typeorm_1.Column)({ name: 'class_group_id' }),
    __metadata("design:type", String)
], Activity.prototype, "classGroupId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID del profesor que creó la actividad' }),
    (0, typeorm_1.Column)({ name: 'teacher_id' }),
    __metadata("design:type", String)
], Activity.prototype, "teacherId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID de la asignación de asignatura (obligatorio)' }),
    (0, typeorm_1.Column)({ name: 'subject_assignment_id' }),
    __metadata("design:type", String)
], Activity.prototype, "subjectAssignmentId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID de la rúbrica (solo para tipo rubric)', required: false }),
    (0, typeorm_1.Column)({ name: 'rubric_id', nullable: true }),
    __metadata("design:type", String)
], Activity.prototype, "rubricId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => class_group_entity_1.ClassGroup, (classGroup) => classGroup.id),
    (0, typeorm_1.JoinColumn)({ name: 'class_group_id' }),
    __metadata("design:type", class_group_entity_1.ClassGroup)
], Activity.prototype, "classGroup", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => teacher_entity_1.Teacher, (teacher) => teacher.id),
    (0, typeorm_1.JoinColumn)({ name: 'teacher_id' }),
    __metadata("design:type", teacher_entity_1.Teacher)
], Activity.prototype, "teacher", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => subject_assignment_entity_1.SubjectAssignment, (subjectAssignment) => subjectAssignment.id),
    (0, typeorm_1.JoinColumn)({ name: 'subject_assignment_id' }),
    __metadata("design:type", subject_assignment_entity_1.SubjectAssignment)
], Activity.prototype, "subjectAssignment", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => activity_assessment_entity_1.ActivityAssessment, (assessment) => assessment.activity),
    __metadata("design:type", Array)
], Activity.prototype, "assessments", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => rubric_entity_1.Rubric, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'rubric_id' }),
    __metadata("design:type", rubric_entity_1.Rubric)
], Activity.prototype, "rubric", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Fecha de creación' }),
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Activity.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Fecha de última actualización' }),
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Activity.prototype, "updatedAt", void 0);
exports.Activity = Activity = __decorate([
    (0, typeorm_1.Entity)('activities')
], Activity);
//# sourceMappingURL=activity.entity.js.map