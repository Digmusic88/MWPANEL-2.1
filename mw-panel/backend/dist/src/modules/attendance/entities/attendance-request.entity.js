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
exports.AttendanceRequest = exports.AttendanceRequestStatus = exports.AttendanceRequestType = void 0;
const typeorm_1 = require("typeorm");
const student_entity_1 = require("../../students/entities/student.entity");
const user_entity_1 = require("../../users/entities/user.entity");
var AttendanceRequestType;
(function (AttendanceRequestType) {
    AttendanceRequestType["ABSENCE"] = "absence";
    AttendanceRequestType["LATE_ARRIVAL"] = "late_arrival";
    AttendanceRequestType["EARLY_DEPARTURE"] = "early_departure";
})(AttendanceRequestType || (exports.AttendanceRequestType = AttendanceRequestType = {}));
var AttendanceRequestStatus;
(function (AttendanceRequestStatus) {
    AttendanceRequestStatus["PENDING"] = "pending";
    AttendanceRequestStatus["APPROVED"] = "approved";
    AttendanceRequestStatus["REJECTED"] = "rejected";
    AttendanceRequestStatus["CANCELLED"] = "cancelled";
})(AttendanceRequestStatus || (exports.AttendanceRequestStatus = AttendanceRequestStatus = {}));
let AttendanceRequest = class AttendanceRequest {
};
exports.AttendanceRequest = AttendanceRequest;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], AttendanceRequest.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], AttendanceRequest.prototype, "studentId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => student_entity_1.Student, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'studentId' }),
    __metadata("design:type", student_entity_1.Student)
], AttendanceRequest.prototype, "student", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], AttendanceRequest.prototype, "requestedById", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'requestedById' }),
    __metadata("design:type", user_entity_1.User)
], AttendanceRequest.prototype, "requestedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: AttendanceRequestType,
    }),
    __metadata("design:type", String)
], AttendanceRequest.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], AttendanceRequest.prototype, "date", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], AttendanceRequest.prototype, "reason", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: AttendanceRequestStatus,
        default: AttendanceRequestStatus.PENDING,
    }),
    __metadata("design:type", String)
], AttendanceRequest.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], AttendanceRequest.prototype, "reviewedById", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'reviewedById' }),
    __metadata("design:type", user_entity_1.User)
], AttendanceRequest.prototype, "reviewedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], AttendanceRequest.prototype, "reviewedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], AttendanceRequest.prototype, "reviewNote", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'time', nullable: true }),
    __metadata("design:type", String)
], AttendanceRequest.prototype, "expectedArrivalTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'time', nullable: true }),
    __metadata("design:type", String)
], AttendanceRequest.prototype, "expectedDepartureTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], AttendanceRequest.prototype, "messageId", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], AttendanceRequest.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], AttendanceRequest.prototype, "updatedAt", void 0);
exports.AttendanceRequest = AttendanceRequest = __decorate([
    (0, typeorm_1.Entity)('attendance_requests'),
    (0, typeorm_1.Index)(['studentId', 'date']),
    (0, typeorm_1.Index)(['status']),
    (0, typeorm_1.Index)(['requestedById'])
], AttendanceRequest);
//# sourceMappingURL=attendance-request.entity.js.map