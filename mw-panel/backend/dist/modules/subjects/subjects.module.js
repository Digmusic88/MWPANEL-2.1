"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubjectsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const subjects_service_1 = require("./subjects.service");
const subjects_controller_1 = require("./subjects.controller");
const subject_entity_1 = require("../students/entities/subject.entity");
const subject_assignment_entity_1 = require("../students/entities/subject-assignment.entity");
const teacher_entity_1 = require("../teachers/entities/teacher.entity");
const class_group_entity_1 = require("../students/entities/class-group.entity");
const course_entity_1 = require("../students/entities/course.entity");
const academic_year_entity_1 = require("../students/entities/academic-year.entity");
let SubjectsModule = class SubjectsModule {
};
exports.SubjectsModule = SubjectsModule;
exports.SubjectsModule = SubjectsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                subject_entity_1.Subject,
                subject_assignment_entity_1.SubjectAssignment,
                teacher_entity_1.Teacher,
                class_group_entity_1.ClassGroup,
                course_entity_1.Course,
                academic_year_entity_1.AcademicYear,
            ]),
        ],
        controllers: [subjects_controller_1.SubjectsController],
        providers: [subjects_service_1.SubjectsService],
        exports: [subjects_service_1.SubjectsService],
    })
], SubjectsModule);
//# sourceMappingURL=subjects.module.js.map