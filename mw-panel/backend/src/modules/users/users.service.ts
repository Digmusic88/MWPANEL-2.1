import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import { UserProfile } from './entities/user-profile.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(UserProfile)
    private userProfileRepository: Repository<UserProfile>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Check if user already exists
    const existingUser = await this.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new ConflictException('El email ya está en uso');
    }

    // Create user
    const user = this.usersRepository.create({
      email: createUserDto.email,
      password: createUserDto.password,
      role: createUserDto.role,
    });

    const savedUser = await this.usersRepository.save(user);

    // Create user profile
    const profile = this.userProfileRepository.create({
      firstName: createUserDto.firstName,
      lastName: createUserDto.lastName,
      phone: createUserDto.phone,
      dni: createUserDto.dni,
      user: savedUser,
    });

    await this.userProfileRepository.save(profile);

    // Return user with profile
    return this.findOne(savedUser.id);
  }

  async findAll(
    page = 1,
    limit = 10,
    role?: UserRole,
    search?: string,
  ): Promise<{
    users: User[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const queryBuilder = this.usersRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.profile', 'profile')
      .orderBy('user.createdAt', 'DESC');

    // Filter by role
    if (role) {
      queryBuilder.andWhere('user.role = :role', { role });
    }

    // Search functionality
    if (search) {
      queryBuilder.andWhere(
        '(user.email ILIKE :search OR profile.firstName ILIKE :search OR profile.lastName ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Pagination
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

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['profile'],
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email },
      relations: ['profile'],
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    // Check if email is being changed and if it's already in use
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.findByEmail(updateUserDto.email);
      if (existingUser) {
        throw new ConflictException('El email ya está en uso');
      }
    }

    // Update user fields
    Object.assign(user, updateUserDto);
    
    return this.usersRepository.save(user);
  }

  async updateProfile(id: string, updateProfileDto: UpdateProfileDto): Promise<User> {
    const user = await this.findOne(id);

    if (!user.profile) {
      // Create profile if it doesn't exist
      const profile = this.userProfileRepository.create({
        ...updateProfileDto,
        user,
      });
      await this.userProfileRepository.save(profile);
    } else {
      // Update existing profile
      Object.assign(user.profile, updateProfileDto);
      await this.userProfileRepository.save(user.profile);
    }

    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);

    // Soft delete - just deactivate the user
    user.isActive = false;
    await this.usersRepository.save(user);
  }

  async restore(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    user.isActive = true;
    await this.usersRepository.save(user);

    return this.findOne(id);
  }

  async getStats(): Promise<{
    total: number;
    byRole: Record<UserRole, number>;
    activeUsers: number;
    inactiveUsers: number;
  }> {
    const total = await this.usersRepository.count();
    const activeUsers = await this.usersRepository.count({ where: { isActive: true } });
    const inactiveUsers = total - activeUsers;

    const byRole = {} as Record<UserRole, number>;
    
    for (const role of Object.values(UserRole)) {
      byRole[role] = await this.usersRepository.count({ where: { role } });
    }

    return {
      total,
      byRole,
      activeUsers,
      inactiveUsers,
    };
  }

  async getUsersByRole(role: UserRole): Promise<User[]> {
    return this.usersRepository.find({
      where: { role, isActive: true },
      relations: ['profile'],
      order: { createdAt: 'DESC' },
    });
  }
}