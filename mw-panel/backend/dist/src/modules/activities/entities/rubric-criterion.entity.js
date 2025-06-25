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
exports.RubricCriterion = void 0;
const typeorm_1 = require("typeorm");
const rubric_entity_1 = require("./rubric.entity");
const rubric_cell_entity_1 = require("./rubric-cell.entity");
let RubricCriterion = class RubricCriterion {
};
exports.RubricCriterion = RubricCriterion;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], RubricCriterion.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], RubricCriterion.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], RubricCriterion.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], RubricCriterion.prototype, "order", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 2, default: 1 }),
    __metadata("design:type", Number)
], RubricCriterion.prototype, "weight", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], RubricCriterion.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => rubric_entity_1.Rubric, rubric => rubric.criteria, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'rubricId' }),
    __metadata("design:type", rubric_entity_1.Rubric)
], RubricCriterion.prototype, "rubric", void 0);
__decorate([
    (0, typeorm_1.Column)('uuid'),
    __metadata("design:type", String)
], RubricCriterion.prototype, "rubricId", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => rubric_cell_entity_1.RubricCell, cell => cell.criterion, { cascade: true }),
    __metadata("design:type", Array)
], RubricCriterion.prototype, "cells", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], RubricCriterion.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], RubricCriterion.prototype, "updatedAt", void 0);
exports.RubricCriterion = RubricCriterion = __decorate([
    (0, typeorm_1.Entity)('rubric_criteria')
], RubricCriterion);
//# sourceMappingURL=rubric-criterion.entity.js.map