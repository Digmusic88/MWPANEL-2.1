"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AcademicRecordsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const academic_records_controller_1 = require("./academic-records.controller");
const academic_records_service_1 = require("./academic-records.service");
const report_generator_service_1 = require("./services/report-generator.service");
const entities_1 = require("./entities");
const student_entity_1 = require("../students/entities/student.entity");
const settings_module_1 = require("../settings/settings.module");
let AcademicRecordsModule = class AcademicRecordsModule {
};
exports.AcademicRecordsModule = AcademicRecordsModule;
exports.AcademicRecordsModule = AcademicRecordsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                entities_1.AcademicRecord,
                entities_1.AcademicRecordEntry,
                entities_1.AcademicRecordGrade,
                student_entity_1.Student,
            ]),
            settings_module_1.SettingsModule,
        ],
        controllers: [academic_records_controller_1.AcademicRecordsController],
        providers: [academic_records_service_1.AcademicRecordsService, report_generator_service_1.ReportGeneratorService],
        exports: [academic_records_service_1.AcademicRecordsService, report_generator_service_1.ReportGeneratorService],
    })
], AcademicRecordsModule);
//# sourceMappingURL=academic-records.module.js.map