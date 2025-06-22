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
exports.Classroom = exports.ClassroomType = void 0;
const typeorm_1 = require("typeorm");
const educational_level_entity_1 = require("./educational-level.entity");
var ClassroomType;
(function (ClassroomType) {
    ClassroomType["REGULAR"] = "regular";
    ClassroomType["LABORATORY"] = "laboratory";
    ClassroomType["COMPUTER"] = "computer";
    ClassroomType["GYM"] = "gym";
    ClassroomType["MUSIC"] = "music";
    ClassroomType["ART"] = "art";
    ClassroomType["LIBRARY"] = "library";
    ClassroomType["AUDITORIUM"] = "auditorium";
})(ClassroomType || (exports.ClassroomType = ClassroomType = {}));
let Classroom = class Classroom {
};
exports.Classroom = Classroom;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Classroom.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Classroom.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], Classroom.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Classroom.prototype, "capacity", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ClassroomType,
        default: ClassroomType.REGULAR,
    }),
    __metadata("design:type", String)
], Classroom.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-array', { nullable: true }),
    __metadata("design:type", Array)
], Classroom.prototype, "equipment", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Classroom.prototype, "building", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Classroom.prototype, "floor", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { nullable: true }),
    __metadata("design:type", String)
], Classroom.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], Classroom.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => educational_level_entity_1.EducationalLevel, { nullable: true }),
    __metadata("design:type", educational_level_entity_1.EducationalLevel)
], Classroom.prototype, "preferredEducationalLevel", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Classroom.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Classroom.prototype, "updatedAt", void 0);
exports.Classroom = Classroom = __decorate([
    (0, typeorm_1.Entity)('classrooms')
], Classroom);
//# sourceMappingURL=classroom.entity.js.map