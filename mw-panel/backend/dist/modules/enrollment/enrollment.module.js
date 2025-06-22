"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnrollmentModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const enrollment_controller_1 = require("./enrollment.controller");
const enrollment_service_1 = require("./enrollment.service");
const bulk_import_service_1 = require("./services/bulk-import.service");
const students_module_1 = require("../students/students.module");
const user_entity_1 = require("../users/entities/user.entity");
const user_profile_entity_1 = require("../users/entities/user-profile.entity");
const student_entity_1 = require("../students/entities/student.entity");
const educational_level_entity_1 = require("../students/entities/educational-level.entity");
const course_entity_1 = require("../students/entities/course.entity");
const family_entity_1 = require("../users/entities/family.entity");
let EnrollmentModule = class EnrollmentModule {
};
exports.EnrollmentModule = EnrollmentModule;
exports.EnrollmentModule = EnrollmentModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                user_entity_1.User,
                user_profile_entity_1.UserProfile,
                student_entity_1.Student,
                educational_level_entity_1.EducationalLevel,
                course_entity_1.Course,
                family_entity_1.Family,
                family_entity_1.FamilyStudent,
            ]),
            students_module_1.StudentsModule,
        ],
        controllers: [enrollment_controller_1.EnrollmentController],
        providers: [enrollment_service_1.EnrollmentService, bulk_import_service_1.BulkImportService],
        exports: [enrollment_service_1.EnrollmentService, bulk_import_service_1.BulkImportService],
    })
], EnrollmentModule);
//# sourceMappingURL=enrollment.module.js.map