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
exports.RubricLevel = void 0;
const typeorm_1 = require("typeorm");
const rubric_entity_1 = require("./rubric.entity");
const rubric_cell_entity_1 = require("./rubric-cell.entity");
let RubricLevel = class RubricLevel {
};
exports.RubricLevel = RubricLevel;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], RubricLevel.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], RubricLevel.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], RubricLevel.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], RubricLevel.prototype, "order", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 2 }),
    __metadata("design:type", Number)
], RubricLevel.prototype, "scoreValue", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 7, default: '#FF4C4C' }),
    __metadata("design:type", String)
], RubricLevel.prototype, "color", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], RubricLevel.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => rubric_entity_1.Rubric, rubric => rubric.levels, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'rubricId' }),
    __metadata("design:type", rubric_entity_1.Rubric)
], RubricLevel.prototype, "rubric", void 0);
__decorate([
    (0, typeorm_1.Column)('uuid'),
    __metadata("design:type", String)
], RubricLevel.prototype, "rubricId", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => rubric_cell_entity_1.RubricCell, cell => cell.level, { cascade: true }),
    __metadata("design:type", Array)
], RubricLevel.prototype, "cells", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], RubricLevel.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], RubricLevel.prototype, "updatedAt", void 0);
exports.RubricLevel = RubricLevel = __decorate([
    (0, typeorm_1.Entity)('rubric_levels')
], RubricLevel);
//# sourceMappingURL=rubric-level.entity.js.map