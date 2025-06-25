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
exports.UnshareRubricDto = exports.ShareRubricDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class ShareRubricDto {
}
exports.ShareRubricDto = ShareRubricDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'IDs de los profesores con los que compartir la rúbrica',
        type: [String],
        example: ['uuid-1', 'uuid-2']
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayNotEmpty)(),
    (0, class_validator_1.IsUUID)(4, { each: true }),
    __metadata("design:type", Array)
], ShareRubricDto.prototype, "teacherIds", void 0);
class UnshareRubricDto {
}
exports.UnshareRubricDto = UnshareRubricDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'IDs de los profesores a los que retirar el acceso',
        type: [String],
        example: ['uuid-1', 'uuid-2']
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayNotEmpty)(),
    (0, class_validator_1.IsUUID)(4, { each: true }),
    __metadata("design:type", Array)
], UnshareRubricDto.prototype, "teacherIds", void 0);
//# sourceMappingURL=share-rubric.dto.js.map