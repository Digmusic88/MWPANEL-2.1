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
exports.TeachersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const teacher_entity_1 = require("./entities/teacher.entity");
const user_entity_1 = require("../users/entities/user.entity");
const user_profile_entity_1 = require("../users/entities/user-profile.entity");
const bcrypt = require("bcrypt");
let TeachersService = class TeachersService {
    constructor(teachersRepository, usersRepository, profilesRepository) {
        this.teachersRepository = teachersRepository;
        this.usersRepository = usersRepository;
        this.profilesRepository = profilesRepository;
    }
    async findAll() {
        return this.teachersRepository.find({
            relations: ['user', 'user.profile', 'subjects', 'tutoredClasses'],
            order: { createdAt: 'DESC' },
        });
    }
    async findOne(id) {
        const teacher = await this.teachersRepository.findOne({
            where: { id },
            relations: ['user', 'user.profile', 'subjects', 'tutoredClasses'],
        });
        if (!teacher) {
            throw new common_1.NotFoundException(`Profesor con ID ${id} no encontrado`);
        }
        return teacher;
    }
    async create(createTeacherDto) {
        const { employeeNumber, specialties, email, password, isActive = true, firstName, lastName, dateOfBirth, documentNumber, phone, address, education, hireDate, department, position, } = createTeacherDto;
        const existingUser = await this.usersRepository.findOne({ where: { email } });
        if (existingUser) {
            throw new common_1.ConflictException('El email ya está registrado');
        }
        const existingTeacher = await this.teachersRepository.findOne({ where: { employeeNumber } });
        if (existingTeacher) {
            throw new common_1.ConflictException('El número de empleado ya está registrado');
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = this.usersRepository.create({
            email,
            passwordHash: hashedPassword,
            role: user_entity_1.UserRole.TEACHER,
            isActive,
        });
        const savedUser = await this.usersRepository.save(user);
        const profile = this.profilesRepository.create({
            firstName,
            lastName,
            dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
            documentNumber,
            phone,
            address,
            education,
            hireDate: hireDate ? new Date(hireDate) : undefined,
            department,
            position,
        });
        const savedProfile = await this.profilesRepository.save(profile);
        savedUser.profile = savedProfile;
        await this.usersRepository.save(savedUser);
        const teacher = this.teachersRepository.create({
            employeeNumber,
            specialties: specialties || [],
            user: savedUser,
        });
        return this.teachersRepository.save(teacher);
    }
    async update(id, updateTeacherDto) {
        const teacher = await this.findOne(id);
        const { employeeNumber, specialties, email, isActive, firstName, lastName, dateOfBirth, documentNumber, phone, address, education, hireDate, department, position, newPassword, } = updateTeacherDto;
        if (employeeNumber && employeeNumber !== teacher.employeeNumber) {
            const existingTeacher = await this.teachersRepository.findOne({ where: { employeeNumber } });
            if (existingTeacher && existingTeacher.id !== id) {
                throw new common_1.ConflictException('El número de empleado ya está registrado');
            }
            teacher.employeeNumber = employeeNumber;
        }
        if (specialties !== undefined) {
            teacher.specialties = specialties;
        }
        if (email && email !== teacher.user.email) {
            const existingUser = await this.usersRepository.findOne({ where: { email } });
            if (existingUser && existingUser.id !== teacher.user.id) {
                throw new common_1.ConflictException('El email ya está registrado');
            }
            teacher.user.email = email;
        }
        if (isActive !== undefined) {
            teacher.user.isActive = isActive;
        }
        if (newPassword && newPassword.trim() !== '') {
            const bcrypt = require('bcrypt');
            teacher.user.passwordHash = await bcrypt.hash(newPassword, 10);
        }
        const profile = teacher.user.profile;
        if (firstName)
            profile.firstName = firstName;
        if (lastName)
            profile.lastName = lastName;
        if (dateOfBirth)
            profile.dateOfBirth = new Date(dateOfBirth);
        if (documentNumber)
            profile.documentNumber = documentNumber;
        if (phone)
            profile.phone = phone;
        if (address)
            profile.address = address;
        if (education)
            profile.education = education;
        if (hireDate)
            profile.hireDate = new Date(hireDate);
        if (department)
            profile.department = department;
        if (position)
            profile.position = position;
        await this.profilesRepository.save(profile);
        await this.usersRepository.save(teacher.user);
        await this.teachersRepository.save(teacher);
        return this.findOne(id);
    }
    async remove(id) {
        const teacher = await this.findOne(id);
        teacher.user.isActive = false;
        await this.usersRepository.save(teacher.user);
    }
    async getTeacherDashboard(userId) {
        const teacher = await this.teachersRepository.findOne({
            where: { user: { id: userId } },
            relations: [
                'user',
                'user.profile',
                'subjects',
                'tutoredClasses',
                'tutoredClasses.students',
                'tutoredClasses.students.user',
                'tutoredClasses.students.user.profile'
            ],
        });
        if (!teacher) {
            throw new common_1.NotFoundException('Profesor no encontrado');
        }
        const dashboardData = {
            teacher: {
                id: teacher.id,
                employeeNumber: teacher.employeeNumber,
                specialties: teacher.specialties,
                user: {
                    id: teacher.user.id,
                    email: teacher.user.email,
                    role: teacher.user.role,
                    isActive: teacher.user.isActive,
                    profile: teacher.user.profile
                }
            },
            summary: {
                totalClasses: teacher.tutoredClasses?.length || 0,
                totalStudents: teacher.tutoredClasses?.reduce((total, classGroup) => total + (classGroup.students?.length || 0), 0) || 0,
                totalSubjects: teacher.subjects?.length || 0,
            },
            classes: teacher.tutoredClasses?.map(classGroup => ({
                id: classGroup.id,
                name: classGroup.name,
                section: classGroup.section,
                studentsCount: classGroup.students?.length || 0,
                students: classGroup.students?.map(student => ({
                    id: student.id,
                    enrollmentNumber: student.enrollmentNumber,
                    name: `${student.user.profile.firstName} ${student.user.profile.lastName}`
                })) || []
            })) || [],
            subjects: teacher.subjects || [],
            recentActivity: {
                lastLogin: teacher.user.lastLoginAt,
                updatedAt: teacher.updatedAt
            }
        };
        return dashboardData;
    }
    async findByUserId(userId) {
        const teacher = await this.teachersRepository.findOne({
            where: { user: { id: userId } },
            relations: ['user', 'user.profile'],
        });
        if (!teacher) {
            throw new common_1.NotFoundException('Profesor no encontrado');
        }
        return teacher;
    }
};
exports.TeachersService = TeachersService;
exports.TeachersService = TeachersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(teacher_entity_1.Teacher)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(2, (0, typeorm_1.InjectRepository)(user_profile_entity_1.UserProfile)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], TeachersService);
//# sourceMappingURL=teachers.service.js.map