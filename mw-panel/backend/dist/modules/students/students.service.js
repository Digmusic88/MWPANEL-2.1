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
exports.StudentsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const student_entity_1 = require("./entities/student.entity");
const user_entity_1 = require("../users/entities/user.entity");
const user_profile_entity_1 = require("../users/entities/user-profile.entity");
const bcrypt = require("bcrypt");
let StudentsService = class StudentsService {
    constructor(studentsRepository, usersRepository, userProfileRepository) {
        this.studentsRepository = studentsRepository;
        this.usersRepository = usersRepository;
        this.userProfileRepository = userProfileRepository;
    }
    async findAll() {
        return this.studentsRepository.find({
            relations: ['user', 'user.profile', 'educationalLevel', 'course', 'classGroups'],
        });
    }
    async findOne(id) {
        const student = await this.studentsRepository.findOne({
            where: { id },
            relations: ['user', 'user.profile', 'educationalLevel', 'course', 'classGroups'],
        });
        if (!student) {
            throw new common_1.NotFoundException('Estudiante no encontrado');
        }
        return student;
    }
    async create(createStudentDto) {
        const { email, password, firstName, lastName, phone, dni, enrollmentNumber, birthDate } = createStudentDto;
        const existingUser = await this.usersRepository.findOne({ where: { email } });
        if (existingUser) {
            throw new common_1.ConflictException('El email ya está en uso');
        }
        const existingStudent = await this.studentsRepository.findOne({ where: { enrollmentNumber } });
        if (existingStudent) {
            throw new common_1.ConflictException('El número de matrícula ya está en uso');
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = this.usersRepository.create({
            email,
            passwordHash: hashedPassword,
            role: user_entity_1.UserRole.STUDENT,
            isActive: true,
        });
        const savedUser = await this.usersRepository.save(user);
        const profile = this.userProfileRepository.create({
            firstName,
            lastName,
            phone,
            dni,
            user: savedUser,
        });
        await this.userProfileRepository.save(profile);
        const student = this.studentsRepository.create({
            user: savedUser,
            enrollmentNumber,
            birthDate: birthDate ? new Date(birthDate) : new Date(),
        });
        return this.studentsRepository.save(student);
    }
    async update(id, updateStudentDto) {
        const student = await this.findOne(id);
        const { email, firstName, lastName, phone, dni, enrollmentNumber } = updateStudentDto;
        if (email && email !== student.user.email) {
            const existingUser = await this.usersRepository.findOne({ where: { email } });
            if (existingUser) {
                throw new common_1.ConflictException('El email ya está en uso');
            }
            student.user.email = email;
            await this.usersRepository.save(student.user);
        }
        if (firstName)
            student.user.profile.firstName = firstName;
        if (lastName)
            student.user.profile.lastName = lastName;
        if (phone !== undefined)
            student.user.profile.phone = phone;
        if (dni !== undefined)
            student.user.profile.dni = dni;
        await this.userProfileRepository.save(student.user.profile);
        if (enrollmentNumber && enrollmentNumber !== student.enrollmentNumber) {
            const existingStudent = await this.studentsRepository.findOne({ where: { enrollmentNumber } });
            if (existingStudent && existingStudent.id !== id) {
                throw new common_1.ConflictException('El número de matrícula ya está en uso');
            }
            student.enrollmentNumber = enrollmentNumber;
        }
        return this.studentsRepository.save(student);
    }
    async remove(id) {
        const student = await this.findOne(id);
        student.user.isActive = false;
        await this.usersRepository.save(student.user);
    }
};
exports.StudentsService = StudentsService;
exports.StudentsService = StudentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(student_entity_1.Student)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(2, (0, typeorm_1.InjectRepository)(user_profile_entity_1.UserProfile)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], StudentsService);
//# sourceMappingURL=students.service.js.map