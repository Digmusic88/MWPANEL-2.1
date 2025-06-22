"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Competency = void 0;
const typeorm_1 = require("typeorm");
const educational_level_entity_1 = require("../../students/entities/educational-level.entity");
const area_entity_1 = require("./area.entity");
let Competency = class Competency {
};
exports.Competency = Competency;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Competency.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Competency.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Competency.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], Competency.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => educational_level_entity_1.EducationalLevel),
    __metadata("design:type", educational_level_entity_1.EducationalLevel)
], Competency.prototype, "educationalLevel", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => area_entity_1.Area, (area) => area.competencies),
    __metadata("design:type", Array)
], Competency.prototype, "areas", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Competency.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Competency.prototype, "updatedAt", void 0);
exports.Competency = Competency = __decorate([
    (0, typeorm_1.Entity)('competencies')
], Competency);
//# sourceMappingURL=competency.entity.js.map