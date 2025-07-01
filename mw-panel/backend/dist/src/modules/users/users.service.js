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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("./entities/user.entity");
const user_profile_entity_1 = require("./entities/user-profile.entity");
let UsersService = class UsersService {
    constructor(usersRepository, userProfileRepository) {
        this.usersRepository = usersRepository;
        this.userProfileRepository = userProfileRepository;
    }
    async create(createUserDto) {
        const existingUser = await this.findByEmail(createUserDto.email);
        if (existingUser) {
            throw new common_1.ConflictException('El email ya está en uso');
        }
        const user = this.usersRepository.create({
            email: createUserDto.email,
            password: createUserDto.password,
            role: createUserDto.role,
        });
        const savedUser = await this.usersRepository.save(user);
        const profile = this.userProfileRepository.create({
            firstName: createUserDto.firstName,
            lastName: createUserDto.lastName,
            phone: createUserDto.phone,
            dni: createUserDto.dni,
            user: savedUser,
        });
        await this.userProfileRepository.save(profile);
        return this.findOne(savedUser.id);
    }
    async findAll(page = 1, limit = 10, role, search) {
        const queryBuilder = this.usersRepository
            .createQueryBuilder('user')
            .leftJoinAndSelect('user.profile', 'profile')
            .orderBy('user.createdAt', 'DESC');
        if (role) {
            queryBuilder.andWhere('user.role = :role', { role });
        }
        if (search) {
            queryBuilder.andWhere('(user.email ILIKE :search OR profile.firstName ILIKE :search OR profile.lastName ILIKE :search)', { search: `%${search}%` });
        }
        const total = await queryBuilder.getCount();
        const users = await queryBuilder
            .skip((page - 1) * limit)
            .take(limit)
            .getMany();
        return {
            users,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async findOne(id) {
        const user = await this.usersRepository.findOne({
            where: { id },
            relations: ['profile'],
        });
        if (!user) {
            throw new common_1.NotFoundException('Usuario no encontrado');
        }
        return user;
    }
    async findByEmail(email) {
        return this.usersRepository.findOne({
            where: { email },
            relations: ['profile'],
        });
    }
    async update(id, updateUserDto) {
        const user = await this.findOne(id);
        if (updateUserDto.email && updateUserDto.email !== user.email) {
            const existingUser = await this.findByEmail(updateUserDto.email);
            if (existingUser) {
                throw new common_1.ConflictException('El email ya está en uso');
            }
        }
        const { newPassword, ...restUpdateData } = updateUserDto;
        Object.assign(user, restUpdateData);
        if (newPassword && newPassword.trim() !== '') {
            const bcrypt = require('bcrypt');
            user.passwordHash = await bcrypt.hash(newPassword, 10);
        }
        return this.usersRepository.save(user);
    }
    async updateProfile(id, updateProfileDto) {
        const user = await this.findOne(id);
        if (!user.profile) {
            const profile = this.userProfileRepository.create({
                ...updateProfileDto,
                user,
            });
            await this.userProfileRepository.save(profile);
        }
        else {
            Object.assign(user.profile, updateProfileDto);
            await this.userProfileRepository.save(user.profile);
        }
        return this.findOne(id);
    }
    async remove(id) {
        const user = await this.findOne(id);
        user.isActive = false;
        await this.usersRepository.save(user);
    }
    async restore(id) {
        const user = await this.usersRepository.findOne({ where: { id } });
        if (!user) {
            throw new common_1.NotFoundException('Usuario no encontrado');
        }
        user.isActive = true;
        await this.usersRepository.save(user);
        return this.findOne(id);
    }
    async getStats() {
        const total = await this.usersRepository.count();
        const activeUsers = await this.usersRepository.count({ where: { isActive: true } });
        const inactiveUsers = total - activeUsers;
        const byRole = {};
        for (const role of Object.values(user_entity_1.UserRole)) {
            byRole[role] = await this.usersRepository.count({ where: { role } });
        }
        return {
            total,
            byRole,
            activeUsers,
            inactiveUsers,
        };
    }
    async getUsersByRole(role) {
        return this.usersRepository.find({
            where: { role, isActive: true },
            relations: ['profile'],
            order: { createdAt: 'DESC' },
        });
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(user_profile_entity_1.UserProfile)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], UsersService);
//# sourceMappingURL=users.service.js.map