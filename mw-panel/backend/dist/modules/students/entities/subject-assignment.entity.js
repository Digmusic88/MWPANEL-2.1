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
exports.SubjectAssignment = void 0;
const typeorm_1 = require("typeorm");
const teacher_entity_1 = require("../../teachers/entities/teacher.entity");
const subject_entity_1 = require("./subject.entity");
const class_group_entity_1 = require("./class-group.entity");
const academic_year_entity_1 = require("./academic-year.entity");
let SubjectAssignment = class SubjectAssignment {
};
exports.SubjectAssignment = SubjectAssignment;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], SubjectAssignment.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => teacher_entity_1.Teacher),
    __metadata("design:type", teacher_entity_1.Teacher)
], SubjectAssignment.prototype, "teacher", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => subject_entity_1.Subject),
    __metadata("design:type", subject_entity_1.Subject)
], SubjectAssignment.prototype, "subject", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => class_group_entity_1.ClassGroup),
    __metadata("design:type", class_group_entity_1.ClassGroup)
], SubjectAssignment.prototype, "classGroup", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => academic_year_entity_1.AcademicYear),
    __metadata("design:type", academic_year_entity_1.AcademicYear)
], SubjectAssignment.prototype, "academicYear", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], SubjectAssignment.prototype, "weeklyHours", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], SubjectAssignment.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], SubjectAssignment.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], SubjectAssignment.prototype, "updatedAt", void 0);
exports.SubjectAssignment = SubjectAssignment = __decorate([
    (0, typeorm_1.Entity)('subject_assignments')
], SubjectAssignment);
//# sourceMappingURL=subject-assignment.entity.js.map