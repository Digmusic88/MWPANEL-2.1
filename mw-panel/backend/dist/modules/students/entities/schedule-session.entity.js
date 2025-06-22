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
exports.ScheduleSession = exports.DayOfWeek = void 0;
const typeorm_1 = require("typeorm");
const subject_assignment_entity_1 = require("./subject-assignment.entity");
const classroom_entity_1 = require("./classroom.entity");
const time_slot_entity_1 = require("./time-slot.entity");
const academic_year_entity_1 = require("./academic-year.entity");
var DayOfWeek;
(function (DayOfWeek) {
    DayOfWeek[DayOfWeek["MONDAY"] = 1] = "MONDAY";
    DayOfWeek[DayOfWeek["TUESDAY"] = 2] = "TUESDAY";
    DayOfWeek[DayOfWeek["WEDNESDAY"] = 3] = "WEDNESDAY";
    DayOfWeek[DayOfWeek["THURSDAY"] = 4] = "THURSDAY";
    DayOfWeek[DayOfWeek["FRIDAY"] = 5] = "FRIDAY";
})(DayOfWeek || (exports.DayOfWeek = DayOfWeek = {}));
let ScheduleSession = class ScheduleSession {
};
exports.ScheduleSession = ScheduleSession;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ScheduleSession.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => subject_assignment_entity_1.SubjectAssignment, { nullable: false }),
    __metadata("design:type", subject_assignment_entity_1.SubjectAssignment)
], ScheduleSession.prototype, "subjectAssignment", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => classroom_entity_1.Classroom, { nullable: false }),
    __metadata("design:type", classroom_entity_1.Classroom)
], ScheduleSession.prototype, "classroom", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => time_slot_entity_1.TimeSlot, { nullable: false }),
    __metadata("design:type", time_slot_entity_1.TimeSlot)
], ScheduleSession.prototype, "timeSlot", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: DayOfWeek,
    }),
    __metadata("design:type", Number)
], ScheduleSession.prototype, "dayOfWeek", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => academic_year_entity_1.AcademicYear, { nullable: false }),
    __metadata("design:type", academic_year_entity_1.AcademicYear)
], ScheduleSession.prototype, "academicYear", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], ScheduleSession.prototype, "startDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], ScheduleSession.prototype, "endDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], ScheduleSession.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { nullable: true }),
    __metadata("design:type", String)
], ScheduleSession.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], ScheduleSession.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], ScheduleSession.prototype, "updatedAt", void 0);
exports.ScheduleSession = ScheduleSession = __decorate([
    (0, typeorm_1.Entity)('schedule_sessions'),
    (0, typeorm_1.Index)(['subjectAssignment', 'dayOfWeek', 'timeSlot', 'academicYear'], { unique: true }),
    (0, typeorm_1.Index)(['classroom', 'dayOfWeek', 'timeSlot', 'academicYear'], { unique: true })
], ScheduleSession);
//# sourceMappingURL=schedule-session.entity.js.map