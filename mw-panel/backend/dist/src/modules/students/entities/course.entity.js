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
exports.Course = void 0;
const typeorm_1 = require("typeorm");
const cycle_entity_1 = require("./cycle.entity");
const subject_entity_1 = require("./subject.entity");
let Course = class Course {
};
exports.Course = Course;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Course.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Course.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Course.prototype, "order", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Course.prototype, "academicYear", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => cycle_entity_1.Cycle, (cycle) => cycle.courses),
    __metadata("design:type", cycle_entity_1.Cycle)
], Course.prototype, "cycle", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => subject_entity_1.Subject, (subject) => subject.course),
    __metadata("design:type", Array)
], Course.prototype, "subjects", void 0);
exports.Course = Course = __decorate([
    (0, typeorm_1.Entity)('courses')
], Course);
//# sourceMappingURL=course.entity.js.map