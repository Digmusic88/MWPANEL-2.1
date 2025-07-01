"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompetenciesModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const competencies_controller_1 = require("./competencies.controller");
const competencies_service_1 = require("./competencies.service");
const competency_entity_1 = require("./entities/competency.entity");
const area_entity_1 = require("./entities/area.entity");
let CompetenciesModule = class CompetenciesModule {
};
exports.CompetenciesModule = CompetenciesModule;
exports.CompetenciesModule = CompetenciesModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([competency_entity_1.Competency, area_entity_1.Area])],
        controllers: [competencies_controller_1.CompetenciesController],
        providers: [competencies_service_1.CompetenciesService],
        exports: [competencies_service_1.CompetenciesService],
    })
], CompetenciesModule);
//# sourceMappingURL=competencies.module.js.map