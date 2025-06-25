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
exports.RubricCell = void 0;
const typeorm_1 = require("typeorm");
const rubric_entity_1 = require("./rubric.entity");
const rubric_criterion_entity_1 = require("./rubric-criterion.entity");
const rubric_level_entity_1 = require("./rubric-level.entity");
let RubricCell = class RubricCell {
};
exports.RubricCell = RubricCell;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], RubricCell.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], RubricCell.prototype, "content", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], RubricCell.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => rubric_entity_1.Rubric, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'rubricId' }),
    __metadata("design:type", rubric_entity_1.Rubric)
], RubricCell.prototype, "rubric", void 0);
__decorate([
    (0, typeorm_1.Column)('uuid'),
    __metadata("design:type", String)
], RubricCell.prototype, "rubricId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => rubric_criterion_entity_1.RubricCriterion, criterion => criterion.cells, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'criterionId' }),
    __metadata("design:type", rubric_criterion_entity_1.RubricCriterion)
], RubricCell.prototype, "criterion", void 0);
__decorate([
    (0, typeorm_1.Column)('uuid'),
    __metadata("design:type", String)
], RubricCell.prototype, "criterionId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => rubric_level_entity_1.RubricLevel, level => level.cells, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'levelId' }),
    __metadata("design:type", rubric_level_entity_1.RubricLevel)
], RubricCell.prototype, "level", void 0);
__decorate([
    (0, typeorm_1.Column)('uuid'),
    __metadata("design:type", String)
], RubricCell.prototype, "levelId", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], RubricCell.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], RubricCell.prototype, "updatedAt", void 0);
exports.RubricCell = RubricCell = __decorate([
    (0, typeorm_1.Entity)('rubric_cells'),
    (0, typeorm_1.Unique)(['rubricId', 'criterionId', 'levelId'])
], RubricCell);
//# sourceMappingURL=rubric-cell.entity.js.map