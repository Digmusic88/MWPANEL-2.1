"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivitiesModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const activities_service_1 = require("./activities.service");
const activities_controller_1 = require("./activities.controller");
const rubrics_controller_1 = require("./controllers/rubrics.controller");
const rubrics_service_1 = require("./services/rubrics.service");
const rubric_utils_service_1 = require("./services/rubric-utils.service");
const activity_entity_1 = require("./entities/activity.entity");
const activity_assessment_entity_1 = require("./entities/activity-assessment.entity");
const activity_notification_entity_1 = require("./entities/activity-notification.entity");
const rubric_entity_1 = require("./entities/rubric.entity");
const rubric_criterion_entity_1 = require("./entities/rubric-criterion.entity");
const rubric_level_entity_1 = require("./entities/rubric-level.entity");
const rubric_cell_entity_1 = require("./entities/rubric-cell.entity");
const rubric_assessment_entity_1 = require("./entities/rubric-assessment.entity");
const rubric_assessment_criterion_entity_1 = require("./entities/rubric-assessment-criterion.entity");
const class_group_entity_1 = require("../students/entities/class-group.entity");
const student_entity_1 = require("../students/entities/student.entity");
const family_entity_1 = require("../users/entities/family.entity");
const teacher_entity_1 = require("../teachers/entities/teacher.entity");
const subject_assignment_entity_1 = require("../students/entities/subject-assignment.entity");
let ActivitiesModule = class ActivitiesModule {
};
exports.ActivitiesModule = ActivitiesModule;
exports.ActivitiesModule = ActivitiesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                activity_entity_1.Activity,
                activity_assessment_entity_1.ActivityAssessment,
                activity_notification_entity_1.ActivityNotification,
                rubric_entity_1.Rubric,
                rubric_criterion_entity_1.RubricCriterion,
                rubric_level_entity_1.RubricLevel,
                rubric_cell_entity_1.RubricCell,
                rubric_assessment_entity_1.RubricAssessment,
                rubric_assessment_criterion_entity_1.RubricAssessmentCriterion,
                class_group_entity_1.ClassGroup,
                student_entity_1.Student,
                family_entity_1.Family,
                family_entity_1.FamilyStudent,
                teacher_entity_1.Teacher,
                subject_assignment_entity_1.SubjectAssignment,
            ]),
        ],
        controllers: [activities_controller_1.ActivitiesController, rubrics_controller_1.RubricsController],
        providers: [activities_service_1.ActivitiesService, rubrics_service_1.RubricsService, rubric_utils_service_1.RubricUtilsService],
        exports: [activities_service_1.ActivitiesService, rubrics_service_1.RubricsService, rubric_utils_service_1.RubricUtilsService],
    })
], ActivitiesModule);
//# sourceMappingURL=activities.module.js.map