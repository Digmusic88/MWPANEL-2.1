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
exports.FamiliesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const family_entity_1 = require("../users/entities/family.entity");
const user_entity_1 = require("../users/entities/user.entity");
const user_profile_entity_1 = require("../users/entities/user-profile.entity");
const student_entity_1 = require("../students/entities/student.entity");
const bcrypt = require("bcrypt");
let FamiliesService = class FamiliesService {
    constructor(familiesRepository, familyStudentRepository, usersRepository, profilesRepository, studentsRepository, dataSource) {
        this.familiesRepository = familiesRepository;
        this.familyStudentRepository = familyStudentRepository;
        this.usersRepository = usersRepository;
        this.profilesRepository = profilesRepository;
        this.studentsRepository = studentsRepository;
        this.dataSource = dataSource;
    }
    async findAll() {
        const families = await this.familiesRepository.find({
            relations: [
                'primaryContact',
                'primaryContact.profile',
                'secondaryContact',
                'secondaryContact.profile',
            ],
            order: { createdAt: 'DESC' },
        });
        const familiesWithStudents = await Promise.all(families.map(async (family) => {
            const familyStudents = await this.familyStudentRepository.find({
                where: { family: { id: family.id } },
                relations: ['student', 'student.user', 'student.user.profile'],
            });
            return {
                ...family,
                students: familyStudents,
            };
        }));
        return familiesWithStudents;
    }
    async findOne(id) {
        const family = await this.familiesRepository.findOne({
            where: { id },
            relations: [
                'primaryContact',
                'primaryContact.profile',
                'secondaryContact',
                'secondaryContact.profile',
            ],
        });
        if (!family) {
            throw new common_1.NotFoundException(`Familia con ID ${id} no encontrada`);
        }
        const familyStudents = await this.familyStudentRepository.find({
            where: { family: { id } },
            relations: ['student', 'student.user', 'student.user.profile'],
        });
        return {
            ...family,
            students: familyStudents,
        };
    }
    async create(createFamilyDto) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const { primaryContact, secondaryContact, students, notes } = createFamilyDto;
            for (const studentRelation of students) {
                const student = await this.studentsRepository.findOne({
                    where: { id: studentRelation.studentId },
                });
                if (!student) {
                    throw new common_1.BadRequestException(`Estudiante con ID ${studentRelation.studentId} no encontrado`);
                }
            }
            const primaryUser = await this.createFamilyUser(primaryContact, queryRunner);
            let secondaryUser = null;
            if (secondaryContact) {
                secondaryUser = await this.createFamilyUser(secondaryContact, queryRunner);
            }
            const family = queryRunner.manager.create(family_entity_1.Family, {
                primaryContact: primaryUser,
                secondaryContact: secondaryUser,
            });
            const savedFamily = await queryRunner.manager.save(family);
            for (const studentRelation of students) {
                const familyStudent = queryRunner.manager.create(family_entity_1.FamilyStudent, {
                    family: savedFamily,
                    student: { id: studentRelation.studentId },
                    relationship: studentRelation.relationship,
                });
                await queryRunner.manager.save(familyStudent);
            }
            await queryRunner.commitTransaction();
            return this.findOne(savedFamily.id);
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            if (error.code === '23505') {
                if (error.detail?.includes('email')) {
                    throw new common_1.ConflictException('El email ya está registrado');
                }
            }
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    async update(id, updateFamilyDto) {
        const family = await this.findOne(id);
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const { primaryContact, secondaryContact, students } = updateFamilyDto;
            if (primaryContact) {
                await this.updateFamilyUser(family.primaryContact.id, primaryContact, queryRunner);
            }
            if (secondaryContact) {
                if (family.secondaryContact) {
                    await this.updateFamilyUser(family.secondaryContact.id, secondaryContact, queryRunner);
                }
                else {
                    if (!secondaryContact.email || !secondaryContact.password || !secondaryContact.firstName || !secondaryContact.lastName || !secondaryContact.phone) {
                        throw new common_1.BadRequestException('Para crear un nuevo contacto secundario, email, password, firstName, lastName y phone son requeridos');
                    }
                    const newContactDto = {
                        email: secondaryContact.email,
                        password: secondaryContact.password,
                        firstName: secondaryContact.firstName,
                        lastName: secondaryContact.lastName,
                        phone: secondaryContact.phone,
                        dateOfBirth: secondaryContact.dateOfBirth,
                        documentNumber: secondaryContact.documentNumber,
                        address: secondaryContact.address,
                        occupation: secondaryContact.occupation,
                    };
                    const newSecondaryUser = await this.createFamilyUser(newContactDto, queryRunner);
                    family.secondaryContact = newSecondaryUser;
                    await queryRunner.manager.save(family);
                }
            }
            if (students) {
                await queryRunner.manager.delete(family_entity_1.FamilyStudent, { family: { id } });
                for (const studentRelation of students) {
                    const student = await this.studentsRepository.findOne({
                        where: { id: studentRelation.studentId },
                    });
                    if (!student) {
                        throw new common_1.BadRequestException(`Estudiante con ID ${studentRelation.studentId} no encontrado`);
                    }
                    const familyStudent = queryRunner.manager.create(family_entity_1.FamilyStudent, {
                        family: { id },
                        student: { id: studentRelation.studentId },
                        relationship: studentRelation.relationship,
                    });
                    await queryRunner.manager.save(familyStudent);
                }
            }
            await queryRunner.commitTransaction();
            return this.findOne(id);
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            if (error.code === '23505') {
                if (error.detail?.includes('email')) {
                    throw new common_1.ConflictException('El email ya está registrado');
                }
            }
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    async remove(id) {
        const family = await this.findOne(id);
        family.primaryContact.isActive = false;
        await this.usersRepository.save(family.primaryContact);
        if (family.secondaryContact) {
            family.secondaryContact.isActive = false;
            await this.usersRepository.save(family.secondaryContact);
        }
    }
    async getAvailableStudents() {
        return this.studentsRepository.find({
            relations: ['user', 'user.profile'],
            where: { user: { isActive: true } },
            order: { createdAt: 'DESC' },
        });
    }
    async getFamilyDashboard(userId) {
        const family = await this.familiesRepository.findOne({
            where: [
                { primaryContact: { id: userId } },
                { secondaryContact: { id: userId } }
            ],
            relations: [
                'primaryContact',
                'primaryContact.profile',
                'secondaryContact',
                'secondaryContact.profile',
            ],
        });
        if (!family) {
            throw new common_1.NotFoundException('Familia no encontrada para este usuario');
        }
        const familyStudents = await this.familyStudentRepository.find({
            where: { family: { id: family.id } },
            relations: [
                'student',
                'student.user',
                'student.user.profile',
                'student.educationalLevel',
                'student.course',
                'student.classGroups',
                'student.evaluations',
                'student.evaluations.competencyEvaluations'
            ],
        });
        const studentsData = await Promise.all(familyStudents.map(async (familyStudent) => {
            const student = familyStudent.student;
            const totalEvaluations = student.evaluations?.length || 0;
            const completedEvaluations = student.evaluations?.filter(e => e.competencyEvaluations?.length > 0).length || 0;
            const pendingEvaluations = totalEvaluations - completedEvaluations;
            let totalGrades = 0;
            let gradeCount = 0;
            student.evaluations?.forEach(evaluation => {
                evaluation.competencyEvaluations?.forEach(compEval => {
                    if (compEval.score !== null && compEval.score !== undefined) {
                        totalGrades += (compEval.score * 2);
                        gradeCount++;
                    }
                });
            });
            const averageGrade = gradeCount > 0 ? totalGrades / gradeCount : 0;
            const recentEvaluations = student.evaluations
                ?.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .slice(0, 5)
                .map(evaluation => ({
                id: evaluation.id,
                period: evaluation.period,
                createdAt: evaluation.createdAt,
                competencyEvaluations: evaluation.competencyEvaluations?.map(compEval => ({
                    competencyName: compEval.competency?.name || 'Competencia',
                    score: compEval.score,
                    displayGrade: compEval.score ? (compEval.score * 2).toFixed(1) : null,
                    observations: compEval.observations,
                })) || []
            })) || [];
            return {
                id: student.id,
                enrollmentNumber: student.enrollmentNumber,
                relationship: familyStudent.relationship,
                user: {
                    profile: {
                        firstName: student.user.profile.firstName,
                        lastName: student.user.profile.lastName,
                    }
                },
                educationalLevel: student.educationalLevel,
                course: student.course,
                classGroups: student.classGroups || [],
                stats: {
                    totalEvaluations,
                    completedEvaluations,
                    pendingEvaluations,
                    averageGrade: Math.round(averageGrade * 10) / 10,
                    attendance: 95
                },
                recentEvaluations
            };
        }));
        return {
            family: {
                id: family.id,
                primaryContact: {
                    id: family.primaryContact.id,
                    profile: {
                        firstName: family.primaryContact.profile.firstName,
                        lastName: family.primaryContact.profile.lastName,
                    }
                },
                secondaryContact: family.secondaryContact ? {
                    id: family.secondaryContact.id,
                    profile: {
                        firstName: family.secondaryContact.profile.firstName,
                        lastName: family.secondaryContact.profile.lastName,
                    }
                } : null,
            },
            students: studentsData,
            summary: {
                totalStudents: studentsData.length,
                averageGrade: studentsData.length > 0
                    ? Math.round((studentsData.reduce((sum, s) => sum + s.stats.averageGrade, 0) / studentsData.length) * 10) / 10
                    : 0,
                totalPendingEvaluations: studentsData.reduce((sum, s) => sum + s.stats.pendingEvaluations, 0),
                totalCompletedEvaluations: studentsData.reduce((sum, s) => sum + s.stats.completedEvaluations, 0),
            }
        };
    }
    async getMyChildren(userId) {
        const family = await this.familiesRepository.findOne({
            where: [
                { primaryContact: { id: userId } },
                { secondaryContact: { id: userId } }
            ]
        });
        if (!family) {
            throw new common_1.NotFoundException('Familia no encontrada para este usuario');
        }
        const familyStudents = await this.familyStudentRepository.find({
            where: { family: { id: family.id } },
            relations: [
                'student',
                'student.user',
                'student.user.profile',
                'student.classGroups',
                'student.classGroups.courses',
                'student.educationalLevel'
            ],
        });
        return familyStudents.map(familyStudent => ({
            id: familyStudent.student.id,
            enrollmentNumber: familyStudent.student.enrollmentNumber,
            user: {
                profile: {
                    firstName: familyStudent.student.user.profile.firstName,
                    lastName: familyStudent.student.user.profile.lastName,
                }
            },
            relationship: familyStudent.relationship,
            educationalLevel: familyStudent.student.educationalLevel?.name || 'No asignado',
            classGroups: familyStudent.student.classGroups?.map(cg => ({
                id: cg.id,
                name: cg.name,
                courses: cg.courses?.map(course => course.name) || []
            })) || []
        }));
    }
    async createFamilyUser(contactDto, queryRunner) {
        const { email, password, firstName, lastName, dateOfBirth, documentNumber, phone, address, occupation } = contactDto;
        const existingUser = await this.usersRepository.findOne({ where: { email } });
        if (existingUser) {
            throw new common_1.ConflictException(`El email ${email} ya está registrado`);
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = queryRunner.manager.create(user_entity_1.User, {
            email,
            passwordHash: hashedPassword,
            role: user_entity_1.UserRole.FAMILY,
            isActive: true,
        });
        const savedUser = await queryRunner.manager.save(user);
        const profile = queryRunner.manager.create(user_profile_entity_1.UserProfile, {
            firstName,
            lastName,
            dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
            documentNumber,
            phone,
            address,
            education: occupation,
        });
        const savedProfile = await queryRunner.manager.save(profile);
        savedUser.profile = savedProfile;
        await queryRunner.manager.save(savedUser);
        return savedUser;
    }
    async updateFamilyUser(userId, contactDto, queryRunner) {
        const { email, password, newPassword, firstName, lastName, dateOfBirth, documentNumber, phone, address, occupation } = contactDto;
        const user = await this.usersRepository.findOne({
            where: { id: userId },
            relations: ['profile'],
        });
        if (!user) {
            throw new common_1.NotFoundException(`Usuario con ID ${userId} no encontrado`);
        }
        let userUpdated = false;
        if (email && email !== user.email) {
            const existingUser = await this.usersRepository.findOne({ where: { email } });
            if (existingUser && existingUser.id !== userId) {
                throw new common_1.ConflictException(`El email ${email} ya está registrado`);
            }
            user.email = email;
            userUpdated = true;
        }
        if (password && password.trim() !== '') {
            const bcrypt = require('bcrypt');
            user.passwordHash = await bcrypt.hash(password, 10);
            userUpdated = true;
        }
        if (newPassword && newPassword.trim() !== '') {
            const bcrypt = require('bcrypt');
            user.passwordHash = await bcrypt.hash(newPassword, 10);
            userUpdated = true;
        }
        if (userUpdated) {
            await queryRunner.manager.save(user);
        }
        const profile = user.profile;
        let profileUpdated = false;
        if (firstName !== undefined) {
            profile.firstName = firstName;
            profileUpdated = true;
        }
        if (lastName !== undefined) {
            profile.lastName = lastName;
            profileUpdated = true;
        }
        if (dateOfBirth !== undefined) {
            profile.dateOfBirth = dateOfBirth ? new Date(dateOfBirth) : null;
            profileUpdated = true;
        }
        if (documentNumber !== undefined) {
            profile.documentNumber = documentNumber;
            profileUpdated = true;
        }
        if (phone !== undefined) {
            profile.phone = phone;
            profileUpdated = true;
        }
        if (address !== undefined) {
            profile.address = address;
            profileUpdated = true;
        }
        if (occupation !== undefined) {
            profile.education = occupation;
            profileUpdated = true;
        }
        if (profileUpdated) {
            await queryRunner.manager.save(profile);
        }
    }
};
exports.FamiliesService = FamiliesService;
exports.FamiliesService = FamiliesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(family_entity_1.Family)),
    __param(1, (0, typeorm_1.InjectRepository)(family_entity_1.FamilyStudent)),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(3, (0, typeorm_1.InjectRepository)(user_profile_entity_1.UserProfile)),
    __param(4, (0, typeorm_1.InjectRepository)(student_entity_1.Student)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource])
], FamiliesService);
//# sourceMappingURL=families.service.js.map