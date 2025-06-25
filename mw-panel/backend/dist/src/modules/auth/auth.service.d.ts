import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { User } from '../users/entities/user.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
export interface JwtPayload {
    sub: string;
    email: string;
    role: string;
    iat?: number;
    exp?: number;
}
export interface AuthResult {
    user: User;
    accessToken: string;
    refreshToken: string;
}
export declare class AuthService {
    private usersRepository;
    private refreshTokenRepository;
    private usersService;
    private jwtService;
    private configService;
    constructor(usersRepository: Repository<User>, refreshTokenRepository: Repository<RefreshToken>, usersService: UsersService, jwtService: JwtService, configService: ConfigService);
    validateUser(email: string, password: string): Promise<User | null>;
    login(loginDto: LoginDto): Promise<AuthResult>;
    register(registerDto: RegisterDto): Promise<AuthResult>;
    refreshTokens(refreshToken: string): Promise<{
        accessToken: string;
    }>;
    logout(refreshToken: string): Promise<void>;
    logoutAll(userId: string): Promise<void>;
    changePassword(userId: string, changePasswordDto: ChangePasswordDto): Promise<void>;
    private generateTokens;
    cleanExpiredTokens(): Promise<void>;
}
