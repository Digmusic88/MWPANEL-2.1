"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TasksModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const platform_express_1 = require("@nestjs/platform-express");
const tasks_service_1 = require("./tasks.service");
const tasks_controller_1 = require("./tasks.controller");
const entities_1 = require("./entities");
const teacher_entity_1 = require("../teachers/entities/teacher.entity");
const student_entity_1 = require("../students/entities/student.entity");
const subject_assignment_entity_1 = require("../students/entities/subject-assignment.entity");
const family_entity_1 = require("../users/entities/family.entity");
const user_entity_1 = require("../users/entities/user.entity");
const promises_1 = require("fs/promises");
const path_1 = require("path");
let TasksModule = class TasksModule {
};
exports.TasksModule = TasksModule;
exports.TasksModule = TasksModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                entities_1.Task,
                entities_1.TaskSubmission,
                entities_1.TaskAttachment,
                entities_1.TaskSubmissionAttachment,
                teacher_entity_1.Teacher,
                student_entity_1.Student,
                subject_assignment_entity_1.SubjectAssignment,
                family_entity_1.Family,
                family_entity_1.FamilyStudent,
                user_entity_1.User,
            ]),
            platform_express_1.MulterModule.registerAsync({
                useFactory: async () => {
                    const uploadsPath = (0, path_1.join)(process.cwd(), 'uploads');
                    const tasksPath = (0, path_1.join)(uploadsPath, 'tasks');
                    const submissionsPath = (0, path_1.join)(uploadsPath, 'submissions');
                    try {
                        await (0, promises_1.mkdir)(uploadsPath, { recursive: true });
                        await (0, promises_1.mkdir)(tasksPath, { recursive: true });
                        await (0, promises_1.mkdir)(submissionsPath, { recursive: true });
                    }
                    catch (error) {
                    }
                    return {
                        dest: uploadsPath,
                    };
                },
            }),
        ],
        controllers: [tasks_controller_1.TasksController],
        providers: [tasks_service_1.TasksService],
        exports: [tasks_service_1.TasksService],
    })
], TasksModule);
//# sourceMappingURL=tasks.module.js.map