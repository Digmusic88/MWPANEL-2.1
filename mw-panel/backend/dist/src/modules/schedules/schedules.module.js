"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchedulesModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const schedules_service_1 = require("./schedules.service");
const schedules_controller_1 = require("./schedules.controller");
const classroom_entity_1 = require("../students/entities/classroom.entity");
const time_slot_entity_1 = require("../students/entities/time-slot.entity");
const schedule_session_entity_1 = require("../students/entities/schedule-session.entity");
const academic_calendar_entity_1 = require("../students/entities/academic-calendar.entity");
const educational_level_entity_1 = require("../students/entities/educational-level.entity");
const subject_assignment_entity_1 = require("../students/entities/subject-assignment.entity");
const academic_year_entity_1 = require("../students/entities/academic-year.entity");
let SchedulesModule = class SchedulesModule {
};
exports.SchedulesModule = SchedulesModule;
exports.SchedulesModule = SchedulesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                classroom_entity_1.Classroom,
                time_slot_entity_1.TimeSlot,
                schedule_session_entity_1.ScheduleSession,
                academic_calendar_entity_1.AcademicCalendar,
                educational_level_entity_1.EducationalLevel,
                subject_assignment_entity_1.SubjectAssignment,
                academic_year_entity_1.AcademicYear,
            ]),
        ],
        controllers: [schedules_controller_1.SchedulesController],
        providers: [schedules_service_1.SchedulesService],
        exports: [schedules_service_1.SchedulesService],
    })
], SchedulesModule);
//# sourceMappingURL=schedules.module.js.map