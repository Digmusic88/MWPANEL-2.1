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
exports.CalendarEventStudent = void 0;
const typeorm_1 = require("typeorm");
const calendar_event_entity_1 = require("./calendar-event.entity");
const student_entity_1 = require("../../students/entities/student.entity");
let CalendarEventStudent = class CalendarEventStudent {
};
exports.CalendarEventStudent = CalendarEventStudent;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], CalendarEventStudent.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], CalendarEventStudent.prototype, "eventId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => calendar_event_entity_1.CalendarEvent, (event) => event.eventStudents, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'eventId' }),
    __metadata("design:type", calendar_event_entity_1.CalendarEvent)
], CalendarEventStudent.prototype, "event", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], CalendarEventStudent.prototype, "studentId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => student_entity_1.Student, { eager: true }),
    (0, typeorm_1.JoinColumn)({ name: 'studentId' }),
    __metadata("design:type", student_entity_1.Student)
], CalendarEventStudent.prototype, "student", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], CalendarEventStudent.prototype, "isVisible", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], CalendarEventStudent.prototype, "createdAt", void 0);
exports.CalendarEventStudent = CalendarEventStudent = __decorate([
    (0, typeorm_1.Entity)('calendar_event_students'),
    (0, typeorm_1.Unique)(['eventId', 'studentId'])
], CalendarEventStudent);
//# sourceMappingURL=calendar-event-student.entity.js.map