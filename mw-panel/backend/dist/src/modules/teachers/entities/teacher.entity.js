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
exports.Teacher = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../users/entities/user.entity");
const subject_entity_1 = require("../../students/entities/subject.entity");
const class_group_entity_1 = require("../../students/entities/class-group.entity");
const evaluation_entity_1 = require("../../evaluations/entities/evaluation.entity");
const subject_assignment_entity_1 = require("../../students/entities/subject-assignment.entity");
let Teacher = class Teacher {
};
exports.Teacher = Teacher;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Teacher.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], Teacher.prototype, "employeeNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'simple-array', nullable: true }),
    __metadata("design:type", Array)
], Teacher.prototype, "specialties", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", user_entity_1.User)
], Teacher.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => subject_entity_1.Subject),
    (0, typeorm_1.JoinTable)({
        name: 'teacher_subjects',
        joinColumn: { name: 'teacherId', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'subjectId', referencedColumnName: 'id' },
    }),
    __metadata("design:type", Array)
], Teacher.prototype, "subjects", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => class_group_entity_1.ClassGroup, (classGroup) => classGroup.tutor),
    __metadata("design:type", Array)
], Teacher.prototype, "tutoredClasses", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => evaluation_entity_1.Evaluation, (evaluation) => evaluation.teacher),
    __metadata("design:type", Array)
], Teacher.prototype, "evaluations", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => subject_assignment_entity_1.SubjectAssignment, (assignment) => assignment.teacher),
    __metadata("design:type", Array)
], Teacher.prototype, "subjectAssignments", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Teacher.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Teacher.prototype, "updatedAt", void 0);
exports.Teacher = Teacher = __decorate([
    (0, typeorm_1.Entity)('teachers')
], Teacher);
//# sourceMappingURL=teacher.entity.js.map