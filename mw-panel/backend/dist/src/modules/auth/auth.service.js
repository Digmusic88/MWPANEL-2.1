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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const config_1 = require("@nestjs/config");
const user_entity_1 = require("../users/entities/user.entity");
const refresh_token_entity_1 = require("./entities/refresh-token.entity");
const users_service_1 = require("../users/users.service");
let AuthService = class AuthService {
    constructor(usersRepository, refreshTokenRepository, usersService, jwtService, configService) {
        this.usersRepository = usersRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.usersService = usersService;
        this.jwtService = jwtService;
        this.configService = configService;
    }
    async validateUser(email, password) {
        const user = await this.usersRepository
            .createQueryBuilder('user')
            .addSelect('user.passwordHash')
            .leftJoinAndSelect('user.profile', 'profile')
            .where('user.email = :email', { email })
            .getOne();
        if (user && user.isActive && await user.validatePassword(password)) {
            await this.usersRepository.update(user.id, {
                lastLoginAt: new Date(),
            });
            return user;
        }
        return null;
    }
    async login(loginDto) {
        const user = await this.validateUser(loginDto.email, loginDto.password);
        if (!user) {
            throw new common_1.UnauthorizedException('Credenciales inválidas');
        }
        const tokens = await this.generateTokens(user);
        return {
            user,
            ...tokens,
        };
    }
    async register(registerDto) {
        const existingUser = await this.usersService.findByEmail(registerDto.email);
        if (existingUser) {
            throw new common_1.BadRequestException('El usuario ya existe');
        }
        const user = await this.usersService.create(registerDto);
        const tokens = await this.generateTokens(user);
        return {
            user,
            ...tokens,
        };
    }
    async refreshTokens(refreshToken) {
        const tokenEntity = await this.refreshTokenRepository.findOne({
            where: { token: refreshToken, isRevoked: false },
            relations: ['user'],
        });
        if (!tokenEntity) {
            throw new common_1.UnauthorizedException('Token de actualización inválido');
        }
        if (tokenEntity.expiresAt < new Date()) {
            throw new common_1.UnauthorizedException('Token de actualización expirado');
        }
        if (!tokenEntity.user.isActive) {
            throw new common_1.UnauthorizedException('Usuario inactivo');
        }
        const payload = {
            sub: tokenEntity.user.id,
            email: tokenEntity.user.email,
            role: tokenEntity.user.role,
        };
        const accessToken = this.jwtService.sign(payload);
        return { accessToken };
    }
    async logout(refreshToken) {
        await this.refreshTokenRepository.update({ token: refreshToken }, { isRevoked: true, revokedAt: new Date() });
    }
    async logoutAll(userId) {
        await this.refreshTokenRepository.update({ user: { id: userId } }, { isRevoked: true, revokedAt: new Date() });
    }
    async changePassword(userId, changePasswordDto) {
        const user = await this.usersRepository
            .createQueryBuilder('user')
            .addSelect('user.passwordHash')
            .where('user.id = :id', { id: userId })
            .getOne();
        if (!user) {
            throw new common_1.NotFoundException('Usuario no encontrado');
        }
        const isCurrentPasswordValid = await user.validatePassword(changePasswordDto.currentPassword);
        if (!isCurrentPasswordValid) {
            throw new common_1.BadRequestException('Contraseña actual incorrecta');
        }
        user.password = changePasswordDto.newPassword;
        await this.usersRepository.save(user);
        await this.logoutAll(userId);
    }
    async generateTokens(user) {
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
        };
        const accessToken = this.jwtService.sign(payload);
        const refreshTokenValue = this.jwtService.sign({ sub: user.id }, {
            secret: this.configService.get('app.jwt.refreshSecret'),
            expiresIn: this.configService.get('app.jwt.refreshExpiresIn'),
        });
        const refreshTokenEntity = this.refreshTokenRepository.create({
            token: refreshTokenValue,
            user,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });
        await this.refreshTokenRepository.save(refreshTokenEntity);
        return {
            accessToken,
            refreshToken: refreshTokenValue,
        };
    }
    async cleanExpiredTokens() {
        await this.refreshTokenRepository.delete({
            expiresAt: new Date(),
        });
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(refresh_token_entity_1.RefreshToken)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        users_service_1.UsersService,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map