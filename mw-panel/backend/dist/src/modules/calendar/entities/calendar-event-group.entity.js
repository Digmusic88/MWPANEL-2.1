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
exports.CalendarEventGroup = void 0;
const typeorm_1 = require("typeorm");
const calendar_event_entity_1 = require("./calendar-event.entity");
const class_group_entity_1 = require("../../students/entities/class-group.entity");
let CalendarEventGroup = class CalendarEventGroup {
};
exports.CalendarEventGroup = CalendarEventGroup;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], CalendarEventGroup.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], CalendarEventGroup.prototype, "eventId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => calendar_event_entity_1.CalendarEvent, (event) => event.eventGroups, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'eventId' }),
    __metadata("design:type", calendar_event_entity_1.CalendarEvent)
], CalendarEventGroup.prototype, "event", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], CalendarEventGroup.prototype, "classGroupId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => class_group_entity_1.ClassGroup, { eager: true }),
    (0, typeorm_1.JoinColumn)({ name: 'classGroupId' }),
    __metadata("design:type", class_group_entity_1.ClassGroup)
], CalendarEventGroup.prototype, "classGroup", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], CalendarEventGroup.prototype, "createdAt", void 0);
exports.CalendarEventGroup = CalendarEventGroup = __decorate([
    (0, typeorm_1.Entity)('calendar_event_groups'),
    (0, typeorm_1.Unique)(['eventId', 'classGroupId'])
], CalendarEventGroup);
//# sourceMappingURL=calendar-event-group.entity.js.map