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
exports.EducationalLevel = exports.EducationalLevelCode = void 0;
const typeorm_1 = require("typeorm");
const cycle_entity_1 = require("./cycle.entity");
var EducationalLevelCode;
(function (EducationalLevelCode) {
    EducationalLevelCode["INFANTIL"] = "INFANTIL";
    EducationalLevelCode["PRIMARIA"] = "PRIMARIA";
    EducationalLevelCode["SECUNDARIA"] = "SECUNDARIA";
})(EducationalLevelCode || (exports.EducationalLevelCode = EducationalLevelCode = {}));
let EducationalLevel = class EducationalLevel {
};
exports.EducationalLevel = EducationalLevel;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], EducationalLevel.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], EducationalLevel.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: EducationalLevelCode,
        unique: true,
    }),
    __metadata("design:type", String)
], EducationalLevel.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], EducationalLevel.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => cycle_entity_1.Cycle, (cycle) => cycle.educationalLevel),
    __metadata("design:type", Array)
], EducationalLevel.prototype, "cycles", void 0);
exports.EducationalLevel = EducationalLevel = __decorate([
    (0, typeorm_1.Entity)('educational_levels')
], EducationalLevel);
//# sourceMappingURL=educational-level.entity.js.map