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
exports.CalendarEventSubject = void 0;
const typeorm_1 = require("typeorm");
const calendar_event_entity_1 = require("./calendar-event.entity");
const subject_entity_1 = require("../../students/entities/subject.entity");
let CalendarEventSubject = class CalendarEventSubject {
};
exports.CalendarEventSubject = CalendarEventSubject;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], CalendarEventSubject.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], CalendarEventSubject.prototype, "eventId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => calendar_event_entity_1.CalendarEvent, (event) => event.eventSubjects, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'eventId' }),
    __metadata("design:type", calendar_event_entity_1.CalendarEvent)
], CalendarEventSubject.prototype, "event", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], CalendarEventSubject.prototype, "subjectId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => subject_entity_1.Subject, { eager: true }),
    (0, typeorm_1.JoinColumn)({ name: 'subjectId' }),
    __metadata("design:type", subject_entity_1.Subject)
], CalendarEventSubject.prototype, "subject", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], CalendarEventSubject.prototype, "createdAt", void 0);
exports.CalendarEventSubject = CalendarEventSubject = __decorate([
    (0, typeorm_1.Entity)('calendar_event_subjects'),
    (0, typeorm_1.Unique)(['eventId', 'subjectId'])
], CalendarEventSubject);
//# sourceMappingURL=calendar-event-subject.entity.js.map