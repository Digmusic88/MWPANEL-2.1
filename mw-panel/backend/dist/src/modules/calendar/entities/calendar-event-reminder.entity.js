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
exports.CalendarEventReminder = void 0;
const typeorm_1 = require("typeorm");
const calendar_event_entity_1 = require("./calendar-event.entity");
const user_entity_1 = require("../../users/entities/user.entity");
let CalendarEventReminder = class CalendarEventReminder {
};
exports.CalendarEventReminder = CalendarEventReminder;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], CalendarEventReminder.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], CalendarEventReminder.prototype, "eventId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => calendar_event_entity_1.CalendarEvent, (event) => event.reminders, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'eventId' }),
    __metadata("design:type", calendar_event_entity_1.CalendarEvent)
], CalendarEventReminder.prototype, "event", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], CalendarEventReminder.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { eager: true }),
    (0, typeorm_1.JoinColumn)({ name: 'userId' }),
    __metadata("design:type", user_entity_1.User)
], CalendarEventReminder.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp' }),
    __metadata("design:type", Date)
], CalendarEventReminder.prototype, "reminderTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], CalendarEventReminder.prototype, "isSent", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], CalendarEventReminder.prototype, "message", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', default: 'notification' }),
    __metadata("design:type", String)
], CalendarEventReminder.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], CalendarEventReminder.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], CalendarEventReminder.prototype, "sentAt", void 0);
exports.CalendarEventReminder = CalendarEventReminder = __decorate([
    (0, typeorm_1.Entity)('calendar_event_reminders'),
    (0, typeorm_1.Index)(['reminderTime']),
    (0, typeorm_1.Index)(['isSent'])
], CalendarEventReminder);
//# sourceMappingURL=calendar-event-reminder.entity.js.map