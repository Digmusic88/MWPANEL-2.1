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
exports.EnrollmentService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../users/entities/user.entity");
const user_profile_entity_1 = require("../users/entities/user-profile.entity");
const student_entity_1 = require("../students/entities/student.entity");
const educational_level_entity_1 = require("../students/entities/educational-level.entity");
const course_entity_1 = require("../students/entities/course.entity");
const family_entity_1 = require("../users/entities/family.entity");
const enrollment_number_service_1 = require("../students/services/enrollment-number.service");
const bcrypt = require("bcrypt");
let EnrollmentService = class EnrollmentService {
    constructor(usersRepository, profilesRepository, studentsRepository, familiesRepository, familyStudentRepository, dataSource, enrollmentNumberService) {
        this.usersRepository = usersRepository;
        this.profilesRepository = profilesRepository;
        this.studentsRepository = studentsRepository;
        this.familiesRepository = familiesRepository;
        this.familyStudentRepository = familyStudentRepository;
        this.dataSource = dataSource;
        this.enrollmentNumberService = enrollmentNumberService;
    }
    async processEnrollment(createEnrollmentDto) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const studentUser = await this.createStudentUser(createEnrollmentDto.student, queryRunner);
            const student = await this.createStudentRecord(createEnrollmentDto.student, studentUser, queryRunner);
            let family;
            if (createEnrollmentDto.family.existingFamilyId) {
                family = await queryRunner.manager.findOne(family_entity_1.Family, {
                    where: { id: createEnrollmentDto.family.existingFamilyId },
                    relations: ['primaryContact', 'secondaryContact']
                });
                if (!family) {
                    throw new common_1.BadRequestException('Familia no encontrada');
                }
            }
            else {
                family = await this.createNewFamily(createEnrollmentDto.family, queryRunner);
            }
            await this.linkStudentToFamily(student, family, createEnrollmentDto.family.relationship, queryRunner);
            await queryRunner.commitTransaction();
            return {
                message: 'Inscripción procesada exitosamente',
                student: {
                    id: student.id,
                    enrollmentNumber: student.enrollmentNumber,
                    user: {
                        id: studentUser.id,
                        email: studentUser.email
                    }
                },
                family: {
                    id: family.id,
                    primaryContact: family.primaryContact.email,
                    secondaryContact: family.secondaryContact?.email
                }
            };
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    async createStudentUser(studentData, queryRunner) {
        const existingUser = await queryRunner.manager.findOne(user_entity_1.User, {
            where: { email: studentData.email }
        });
        if (existingUser) {
            throw new common_1.ConflictException(`El email ${studentData.email} ya está registrado`);
        }
        const hashedPassword = await bcrypt.hash(studentData.password, 10);
        const user = queryRunner.manager.create(user_entity_1.User, {
            email: studentData.email,
            passwordHash: hashedPassword,
            role: user_entity_1.UserRole.STUDENT,
            isActive: true,
        });
        const savedUser = await queryRunner.manager.save(user);
        const profile = queryRunner.manager.create(user_profile_entity_1.UserProfile, {
            user: savedUser,
            firstName: studentData.firstName,
            lastName: studentData.lastName,
            dateOfBirth: studentData.birthDate ? new Date(studentData.birthDate) : null,
            documentNumber: studentData.documentNumber,
            phone: studentData.phone,
        });
        await queryRunner.manager.save(profile);
        return savedUser;
    }
    async createStudentRecord(studentData, user, queryRunner) {
        let enrollmentNumber;
        if (studentData.enrollmentNumber && studentData.enrollmentNumber.trim() !== '') {
            if (!this.enrollmentNumberService.validateEnrollmentFormat(studentData.enrollmentNumber)) {
                throw new common_1.BadRequestException(`Formato de número de matrícula inválido: ${studentData.enrollmentNumber}`);
            }
            const existingStudent = await queryRunner.manager.findOne(student_entity_1.Student, {
                where: { enrollmentNumber: studentData.enrollmentNumber }
            });
            if (existingStudent) {
                throw new common_1.ConflictException(`El número de matrícula ${studentData.enrollmentNumber} ya está registrado`);
            }
            enrollmentNumber = studentData.enrollmentNumber;
        }
        else {
            enrollmentNumber = await this.enrollmentNumberService.generateUniqueEnrollmentNumber();
        }
        let educationalLevel = null;
        if (studentData.educationalLevelId) {
            educationalLevel = await queryRunner.manager.findOne(educational_level_entity_1.EducationalLevel, {
                where: { id: studentData.educationalLevelId }
            });
        }
        let course = null;
        if (studentData.courseId) {
            course = await queryRunner.manager.findOne(course_entity_1.Course, {
                where: { id: studentData.courseId }
            });
        }
        const student = queryRunner.manager.create(student_entity_1.Student, {
            user,
            enrollmentNumber,
            birthDate: studentData.birthDate ? new Date(studentData.birthDate) : new Date(),
            educationalLevel,
            course,
        });
        return await queryRunner.manager.save(student);
    }
    async createNewFamily(familyData, queryRunner) {
        const primaryUser = await this.createFamilyContact(familyData.primaryContact, queryRunner);
        let secondaryUser = null;
        if (familyData.secondaryContact) {
            secondaryUser = await this.createFamilyContact(familyData.secondaryContact, queryRunner);
        }
        const family = queryRunner.manager.create(family_entity_1.Family, {
            primaryContact: primaryUser,
            secondaryContact: secondaryUser,
        });
        return await queryRunner.manager.save(family);
    }
    async createFamilyContact(contactData, queryRunner) {
        const existingUser = await queryRunner.manager.findOne(user_entity_1.User, {
            where: { email: contactData.email }
        });
        if (existingUser) {
            throw new common_1.ConflictException(`El email ${contactData.email} ya está registrado`);
        }
        const hashedPassword = await bcrypt.hash(contactData.password, 10);
        const user = queryRunner.manager.create(user_entity_1.User, {
            email: contactData.email,
            passwordHash: hashedPassword,
            role: user_entity_1.UserRole.FAMILY,
            isActive: true,
        });
        const savedUser = await queryRunner.manager.save(user);
        const profile = queryRunner.manager.create(user_profile_entity_1.UserProfile, {
            user: savedUser,
            firstName: contactData.firstName,
            lastName: contactData.lastName,
            dateOfBirth: contactData.dateOfBirth ? new Date(contactData.dateOfBirth) : null,
            documentNumber: contactData.documentNumber,
            phone: contactData.phone,
            address: contactData.address,
            occupation: contactData.occupation,
        });
        await queryRunner.manager.save(profile);
        return savedUser;
    }
    async linkStudentToFamily(student, family, relationship, queryRunner) {
        const familyStudent = queryRunner.manager.create(family_entity_1.FamilyStudent, {
            family,
            student,
            relationship,
        });
        await queryRunner.manager.save(familyStudent);
    }
};
exports.EnrollmentService = EnrollmentService;
exports.EnrollmentService = EnrollmentService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(user_profile_entity_1.UserProfile)),
    __param(2, (0, typeorm_1.InjectRepository)(student_entity_1.Student)),
    __param(3, (0, typeorm_1.InjectRepository)(family_entity_1.Family)),
    __param(4, (0, typeorm_1.InjectRepository)(family_entity_1.FamilyStudent)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource,
        enrollment_number_service_1.EnrollmentNumberService])
], EnrollmentService);
//# sourceMappingURL=enrollment.service.js.map