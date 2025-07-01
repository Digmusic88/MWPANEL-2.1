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
exports.ActivityNotification = void 0;
const typeorm_1 = require("typeorm");
const swagger_1 = require("@nestjs/swagger");
const activity_assessment_entity_1 = require("./activity-assessment.entity");
const family_entity_1 = require("../../users/entities/family.entity");
let ActivityNotification = class ActivityNotification {
};
exports.ActivityNotification = ActivityNotification;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID único de la notificación' }),
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ActivityNotification.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Fecha en que la familia vio la notificación' }),
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], ActivityNotification.prototype, "viewedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID de la valoración' }),
    (0, typeorm_1.Column)({ name: 'assessment_id' }),
    __metadata("design:type", String)
], ActivityNotification.prototype, "assessmentId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID de la familia' }),
    (0, typeorm_1.Column)({ name: 'family_id' }),
    __metadata("design:type", String)
], ActivityNotification.prototype, "familyId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => activity_assessment_entity_1.ActivityAssessment, (assessment) => assessment.id, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'assessment_id' }),
    __metadata("design:type", activity_assessment_entity_1.ActivityAssessment)
], ActivityNotification.prototype, "assessment", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => family_entity_1.Family, (family) => family.id),
    (0, typeorm_1.JoinColumn)({ name: 'family_id' }),
    __metadata("design:type", family_entity_1.Family)
], ActivityNotification.prototype, "family", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Fecha de creación' }),
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], ActivityNotification.prototype, "createdAt", void 0);
exports.ActivityNotification = ActivityNotification = __decorate([
    (0, typeorm_1.Entity)('activity_notifications')
], ActivityNotification);
//# sourceMappingURL=activity-notification.entity.js.map