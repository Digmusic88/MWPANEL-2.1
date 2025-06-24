import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Teacher } from './entities/teacher.entity';
import { User, UserRole } from '../users/entities/user.entity';
import { UserProfile } from '../users/entities/user-profile.entity';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class TeachersService {
  constructor(
    @InjectRepository(Teacher)
    private teachersRepository: Repository<Teacher>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(UserProfile)
    private profilesRepository: Repository<UserProfile>,
  ) {}

  async findAll(): Promise<Teacher[]> {
    return this.teachersRepository.find({
      relations: ['user', 'user.profile', 'subjects', 'tutoredClasses'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Teacher> {
    const teacher = await this.teachersRepository.findOne({
      where: { id },
      relations: ['user', 'user.profile', 'subjects', 'tutoredClasses'],
    });

    if (!teacher) {
      throw new NotFoundException(`Profesor con ID ${id} no encontrado`);
    }

    return teacher;
  }

  async create(createTeacherDto: CreateTeacherDto): Promise<Teacher> {
    const {
      employeeNumber,
      specialties,
      email,
      password,
      isActive = true,
      firstName,
      lastName,
      dateOfBirth,
      documentNumber,
      phone,
      address,
      education,
      hireDate,
      department,
      position,
    } = createTeacherDto;

    // Check if email already exists
    const existingUser = await this.usersRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }

    // Check if employee number already exists
    const existingTeacher = await this.teachersRepository.findOne({ where: { employeeNumber } });
    if (existingTeacher) {
      throw new ConflictException('El número de empleado ya está registrado');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = this.usersRepository.create({
      email,
      passwordHash: hashedPassword,
      role: UserRole.TEACHER,
      isActive,
    });
    const savedUser = await this.usersRepository.save(user);

    // Create profile
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

    // Link profile to user
    savedUser.profile = savedProfile;
    await this.usersRepository.save(savedUser);

    // Create teacher
    const teacher = this.teachersRepository.create({
      employeeNumber,
      specialties: specialties || [],
      user: savedUser,
    });

    return this.teachersRepository.save(teacher);
  }

  async update(id: string, updateTeacherDto: UpdateTeacherDto): Promise<Teacher> {
    const teacher = await this.findOne(id);
    
    const {
      employeeNumber,
      specialties,
      email,
      isActive,
      firstName,
      lastName,
      dateOfBirth,
      documentNumber,
      phone,
      address,
      education,
      hireDate,
      department,
      position,
      newPassword,
    } = updateTeacherDto;

    // Update teacher entity
    if (employeeNumber && employeeNumber !== teacher.employeeNumber) {
      const existingTeacher = await this.teachersRepository.findOne({ where: { employeeNumber } });
      if (existingTeacher && existingTeacher.id !== id) {
        throw new ConflictException('El número de empleado ya está registrado');
      }
      teacher.employeeNumber = employeeNumber;
    }

    if (specialties !== undefined) {
      teacher.specialties = specialties;
    }

    // Update user entity
    if (email && email !== teacher.user.email) {
      const existingUser = await this.usersRepository.findOne({ where: { email } });
      if (existingUser && existingUser.id !== teacher.user.id) {
        throw new ConflictException('El email ya está registrado');
      }
      teacher.user.email = email;
    }

    if (isActive !== undefined) {
      teacher.user.isActive = isActive;
    }

    // Handle password change if newPassword is provided
    if (newPassword) {
      teacher.user.password = newPassword;
    }

    // Update profile entity
    const profile = teacher.user.profile;
    if (firstName) profile.firstName = firstName;
    if (lastName) profile.lastName = lastName;
    if (dateOfBirth) profile.dateOfBirth = new Date(dateOfBirth);
    if (documentNumber) profile.documentNumber = documentNumber;
    if (phone) profile.phone = phone;
    if (address) profile.address = address;
    if (education) profile.education = education;
    if (hireDate) profile.hireDate = new Date(hireDate);
    if (department) profile.department = department;
    if (position) profile.position = position;

    // Save updates
    await this.profilesRepository.save(profile);
    await this.usersRepository.save(teacher.user);
    await this.teachersRepository.save(teacher);

    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const teacher = await this.findOne(id);
    
    // Soft delete by deactivating the user
    teacher.user.isActive = false;
    await this.usersRepository.save(teacher.user);
  }

  async getTeacherDashboard(userId: string): Promise<any> {
    // Find the teacher by user ID
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
      throw new NotFoundException('Profesor no encontrado');
    }

    // Build dashboard data
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
        totalStudents: teacher.tutoredClasses?.reduce((total, classGroup) => 
          total + (classGroup.students?.length || 0), 0
        ) || 0,
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
        // TODO: Add recent evaluations, attendance records, etc.
        lastLogin: teacher.user.lastLoginAt,
        updatedAt: teacher.updatedAt
      }
    };

    return dashboardData;
  }
}