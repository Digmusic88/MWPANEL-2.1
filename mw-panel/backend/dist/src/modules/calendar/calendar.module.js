"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CalendarModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const calendar_service_1 = require("./calendar.service");
const calendar_controller_1 = require("./calendar.controller");
const entities_1 = require("./entities");
const user_entity_1 = require("../users/entities/user.entity");
const teacher_entity_1 = require("../teachers/entities/teacher.entity");
const student_entity_1 = require("../students/entities/student.entity");
const family_entity_1 = require("../users/entities/family.entity");
let CalendarModule = class CalendarModule {
};
exports.CalendarModule = CalendarModule;
exports.CalendarModule = CalendarModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                entities_1.CalendarEvent,
                entities_1.CalendarEventGroup,
                entities_1.CalendarEventSubject,
                entities_1.CalendarEventStudent,
                entities_1.CalendarEventReminder,
                user_entity_1.User,
                teacher_entity_1.Teacher,
                student_entity_1.Student,
                family_entity_1.Family,
                family_entity_1.FamilyStudent,
            ]),
        ],
        controllers: [calendar_controller_1.CalendarController],
        providers: [calendar_service_1.CalendarService],
        exports: [calendar_service_1.CalendarService],
    })
], CalendarModule);
//# sourceMappingURL=calendar.module.js.map