"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClassGroupsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const class_groups_service_1 = require("./class-groups.service");
const class_groups_controller_1 = require("./class-groups.controller");
const class_group_entity_1 = require("../students/entities/class-group.entity");
const student_entity_1 = require("../students/entities/student.entity");
const teacher_entity_1 = require("../teachers/entities/teacher.entity");
const course_entity_1 = require("../students/entities/course.entity");
const academic_year_entity_1 = require("../students/entities/academic-year.entity");
let ClassGroupsModule = class ClassGroupsModule {
};
exports.ClassGroupsModule = ClassGroupsModule;
exports.ClassGroupsModule = ClassGroupsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                class_group_entity_1.ClassGroup,
                student_entity_1.Student,
                teacher_entity_1.Teacher,
                course_entity_1.Course,
                academic_year_entity_1.AcademicYear,
            ]),
        ],
        controllers: [class_groups_controller_1.ClassGroupsController],
        providers: [class_groups_service_1.ClassGroupsService],
        exports: [class_groups_service_1.ClassGroupsService],
    })
], ClassGroupsModule);
//# sourceMappingURL=class-groups.module.js.map