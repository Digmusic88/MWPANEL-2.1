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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnrollmentNumberService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const student_entity_1 = require("../entities/student.entity");
let EnrollmentNumberService = class EnrollmentNumberService {
    constructor(studentsRepository) {
        this.studentsRepository = studentsRepository;
    }
    async generateEnrollmentNumber() {
        const currentYear = new Date().getFullYear();
        const prefix = `MW-${currentYear}-`;
        const lastStudent = await this.studentsRepository
            .createQueryBuilder('student')
            .where('student.enrollmentNumber LIKE :pattern', {
            pattern: `${prefix}%`
        })
            .orderBy('student.enrollmentNumber', 'DESC')
            .getOne();
        let nextNumber = 1;
        if (lastStudent) {
            const lastNumberStr = lastStudent.enrollmentNumber.split('-')[2];
            const lastNumber = parseInt(lastNumberStr, 10);
            if (!isNaN(lastNumber)) {
                nextNumber = lastNumber + 1;
            }
        }
        const formattedNumber = nextNumber.toString().padStart(4, '0');
        return `${prefix}${formattedNumber}`;
    }
    async validateEnrollmentNumber(enrollmentNumber) {
        const existing = await this.studentsRepository.findOne({
            where: { enrollmentNumber }
        });
        return !existing;
    }
    validateEnrollmentFormat(enrollmentNumber) {
        const newFormatRegex = /^MW-\d{4}-\d{4}$/;
        const legacyFormatRegex = /^(MW|MT)\d+$|^(MW|MT)-\d{4}-\d+$/;
        return newFormatRegex.test(enrollmentNumber) || legacyFormatRegex.test(enrollmentNumber);
    }
    async generateUniqueEnrollmentNumber(maxAttempts = 100) {
        for (let i = 0; i < maxAttempts; i++) {
            const enrollmentNumber = await this.generateEnrollmentNumber();
            const isUnique = await this.validateEnrollmentNumber(enrollmentNumber);
            if (isUnique) {
                return enrollmentNumber;
            }
            await new Promise(resolve => setTimeout(resolve, 10));
        }
        const timestamp = Date.now();
        return `MW-${new Date().getFullYear()}-${timestamp.toString().slice(-4)}`;
    }
};
exports.EnrollmentNumberService = EnrollmentNumberService;
exports.EnrollmentNumberService = EnrollmentNumberService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(student_entity_1.Student)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], EnrollmentNumberService);
//# sourceMappingURL=enrollment-number.service.js.map