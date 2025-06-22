"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const students_controller_1 = require("./students.controller");
const students_service_1 = require("./students.service");
const enrollment_number_service_1 = require("./services/enrollment-number.service");
const student_entity_1 = require("./entities/student.entity");
const educational_level_entity_1 = require("./entities/educational-level.entity");
const cycle_entity_1 = require("./entities/cycle.entity");
const course_entity_1 = require("./entities/course.entity");
const subject_entity_1 = require("./entities/subject.entity");
const class_group_entity_1 = require("./entities/class-group.entity");
const academic_year_entity_1 = require("./entities/academic-year.entity");
const user_entity_1 = require("../users/entities/user.entity");
const user_profile_entity_1 = require("../users/entities/user-profile.entity");
let StudentsModule = class StudentsModule {
};
exports.StudentsModule = StudentsModule;
exports.StudentsModule = StudentsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                student_entity_1.Student,
                educational_level_entity_1.EducationalLevel,
                cycle_entity_1.Cycle,
                course_entity_1.Course,
                subject_entity_1.Subject,
                class_group_entity_1.ClassGroup,
                academic_year_entity_1.AcademicYear,
                user_entity_1.User,
                user_profile_entity_1.UserProfile,
            ]),
        ],
        controllers: [students_controller_1.StudentsController],
        providers: [students_service_1.StudentsService, enrollment_number_service_1.EnrollmentNumberService],
        exports: [students_service_1.StudentsService, enrollment_number_service_1.EnrollmentNumberService],
    })
], StudentsModule);
//# sourceMappingURL=students.module.js.map