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
exports.FamilyStudent = exports.Family = exports.FamilyRelationship = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
const student_entity_1 = require("../../students/entities/student.entity");
var FamilyRelationship;
(function (FamilyRelationship) {
    FamilyRelationship["FATHER"] = "father";
    FamilyRelationship["MOTHER"] = "mother";
    FamilyRelationship["GUARDIAN"] = "guardian";
    FamilyRelationship["OTHER"] = "other";
})(FamilyRelationship || (exports.FamilyRelationship = FamilyRelationship = {}));
let Family = class Family {
};
exports.Family = Family;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Family.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    __metadata("design:type", user_entity_1.User)
], Family.prototype, "primaryContact", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: true }),
    __metadata("design:type", user_entity_1.User)
], Family.prototype, "secondaryContact", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Family.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Family.prototype, "updatedAt", void 0);
exports.Family = Family = __decorate([
    (0, typeorm_1.Entity)('families')
], Family);
let FamilyStudent = class FamilyStudent {
};
exports.FamilyStudent = FamilyStudent;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], FamilyStudent.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Family),
    __metadata("design:type", Family)
], FamilyStudent.prototype, "family", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => student_entity_1.Student),
    __metadata("design:type", student_entity_1.Student)
], FamilyStudent.prototype, "student", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: FamilyRelationship,
    }),
    __metadata("design:type", String)
], FamilyStudent.prototype, "relationship", void 0);
exports.FamilyStudent = FamilyStudent = __decorate([
    (0, typeorm_1.Entity)('family_students')
], FamilyStudent);
//# sourceMappingURL=family.entity.js.map