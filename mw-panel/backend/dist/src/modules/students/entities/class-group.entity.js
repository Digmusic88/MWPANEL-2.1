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
exports.ClassGroup = void 0;
const typeorm_1 = require("typeorm");
const course_entity_1 = require("./course.entity");
const teacher_entity_1 = require("../../teachers/entities/teacher.entity");
const student_entity_1 = require("./student.entity");
const academic_year_entity_1 = require("./academic-year.entity");
let ClassGroup = class ClassGroup {
};
exports.ClassGroup = ClassGroup;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ClassGroup.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ClassGroup.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ClassGroup.prototype, "section", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => academic_year_entity_1.AcademicYear),
    __metadata("design:type", academic_year_entity_1.AcademicYear)
], ClassGroup.prototype, "academicYear", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => course_entity_1.Course),
    (0, typeorm_1.JoinTable)({
        name: 'class_group_courses',
        joinColumn: { name: 'classGroupId', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'courseId', referencedColumnName: 'id' },
    }),
    __metadata("design:type", Array)
], ClassGroup.prototype, "courses", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => teacher_entity_1.Teacher),
    __metadata("design:type", teacher_entity_1.Teacher)
], ClassGroup.prototype, "tutor", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => student_entity_1.Student, (student) => student.classGroups),
    (0, typeorm_1.JoinTable)({
        name: 'class_students',
        joinColumn: { name: 'classId', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'studentId', referencedColumnName: 'id' },
    }),
    __metadata("design:type", Array)
], ClassGroup.prototype, "students", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], ClassGroup.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], ClassGroup.prototype, "updatedAt", void 0);
exports.ClassGroup = ClassGroup = __decorate([
    (0, typeorm_1.Entity)('class_groups')
], ClassGroup);
//# sourceMappingURL=class-group.entity.js.map