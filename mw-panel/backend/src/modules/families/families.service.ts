import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Family, FamilyStudent } from '../users/entities/family.entity';
import { User, UserRole } from '../users/entities/user.entity';
import { UserProfile } from '../users/entities/user-profile.entity';
import { Student } from '../students/entities/student.entity';
import { CreateFamilyDto, FamilyContactDto } from './dto/create-family.dto';
import { UpdateFamilyDto, UpdateFamilyContactDto } from './dto/update-family.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class FamiliesService {
  constructor(
    @InjectRepository(Family)
    private familiesRepository: Repository<Family>,
    @InjectRepository(FamilyStudent)
    private familyStudentRepository: Repository<FamilyStudent>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(UserProfile)
    private profilesRepository: Repository<UserProfile>,
    @InjectRepository(Student)
    private studentsRepository: Repository<Student>,
    private dataSource: DataSource,
  ) {}

  async findAll(): Promise<Family[]> {
    const families = await this.familiesRepository.find({
      relations: [
        'primaryContact',
        'primaryContact.profile',
        'secondaryContact',
        'secondaryContact.profile',
      ],
      order: { createdAt: 'DESC' },
    });

    // Get students for each family
    const familiesWithStudents = await Promise.all(
      families.map(async (family) => {
        const familyStudents = await this.familyStudentRepository.find({
          where: { family: { id: family.id } },
          relations: ['student', 'student.user', 'student.user.profile'],
        });

        return {
          ...family,
          students: familyStudents,
        } as any;
      })
    );

    return familiesWithStudents;
  }

  async findOne(id: string): Promise<Family> {
    const family = await this.familiesRepository.findOne({
      where: { id },
      relations: [
        'primaryContact',
        'primaryContact.profile',
        'secondaryContact',
        'secondaryContact.profile',
      ],
    });

    if (!family) {
      throw new NotFoundException(`Familia con ID ${id} no encontrada`);
    }

    // Get family students with relationships
    const familyStudents = await this.familyStudentRepository.find({
      where: { family: { id } },
      relations: ['student', 'student.user', 'student.user.profile'],
    });

    return {
      ...family,
      students: familyStudents,
    } as any;
  }

  async create(createFamilyDto: CreateFamilyDto): Promise<Family> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { primaryContact, secondaryContact, students, notes } = createFamilyDto;

      // Validate that students exist
      for (const studentRelation of students) {
        const student = await this.studentsRepository.findOne({
          where: { id: studentRelation.studentId },
        });
        if (!student) {
          throw new BadRequestException(`Estudiante con ID ${studentRelation.studentId} no encontrado`);
        }
      }

      // Create primary contact user
      const primaryUser = await this.createFamilyUser(primaryContact, queryRunner);

      // Create secondary contact user if provided
      let secondaryUser: User | null = null;
      if (secondaryContact) {
        secondaryUser = await this.createFamilyUser(secondaryContact, queryRunner);
      }

      // Create family
      const family = queryRunner.manager.create(Family, {
        primaryContact: primaryUser,
        secondaryContact: secondaryUser,
      });
      const savedFamily = await queryRunner.manager.save(family);

      // Create family-student relationships
      for (const studentRelation of students) {
        const familyStudent = queryRunner.manager.create(FamilyStudent, {
          family: savedFamily,
          student: { id: studentRelation.studentId } as Student,
          relationship: studentRelation.relationship,
        });
        await queryRunner.manager.save(familyStudent);
      }

      await queryRunner.commitTransaction();

      // Return family with all relations
      return this.findOne(savedFamily.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      
      if (error.code === '23505') { // PostgreSQL unique violation
        if (error.detail?.includes('email')) {
          throw new ConflictException('El email ya está registrado');
        }
      }
      
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async update(id: string, updateFamilyDto: UpdateFamilyDto): Promise<Family> {
    const family = await this.findOne(id);
    
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { primaryContact, secondaryContact, students } = updateFamilyDto;

      // Update primary contact if provided
      if (primaryContact) {
        await this.updateFamilyUser(family.primaryContact.id, primaryContact, queryRunner);
      }

      // Update secondary contact if provided
      if (secondaryContact) {
        if (family.secondaryContact) {
          await this.updateFamilyUser(family.secondaryContact.id, secondaryContact, queryRunner);
        } else {
          // Create new secondary contact - convert to FamilyContactDto
          if (!secondaryContact.email || !secondaryContact.password || !secondaryContact.firstName || !secondaryContact.lastName || !secondaryContact.phone) {
            throw new BadRequestException('Para crear un nuevo contacto secundario, email, password, firstName, lastName y phone son requeridos');
          }
          
          const newContactDto: FamilyContactDto = {
            email: secondaryContact.email,
            password: secondaryContact.password,
            firstName: secondaryContact.firstName,
            lastName: secondaryContact.lastName,
            phone: secondaryContact.phone,
            dateOfBirth: secondaryContact.dateOfBirth,
            documentNumber: secondaryContact.documentNumber,
            address: secondaryContact.address,
            occupation: secondaryContact.occupation,
          };
          
          const newSecondaryUser = await this.createFamilyUser(newContactDto, queryRunner);
          family.secondaryContact = newSecondaryUser;
          await queryRunner.manager.save(family);
        }
      }

      // Update student relationships if provided
      if (students) {
        // Remove existing relationships
        await queryRunner.manager.delete(FamilyStudent, { family: { id } });

        // Create new relationships
        for (const studentRelation of students) {
          const student = await this.studentsRepository.findOne({
            where: { id: studentRelation.studentId },
          });
          if (!student) {
            throw new BadRequestException(`Estudiante con ID ${studentRelation.studentId} no encontrado`);
          }

          const familyStudent = queryRunner.manager.create(FamilyStudent, {
            family: { id } as Family,
            student: { id: studentRelation.studentId } as Student,
            relationship: studentRelation.relationship,
          });
          await queryRunner.manager.save(familyStudent);
        }
      }

      await queryRunner.commitTransaction();

      return this.findOne(id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      
      if (error.code === '23505') {
        if (error.detail?.includes('email')) {
          throw new ConflictException('El email ya está registrado');
        }
      }
      
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: string): Promise<void> {
    const family = await this.findOne(id);

    // Soft delete by deactivating users
    family.primaryContact.isActive = false;
    await this.usersRepository.save(family.primaryContact);

    if (family.secondaryContact) {
      family.secondaryContact.isActive = false;
      await this.usersRepository.save(family.secondaryContact);
    }
  }

  // Get students available for family assignment
  async getAvailableStudents(): Promise<Student[]> {
    return this.studentsRepository.find({
      relations: ['user', 'user.profile'],
      where: { user: { isActive: true } },
      order: { createdAt: 'DESC' },
    });
  }

  // Get family dashboard data for logged in family user
  async getFamilyDashboard(userId: string) {
    // Find the family where this user is either primary or secondary contact
    const family = await this.familiesRepository.findOne({
      where: [
        { primaryContact: { id: userId } },
        { secondaryContact: { id: userId } }
      ],
      relations: [
        'primaryContact',
        'primaryContact.profile',
        'secondaryContact',
        'secondaryContact.profile',
      ],
    });

    if (!family) {
      throw new NotFoundException('Familia no encontrada para este usuario');
    }

    // Get family students with their relationships and detailed info
    const familyStudents = await this.familyStudentRepository.find({
      where: { family: { id: family.id } },
      relations: [
        'student', 
        'student.user', 
        'student.user.profile',
        'student.educationalLevel',
        'student.course',
        'student.classGroups',
        'student.evaluations',
        'student.evaluations.competencyEvaluations'
      ],
    });

    // Process student data for dashboard
    const studentsData = await Promise.all(
      familyStudents.map(async (familyStudent) => {
        const student = familyStudent.student;
        
        // Calculate basic stats
        const totalEvaluations = student.evaluations?.length || 0;
        const completedEvaluations = student.evaluations?.filter(e => e.competencyEvaluations?.length > 0).length || 0;
        const pendingEvaluations = totalEvaluations - completedEvaluations;
        
        // Calculate average grade from competency evaluations
        let totalGrades = 0;
        let gradeCount = 0;
        
        student.evaluations?.forEach(evaluation => {
          evaluation.competencyEvaluations?.forEach(compEval => {
            if (compEval.score !== null && compEval.score !== undefined) {
              // Convert 1-5 scale to 0-10 scale for display
              totalGrades += (compEval.score * 2);
              gradeCount++;
            }
          });
        });
        
        const averageGrade = gradeCount > 0 ? totalGrades / gradeCount : 0;
        
        // Get recent evaluations (last 5)
        const recentEvaluations = student.evaluations
          ?.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5)
          .map(evaluation => ({
            id: evaluation.id,
            period: evaluation.period,
            createdAt: evaluation.createdAt,
            competencyEvaluations: evaluation.competencyEvaluations?.map(compEval => ({
              competencyName: compEval.competency?.name || 'Competencia',
              score: compEval.score,
              displayGrade: compEval.score ? (compEval.score * 2).toFixed(1) : null, // Convert 1-5 to 0-10 scale
              observations: compEval.observations,
            })) || []
          })) || [];

        return {
          id: student.id,
          enrollmentNumber: student.enrollmentNumber,
          relationship: familyStudent.relationship,
          user: {
            profile: {
              firstName: student.user.profile.firstName,
              lastName: student.user.profile.lastName,
            }
          },
          educationalLevel: student.educationalLevel,
          course: student.course,
          classGroups: student.classGroups || [],
          stats: {
            totalEvaluations,
            completedEvaluations,
            pendingEvaluations,
            averageGrade: Math.round(averageGrade * 10) / 10,
            attendance: 95 // Mock data - would need to implement attendance tracking
          },
          recentEvaluations
        };
      })
    );

    // Return comprehensive family dashboard data
    return {
      family: {
        id: family.id,
        primaryContact: {
          id: family.primaryContact.id,
          profile: {
            firstName: family.primaryContact.profile.firstName,
            lastName: family.primaryContact.profile.lastName,
          }
        },
        secondaryContact: family.secondaryContact ? {
          id: family.secondaryContact.id,
          profile: {
            firstName: family.secondaryContact.profile.firstName,
            lastName: family.secondaryContact.profile.lastName,
          }
        } : null,
      },
      students: studentsData,
      summary: {
        totalStudents: studentsData.length,
        averageGrade: studentsData.length > 0 
          ? Math.round((studentsData.reduce((sum, s) => sum + s.stats.averageGrade, 0) / studentsData.length) * 10) / 10
          : 0,
        totalPendingEvaluations: studentsData.reduce((sum, s) => sum + s.stats.pendingEvaluations, 0),
        totalCompletedEvaluations: studentsData.reduce((sum, s) => sum + s.stats.completedEvaluations, 0),
      }
    };
  }

  // Get simplified children data for activities page
  async getMyChildren(userId: string) {
    // Find the family where this user is either primary or secondary contact
    const family = await this.familiesRepository.findOne({
      where: [
        { primaryContact: { id: userId } },
        { secondaryContact: { id: userId } }
      ]
    });

    if (!family) {
      throw new NotFoundException('Familia no encontrada para este usuario');
    }

    // Get family students with basic info needed for activities
    const familyStudents = await this.familyStudentRepository.find({
      where: { family: { id: family.id } },
      relations: [
        'student', 
        'student.user', 
        'student.user.profile',
        'student.classGroups',
        'student.classGroups.courses',
        'student.educationalLevel'
      ],
    });

    // Return student data with expected structure for frontend
    return familyStudents.map(familyStudent => ({
      id: familyStudent.student.id,
      enrollmentNumber: familyStudent.student.enrollmentNumber,
      user: {
        profile: {
          firstName: familyStudent.student.user.profile.firstName,
          lastName: familyStudent.student.user.profile.lastName,
        }
      },
      relationship: familyStudent.relationship,
      educationalLevel: familyStudent.student.educationalLevel?.name || 'No asignado',
      classGroups: familyStudent.student.classGroups?.map(cg => ({
        id: cg.id,
        name: cg.name,
        courses: cg.courses?.map(course => course.name) || []
      })) || []
    }));
  }

  private async createFamilyUser(contactDto: FamilyContactDto, queryRunner: any): Promise<User> {
    const { email, password, firstName, lastName, dateOfBirth, documentNumber, phone, address, occupation } = contactDto;

    // Check if email already exists
    const existingUser = await this.usersRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictException(`El email ${email} ya está registrado`);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = queryRunner.manager.create(User, {
      email,
      passwordHash: hashedPassword,
      role: UserRole.FAMILY,
      isActive: true,
    });
    const savedUser = await queryRunner.manager.save(user);

    // Create profile
    const profile = queryRunner.manager.create(UserProfile, {
      firstName,
      lastName,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      documentNumber,
      phone,
      address,
      // Store occupation in a suitable field - we can use education field for this
      education: occupation,
    });
    const savedProfile = await queryRunner.manager.save(profile);

    // Link profile to user
    savedUser.profile = savedProfile;
    await queryRunner.manager.save(savedUser);

    return savedUser;
  }

  private async updateFamilyUser(userId: string, contactDto: UpdateFamilyContactDto, queryRunner: any): Promise<void> {
    const { email, password, newPassword, firstName, lastName, dateOfBirth, documentNumber, phone, address, occupation } = contactDto;

    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['profile'],
    });

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);
    }

    let userUpdated = false;

    // Update user email if changed
    if (email && email !== user.email) {
      const existingUser = await this.usersRepository.findOne({ where: { email } });
      if (existingUser && existingUser.id !== userId) {
        throw new ConflictException(`El email ${email} ya está registrado`);
      }
      user.email = email;
      userUpdated = true;
    }

    // Update password if provided (legacy field for backward compatibility)
    if (password && password.trim() !== '') {
      const bcrypt = require('bcrypt');
      user.passwordHash = await bcrypt.hash(password, 10);
      userUpdated = true;
    }

    // Handle password change if newPassword is provided (preferred method)
    if (newPassword && newPassword.trim() !== '') {
      const bcrypt = require('bcrypt');
      user.passwordHash = await bcrypt.hash(newPassword, 10);
      userUpdated = true;
    }

    if (userUpdated) {
      // Use queryRunner manager to maintain transaction consistency
      await queryRunner.manager.save(user);
    }

    // Update profile
    const profile = user.profile;
    let profileUpdated = false;

    if (firstName !== undefined) {
      profile.firstName = firstName;
      profileUpdated = true;
    }
    if (lastName !== undefined) {
      profile.lastName = lastName;
      profileUpdated = true;
    }
    if (dateOfBirth !== undefined) {
      profile.dateOfBirth = dateOfBirth ? new Date(dateOfBirth) : null;
      profileUpdated = true;
    }
    if (documentNumber !== undefined) {
      profile.documentNumber = documentNumber;
      profileUpdated = true;
    }
    if (phone !== undefined) {
      profile.phone = phone;
      profileUpdated = true;
    }
    if (address !== undefined) {
      profile.address = address;
      profileUpdated = true;
    }
    if (occupation !== undefined) {
      profile.education = occupation; // Using education field for occupation
      profileUpdated = true;
    }

    if (profileUpdated) {
      await queryRunner.manager.save(profile);
    }
  }
}