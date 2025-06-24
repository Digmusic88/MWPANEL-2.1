import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from './entities/student.entity';
import { User, UserRole } from '../users/entities/user.entity';
import { UserProfile } from '../users/entities/user-profile.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student)
    private studentsRepository: Repository<Student>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(UserProfile)
    private userProfileRepository: Repository<UserProfile>,
  ) {}

  async findAll(): Promise<Student[]> {
    return this.studentsRepository.find({
      relations: ['user', 'user.profile', 'educationalLevel', 'course', 'classGroups'],
    });
  }

  async findOne(id: string): Promise<Student> {
    const student = await this.studentsRepository.findOne({
      where: { id },
      relations: ['user', 'user.profile', 'educationalLevel', 'course', 'classGroups'],
    });
    
    if (!student) {
      throw new NotFoundException('Estudiante no encontrado');
    }
    
    return student;
  }

  async findByUserId(userId: string): Promise<Student> {
    const student = await this.studentsRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user', 'user.profile', 'classGroup'],
    });
    
    if (!student) {
      throw new NotFoundException('Estudiante no encontrado');
    }
    
    return student;
  }

  async create(createStudentDto: any): Promise<Student> {
    const { email, password, firstName, lastName, phone, dni, enrollmentNumber, birthDate } = createStudentDto;

    // Check if email already exists
    const existingUser = await this.usersRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictException('El email ya está en uso');
    }

    // Check if enrollment number already exists
    const existingStudent = await this.studentsRepository.findOne({ where: { enrollmentNumber } });
    if (existingStudent) {
      throw new ConflictException('El número de matrícula ya está en uso');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = this.usersRepository.create({
      email,
      passwordHash: hashedPassword,
      role: UserRole.STUDENT,
      isActive: true,
    });
    const savedUser = await this.usersRepository.save(user);

    // Create user profile
    const profile = this.userProfileRepository.create({
      firstName,
      lastName,
      phone,
      dni,
      user: savedUser,
    });
    await this.userProfileRepository.save(profile);

    // Create student
    const student = this.studentsRepository.create({
      user: savedUser,
      enrollmentNumber,
      birthDate: birthDate ? new Date(birthDate) : new Date(),
    });

    return this.studentsRepository.save(student);
  }

  async update(id: string, updateStudentDto: any): Promise<Student> {
    const student = await this.findOne(id);
    
    const { email, firstName, lastName, phone, dni, enrollmentNumber, newPassword } = updateStudentDto;

    // Update user email if provided
    if (email && email !== student.user.email) {
      const existingUser = await this.usersRepository.findOne({ where: { email } });
      if (existingUser) {
        throw new ConflictException('El email ya está en uso');
      }
      student.user.email = email;
      await this.usersRepository.save(student.user);
    }

    // Handle password change if newPassword is provided
    if (newPassword) {
      student.user.password = newPassword;
      await this.usersRepository.save(student.user);
    }

    // Update profile
    if (firstName) student.user.profile.firstName = firstName;
    if (lastName) student.user.profile.lastName = lastName;
    if (phone !== undefined) student.user.profile.phone = phone;
    if (dni !== undefined) student.user.profile.dni = dni;
    await this.userProfileRepository.save(student.user.profile);

    // Update student data
    if (enrollmentNumber && enrollmentNumber !== student.enrollmentNumber) {
      const existingStudent = await this.studentsRepository.findOne({ where: { enrollmentNumber } });
      if (existingStudent && existingStudent.id !== id) {
        throw new ConflictException('El número de matrícula ya está en uso');
      }
      student.enrollmentNumber = enrollmentNumber;
    }

    return this.studentsRepository.save(student);
  }

  async changePassword(userId: string, changePasswordDto: any): Promise<{ message: string }> {
    const { currentPassword, newPassword } = changePasswordDto;
    
    // Find student by userId
    const student = await this.findByUserId(userId);
    
    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, student.user.passwordHash);
    if (!isCurrentPasswordValid) {
      throw new ConflictException('La contraseña actual es incorrecta');
    }
    
    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password
    student.user.passwordHash = hashedNewPassword;
    await this.usersRepository.save(student.user);
    
    return { message: 'Contraseña actualizada exitosamente' };
  }

  async remove(id: string): Promise<void> {
    const student = await this.findOne(id);
    
    // Soft delete by deactivating the user
    student.user.isActive = false;
    await this.usersRepository.save(student.user);
  }
}