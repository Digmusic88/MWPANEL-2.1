import { Injectable, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { User, UserRole } from '../users/entities/user.entity';
import { UserProfile } from '../users/entities/user-profile.entity';
import { Student } from '../students/entities/student.entity';
import { EducationalLevel } from '../students/entities/educational-level.entity';
import { Course } from '../students/entities/course.entity';
import { Family, FamilyStudent } from '../users/entities/family.entity';
import { EnrollmentNumberService } from '../students/services/enrollment-number.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class EnrollmentService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(UserProfile)
    private profilesRepository: Repository<UserProfile>,
    @InjectRepository(Student)
    private studentsRepository: Repository<Student>,
    @InjectRepository(Family)
    private familiesRepository: Repository<Family>,
    @InjectRepository(FamilyStudent)
    private familyStudentRepository: Repository<FamilyStudent>,
    private dataSource: DataSource,
    private enrollmentNumberService: EnrollmentNumberService,
  ) {}

  async processEnrollment(createEnrollmentDto: CreateEnrollmentDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Create student user and profile
      const studentUser = await this.createStudentUser(createEnrollmentDto.student, queryRunner);
      
      // 2. Create student record
      const student = await this.createStudentRecord(createEnrollmentDto.student, studentUser, queryRunner);
      
      // 3. Handle family creation or assignment
      let family: Family;
      if (createEnrollmentDto.family.existingFamilyId) {
        // Assign to existing family
        family = await queryRunner.manager.findOne(Family, {
          where: { id: createEnrollmentDto.family.existingFamilyId },
          relations: ['primaryContact', 'secondaryContact']
        });
        
        if (!family) {
          throw new BadRequestException('Familia no encontrada');
        }
      } else {
        // Create new family
        family = await this.createNewFamily(createEnrollmentDto.family, queryRunner);
      }
      
      // 4. Link student to family
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
      
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async createStudentUser(studentData: any, queryRunner: any): Promise<User> {
    // Check if email already exists
    const existingUser = await queryRunner.manager.findOne(User, {
      where: { email: studentData.email }
    });
    
    if (existingUser) {
      throw new ConflictException(`El email ${studentData.email} ya está registrado`);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(studentData.password, 10);

    // Create user
    const user = queryRunner.manager.create(User, {
      email: studentData.email,
      passwordHash: hashedPassword,
      role: UserRole.STUDENT,
      isActive: true,
    });
    
    const savedUser = await queryRunner.manager.save(user);

    // Create profile
    const profile = queryRunner.manager.create(UserProfile, {
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

  private async createStudentRecord(studentData: any, user: User, queryRunner: any): Promise<Student> {
    // Generate enrollment number automatically or use provided one
    let enrollmentNumber: string;
    
    if (studentData.enrollmentNumber && studentData.enrollmentNumber.trim() !== '') {
      // Validate format if provided manually
      if (!this.enrollmentNumberService.validateEnrollmentFormat(studentData.enrollmentNumber)) {
        throw new BadRequestException(`Formato de número de matrícula inválido: ${studentData.enrollmentNumber}`);
      }
      
      // Check if manual enrollment number already exists
      const existingStudent = await queryRunner.manager.findOne(Student, {
        where: { enrollmentNumber: studentData.enrollmentNumber }
      });
      
      if (existingStudent) {
        throw new ConflictException(`El número de matrícula ${studentData.enrollmentNumber} ya está registrado`);
      }
      
      enrollmentNumber = studentData.enrollmentNumber;
    } else {
      // Generate automatically
      enrollmentNumber = await this.enrollmentNumberService.generateUniqueEnrollmentNumber();
    }

    // Find educational level entity if provided
    let educationalLevel = null;
    if (studentData.educationalLevelId) {
      educationalLevel = await queryRunner.manager.findOne(EducationalLevel, {
        where: { id: studentData.educationalLevelId }
      });
    }

    // Find course entity if provided
    let course = null;
    if (studentData.courseId) {
      course = await queryRunner.manager.findOne(Course, {
        where: { id: studentData.courseId }
      });
    }

    const student = queryRunner.manager.create(Student, {
      user,
      enrollmentNumber,
      birthDate: studentData.birthDate ? new Date(studentData.birthDate) : new Date(),
      educationalLevel,
      course,
    });
    
    return await queryRunner.manager.save(student);
  }

  private async createNewFamily(familyData: any, queryRunner: any): Promise<Family> {
    // Create primary contact
    const primaryUser = await this.createFamilyContact(familyData.primaryContact, queryRunner);
    
    // Create secondary contact if provided
    let secondaryUser = null;
    if (familyData.secondaryContact) {
      secondaryUser = await this.createFamilyContact(familyData.secondaryContact, queryRunner);
    }
    
    // Create family
    const family = queryRunner.manager.create(Family, {
      primaryContact: primaryUser,
      secondaryContact: secondaryUser,
    });
    
    return await queryRunner.manager.save(family);
  }

  private async createFamilyContact(contactData: any, queryRunner: any): Promise<User> {
    // Check if email already exists
    const existingUser = await queryRunner.manager.findOne(User, {
      where: { email: contactData.email }
    });
    
    if (existingUser) {
      throw new ConflictException(`El email ${contactData.email} ya está registrado`);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(contactData.password, 10);

    // Create user
    const user = queryRunner.manager.create(User, {
      email: contactData.email,
      passwordHash: hashedPassword,
      role: UserRole.FAMILY,
      isActive: true,
    });
    
    const savedUser = await queryRunner.manager.save(user);

    // Create profile
    const profile = queryRunner.manager.create(UserProfile, {
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

  private async linkStudentToFamily(student: Student, family: Family, relationship: string, queryRunner: any): Promise<void> {
    const familyStudent = queryRunner.manager.create(FamilyStudent, {
      family,
      student,
      relationship,
    });
    
    await queryRunner.manager.save(familyStudent);
  }
}