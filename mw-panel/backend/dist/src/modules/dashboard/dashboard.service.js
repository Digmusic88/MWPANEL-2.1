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
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const student_entity_1 = require("../students/entities/student.entity");
const teacher_entity_1 = require("../teachers/entities/teacher.entity");
const user_entity_1 = require("../users/entities/user.entity");
const evaluation_entity_1 = require("../evaluations/entities/evaluation.entity");
const class_group_entity_1 = require("../students/entities/class-group.entity");
let DashboardService = class DashboardService {
    constructor(studentsRepository, teachersRepository, usersRepository, evaluationsRepository, classGroupsRepository) {
        this.studentsRepository = studentsRepository;
        this.teachersRepository = teachersRepository;
        this.usersRepository = usersRepository;
        this.evaluationsRepository = evaluationsRepository;
        this.classGroupsRepository = classGroupsRepository;
    }
    async getStats() {
        const totalStudents = await this.studentsRepository.count({
            relations: ['user'],
            where: {
                user: {
                    isActive: true,
                },
            },
        });
        const totalTeachers = await this.teachersRepository.count({
            relations: ['user'],
            where: {
                user: {
                    isActive: true,
                },
            },
        });
        const totalClasses = await this.classGroupsRepository.count();
        const [completedEvaluations, pendingEvaluations] = await Promise.all([
            this.evaluationsRepository.count({
                where: {
                    status: evaluation_entity_1.EvaluationStatus.FINALIZED,
                },
            }),
            this.evaluationsRepository.count({
                where: {
                    status: evaluation_entity_1.EvaluationStatus.DRAFT,
                },
            }),
        ]);
        const evaluations = await this.evaluationsRepository.find({
            where: {
                status: evaluation_entity_1.EvaluationStatus.FINALIZED,
            },
        });
        const averageGrade = evaluations.length > 0
            ? evaluations.reduce((sum, evaluation) => sum + (evaluation.overallScore || 0), 0) / evaluations.length
            : 8.3;
        const studentsByLevel = await this.studentsRepository
            .createQueryBuilder('student')
            .leftJoinAndSelect('student.educationalLevel', 'level')
            .leftJoinAndSelect('student.user', 'user')
            .where('user.isActive = :isActive', { isActive: true })
            .getMany();
        const levelDistribution = {
            infantil: studentsByLevel.filter(s => s.educationalLevel?.name?.toLowerCase().includes('infantil')).length,
            primaria: studentsByLevel.filter(s => s.educationalLevel?.name?.toLowerCase().includes('primaria')).length,
            secundaria: studentsByLevel.filter(s => s.educationalLevel?.name?.toLowerCase().includes('secundaria')).length,
            other: studentsByLevel.filter(s => !s.educationalLevel).length,
        };
        return {
            totalStudents,
            totalTeachers,
            totalClasses,
            completedEvaluations,
            pendingEvaluations,
            averageGrade: Number(averageGrade.toFixed(1)),
            levelDistribution,
            lastUpdated: new Date(),
        };
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(student_entity_1.Student)),
    __param(1, (0, typeorm_1.InjectRepository)(teacher_entity_1.Teacher)),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(3, (0, typeorm_1.InjectRepository)(evaluation_entity_1.Evaluation)),
    __param(4, (0, typeorm_1.InjectRepository)(class_group_entity_1.ClassGroup)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map