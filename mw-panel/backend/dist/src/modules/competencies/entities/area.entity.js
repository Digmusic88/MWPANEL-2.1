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
exports.Area = void 0;
const typeorm_1 = require("typeorm");
const educational_level_entity_1 = require("../../students/entities/educational-level.entity");
const competency_entity_1 = require("./competency.entity");
let Area = class Area {
};
exports.Area = Area;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Area.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Area.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Area.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Area.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => educational_level_entity_1.EducationalLevel),
    __metadata("design:type", educational_level_entity_1.EducationalLevel)
], Area.prototype, "educationalLevel", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => competency_entity_1.Competency, (competency) => competency.areas),
    (0, typeorm_1.JoinTable)({
        name: 'area_competencies',
        joinColumn: { name: 'areaId', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'competencyId', referencedColumnName: 'id' },
    }),
    __metadata("design:type", Array)
], Area.prototype, "competencies", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Area.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Area.prototype, "updatedAt", void 0);
exports.Area = Area = __decorate([
    (0, typeorm_1.Entity)('areas')
], Area);
//# sourceMappingURL=area.entity.js.map