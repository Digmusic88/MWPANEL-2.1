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
exports.ActivityAssessment = exports.EmojiValue = void 0;
const typeorm_1 = require("typeorm");
const swagger_1 = require("@nestjs/swagger");
const activity_entity_1 = require("./activity.entity");
const student_entity_1 = require("../../students/entities/student.entity");
const user_entity_1 = require("../../users/entities/user.entity");
var EmojiValue;
(function (EmojiValue) {
    EmojiValue["HAPPY"] = "happy";
    EmojiValue["NEUTRAL"] = "neutral";
    EmojiValue["SAD"] = "sad";
})(EmojiValue || (exports.EmojiValue = EmojiValue = {}));
let ActivityAssessment = class ActivityAssessment {
};
exports.ActivityAssessment = ActivityAssessment;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID único de la valoración' }),
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ActivityAssessment.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Valor de la valoración (emoji o puntuación)' }),
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], ActivityAssessment.prototype, "value", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Comentario opcional del profesor' }),
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], ActivityAssessment.prototype, "comment", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Fecha en que se realizó la valoración' }),
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], ActivityAssessment.prototype, "assessedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Fecha en que se notificó a la familia' }),
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], ActivityAssessment.prototype, "notifiedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Si ha sido valorada por el profesor' }),
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], ActivityAssessment.prototype, "isAssessed", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID de la actividad' }),
    (0, typeorm_1.Column)({ name: 'activity_id' }),
    __metadata("design:type", String)
], ActivityAssessment.prototype, "activityId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID del estudiante' }),
    (0, typeorm_1.Column)({ name: 'student_id' }),
    __metadata("design:type", String)
], ActivityAssessment.prototype, "studentId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID del profesor que valoró' }),
    (0, typeorm_1.Column)({ name: 'assessed_by_id', nullable: true }),
    __metadata("design:type", String)
], ActivityAssessment.prototype, "assessedById", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => activity_entity_1.Activity, (activity) => activity.assessments, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'activity_id' }),
    __metadata("design:type", activity_entity_1.Activity)
], ActivityAssessment.prototype, "activity", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => student_entity_1.Student, (student) => student.id),
    (0, typeorm_1.JoinColumn)({ name: 'student_id' }),
    __metadata("design:type", student_entity_1.Student)
], ActivityAssessment.prototype, "student", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.id),
    (0, typeorm_1.JoinColumn)({ name: 'assessed_by_id' }),
    __metadata("design:type", user_entity_1.User)
], ActivityAssessment.prototype, "assessedBy", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Fecha de creación' }),
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], ActivityAssessment.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Fecha de última actualización' }),
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], ActivityAssessment.prototype, "updatedAt", void 0);
exports.ActivityAssessment = ActivityAssessment = __decorate([
    (0, typeorm_1.Entity)('activity_assessments'),
    (0, typeorm_1.Index)(['activityId', 'studentId'], { unique: true })
], ActivityAssessment);
//# sourceMappingURL=activity-assessment.entity.js.map