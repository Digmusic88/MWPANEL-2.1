"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EvaluationsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const evaluations_controller_1 = require("./evaluations.controller");
const evaluations_service_1 = require("./evaluations.service");
const evaluation_entity_1 = require("./entities/evaluation.entity");
const evaluation_period_entity_1 = require("./entities/evaluation-period.entity");
const competency_evaluation_entity_1 = require("./entities/competency-evaluation.entity");
const radar_evaluation_entity_1 = require("./entities/radar-evaluation.entity");
let EvaluationsModule = class EvaluationsModule {
};
exports.EvaluationsModule = EvaluationsModule;
exports.EvaluationsModule = EvaluationsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                evaluation_entity_1.Evaluation,
                evaluation_period_entity_1.EvaluationPeriod,
                competency_evaluation_entity_1.CompetencyEvaluation,
                radar_evaluation_entity_1.RadarEvaluation,
            ]),
        ],
        controllers: [evaluations_controller_1.EvaluationsController],
        providers: [evaluations_service_1.EvaluationsService],
        exports: [evaluations_service_1.EvaluationsService],
    })
], EvaluationsModule);
//# sourceMappingURL=evaluations.module.js.map