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
exports.CalendarEvent = exports.CalendarEventRecurrence = exports.CalendarEventVisibility = exports.CalendarEventType = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../users/entities/user.entity");
const task_entity_1 = require("../../tasks/entities/task.entity");
const calendar_event_group_entity_1 = require("./calendar-event-group.entity");
const calendar_event_subject_entity_1 = require("./calendar-event-subject.entity");
const calendar_event_student_entity_1 = require("./calendar-event-student.entity");
const calendar_event_reminder_entity_1 = require("./calendar-event-reminder.entity");
var CalendarEventType;
(function (CalendarEventType) {
    CalendarEventType["ACTIVITY"] = "activity";
    CalendarEventType["EVALUATION"] = "evaluation";
    CalendarEventType["TEST_YOURSELF"] = "test_yourself";
    CalendarEventType["GENERAL_EVENT"] = "general_event";
    CalendarEventType["HOLIDAY"] = "holiday";
    CalendarEventType["MEETING"] = "meeting";
    CalendarEventType["EXCURSION"] = "excursion";
    CalendarEventType["FESTIVAL"] = "festival";
    CalendarEventType["DEADLINE"] = "deadline";
    CalendarEventType["REMINDER"] = "reminder";
})(CalendarEventType || (exports.CalendarEventType = CalendarEventType = {}));
var CalendarEventVisibility;
(function (CalendarEventVisibility) {
    CalendarEventVisibility["PUBLIC"] = "public";
    CalendarEventVisibility["TEACHERS_ONLY"] = "teachers_only";
    CalendarEventVisibility["STUDENTS_ONLY"] = "students_only";
    CalendarEventVisibility["FAMILIES_ONLY"] = "families_only";
    CalendarEventVisibility["ADMIN_ONLY"] = "admin_only";
    CalendarEventVisibility["CLASS_SPECIFIC"] = "class_specific";
    CalendarEventVisibility["SUBJECT_SPECIFIC"] = "subject_specific";
    CalendarEventVisibility["PRIVATE"] = "private";
})(CalendarEventVisibility || (exports.CalendarEventVisibility = CalendarEventVisibility = {}));
var CalendarEventRecurrence;
(function (CalendarEventRecurrence) {
    CalendarEventRecurrence["NONE"] = "none";
    CalendarEventRecurrence["DAILY"] = "daily";
    CalendarEventRecurrence["WEEKLY"] = "weekly";
    CalendarEventRecurrence["MONTHLY"] = "monthly";
    CalendarEventRecurrence["YEARLY"] = "yearly";
})(CalendarEventRecurrence || (exports.CalendarEventRecurrence = CalendarEventRecurrence = {}));
let CalendarEvent = class CalendarEvent {
};
exports.CalendarEvent = CalendarEvent;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], CalendarEvent.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: false }),
    __metadata("design:type", String)
], CalendarEvent.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], CalendarEvent.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: false }),
    __metadata("design:type", Date)
], CalendarEvent.prototype, "startDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: false }),
    __metadata("design:type", Date)
], CalendarEvent.prototype, "endDate", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: CalendarEventType,
        default: CalendarEventType.GENERAL_EVENT,
    }),
    __metadata("design:type", String)
], CalendarEvent.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: CalendarEventVisibility,
        default: CalendarEventVisibility.PUBLIC,
    }),
    __metadata("design:type", String)
], CalendarEvent.prototype, "visibility", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 7, default: '#1890ff' }),
    __metadata("design:type", String)
], CalendarEvent.prototype, "color", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], CalendarEvent.prototype, "isAllDay", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], CalendarEvent.prototype, "location", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], CalendarEvent.prototype, "isRecurrent", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: CalendarEventRecurrence,
        default: CalendarEventRecurrence.NONE,
        nullable: true,
    }),
    __metadata("design:type", String)
], CalendarEvent.prototype, "recurrenceType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], CalendarEvent.prototype, "recurrenceEnd", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', array: true, default: [] }),
    __metadata("design:type", Array)
], CalendarEvent.prototype, "attachments", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', array: true, default: [] }),
    __metadata("design:type", Array)
], CalendarEvent.prototype, "links", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', array: true, default: [] }),
    __metadata("design:type", Array)
], CalendarEvent.prototype, "tags", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', default: 1 }),
    __metadata("design:type", Number)
], CalendarEvent.prototype, "priority", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], CalendarEvent.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', default: 60 }),
    __metadata("design:type", Number)
], CalendarEvent.prototype, "notifyBefore", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], CalendarEvent.prototype, "autoNotify", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], CalendarEvent.prototype, "createdById", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { eager: true }),
    (0, typeorm_1.JoinColumn)({ name: 'createdById' }),
    __metadata("design:type", user_entity_1.User)
], CalendarEvent.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], CalendarEvent.prototype, "lastModifiedById", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'lastModifiedById' }),
    __metadata("design:type", user_entity_1.User)
], CalendarEvent.prototype, "lastModifiedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], CalendarEvent.prototype, "relatedTaskId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => task_entity_1.Task, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'relatedTaskId' }),
    __metadata("design:type", task_entity_1.Task)
], CalendarEvent.prototype, "relatedTask", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], CalendarEvent.prototype, "relatedEvaluationId", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => calendar_event_group_entity_1.CalendarEventGroup, (eventGroup) => eventGroup.event, {
        cascade: true,
    }),
    __metadata("design:type", Array)
], CalendarEvent.prototype, "eventGroups", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => calendar_event_subject_entity_1.CalendarEventSubject, (eventSubject) => eventSubject.event, {
        cascade: true,
    }),
    __metadata("design:type", Array)
], CalendarEvent.prototype, "eventSubjects", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => calendar_event_student_entity_1.CalendarEventStudent, (eventStudent) => eventStudent.event, {
        cascade: true,
    }),
    __metadata("design:type", Array)
], CalendarEvent.prototype, "eventStudents", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => calendar_event_reminder_entity_1.CalendarEventReminder, (reminder) => reminder.event, {
        cascade: true,
    }),
    __metadata("design:type", Array)
], CalendarEvent.prototype, "reminders", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], CalendarEvent.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], CalendarEvent.prototype, "updatedAt", void 0);
exports.CalendarEvent = CalendarEvent = __decorate([
    (0, typeorm_1.Entity)('calendar_events'),
    (0, typeorm_1.Index)(['startDate']),
    (0, typeorm_1.Index)(['endDate']),
    (0, typeorm_1.Index)(['type']),
    (0, typeorm_1.Index)(['visibility']),
    (0, typeorm_1.Index)(['createdById']),
    (0, typeorm_1.Index)(['isActive'])
], CalendarEvent);
//# sourceMappingURL=calendar-event.entity.js.map