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
exports.AcademicCalendar = exports.CalendarEventType = void 0;
const typeorm_1 = require("typeorm");
const academic_year_entity_1 = require("./academic-year.entity");
var CalendarEventType;
(function (CalendarEventType) {
    CalendarEventType["HOLIDAY"] = "holiday";
    CalendarEventType["EXAM_DAY"] = "exam_day";
    CalendarEventType["SPECIAL_EVENT"] = "special_event";
    CalendarEventType["NO_CLASSES"] = "no_classes";
    CalendarEventType["TEACHER_MEETING"] = "teacher_meeting";
    CalendarEventType["PARENT_MEETING"] = "parent_meeting";
})(CalendarEventType || (exports.CalendarEventType = CalendarEventType = {}));
let AcademicCalendar = class AcademicCalendar {
};
exports.AcademicCalendar = AcademicCalendar;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], AcademicCalendar.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => academic_year_entity_1.AcademicYear, { nullable: false }),
    __metadata("design:type", academic_year_entity_1.AcademicYear)
], AcademicCalendar.prototype, "academicYear", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], AcademicCalendar.prototype, "date", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: CalendarEventType,
    }),
    __metadata("design:type", String)
], AcademicCalendar.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], AcademicCalendar.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { nullable: true }),
    __metadata("design:type", String)
], AcademicCalendar.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], AcademicCalendar.prototype, "affectsClasses", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], AcademicCalendar.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], AcademicCalendar.prototype, "updatedAt", void 0);
exports.AcademicCalendar = AcademicCalendar = __decorate([
    (0, typeorm_1.Entity)('academic_calendar')
], AcademicCalendar);
//# sourceMappingURL=academic-calendar.entity.js.map