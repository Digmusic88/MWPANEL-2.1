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
exports.Cycle = void 0;
const typeorm_1 = require("typeorm");
const educational_level_entity_1 = require("./educational-level.entity");
const course_entity_1 = require("./course.entity");
let Cycle = class Cycle {
};
exports.Cycle = Cycle;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Cycle.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Cycle.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Cycle.prototype, "order", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => educational_level_entity_1.EducationalLevel, (level) => level.cycles),
    __metadata("design:type", educational_level_entity_1.EducationalLevel)
], Cycle.prototype, "educationalLevel", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => course_entity_1.Course, (course) => course.cycle),
    __metadata("design:type", Array)
], Cycle.prototype, "courses", void 0);
exports.Cycle = Cycle = __decorate([
    (0, typeorm_1.Entity)('cycles')
], Cycle);
//# sourceMappingURL=cycle.entity.js.map