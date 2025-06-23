import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Subject } from '../students/entities/subject.entity';
import { SubjectAssignment } from '../students/entities/subject-assignment.entity';
import { Teacher } from '../teachers/entities/teacher.entity';
import { ClassGroup } from '../students/entities/class-group.entity';
import { Course } from '../students/entities/course.entity';
import { AcademicYear } from '../students/entities/academic-year.entity';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
import { CreateSubjectAssignmentDto } from './dto/create-subject-assignment.dto';
import { UpdateSubjectAssignmentDto } from './dto/update-subject-assignment.dto';

@Injectable()
export class SubjectsService {
  constructor(
    @InjectRepository(Subject)
    private readonly subjectRepository: Repository<Subject>,
    @InjectRepository(SubjectAssignment)
    private readonly assignmentRepository: Repository<SubjectAssignment>,
    @InjectRepository(Teacher)
    private readonly teacherRepository: Repository<Teacher>,
    @InjectRepository(ClassGroup)
    private readonly classGroupRepository: Repository<ClassGroup>,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    @InjectRepository(AcademicYear)
    private readonly academicYearRepository: Repository<AcademicYear>,
  ) {}

  // ==================== SUBJECTS ====================

  async findAllSubjects(): Promise<Subject[]> {
    return this.subjectRepository.find({
      relations: ['course', 'course.cycle', 'course.cycle.educationalLevel'],
      order: {
        course: { order: 'ASC' },
        name: 'ASC',
      },
    });
  }

  async findOneSubject(id: string): Promise<Subject> {
    const subject = await this.subjectRepository.findOne({
      where: { id },
      relations: ['course', 'course.cycle', 'course.cycle.educationalLevel'],
    });

    if (!subject) {
      throw new NotFoundException(`Asignatura con ID ${id} no encontrada`);
    }

    return subject;
  }

  async createSubject(createSubjectDto: CreateSubjectDto): Promise<Subject> {
    const { courseId, ...subjectData } = createSubjectDto;

    // Verificar que el curso existe
    const course = await this.courseRepository.findOne({
      where: { id: courseId },
      relations: ['cycle', 'cycle.educationalLevel'],
    });
    if (!course) {
      throw new NotFoundException(`Curso con ID ${courseId} no encontrado`);
    }

    // Verificar que no existe otra asignatura con el mismo código
    const existingSubject = await this.subjectRepository.findOne({
      where: { code: subjectData.code },
    });
    if (existingSubject) {
      throw new ConflictException(
        `Ya existe una asignatura con el código "${subjectData.code}"`,
      );
    }

    // Crear la asignatura
    const subject = this.subjectRepository.create({
      ...subjectData,
      course,
    });

    return this.subjectRepository.save(subject);
  }

  async updateSubject(id: string, updateSubjectDto: UpdateSubjectDto): Promise<Subject> {
    const subject = await this.findOneSubject(id);
    const { courseId, ...updateData } = updateSubjectDto;

    // Actualizar curso si se proporciona
    if (courseId) {
      const course = await this.courseRepository.findOne({
        where: { id: courseId },
        relations: ['cycle', 'cycle.educationalLevel'],
      });
      if (!course) {
        throw new NotFoundException(`Curso con ID ${courseId} no encontrado`);
      }
      subject.course = course;
    }

    // Verificar código único si se está actualizando
    if (updateData.code && updateData.code !== subject.code) {
      const existingSubject = await this.subjectRepository.findOne({
        where: { code: updateData.code },
      });
      if (existingSubject) {
        throw new ConflictException(
          `Ya existe una asignatura con el código "${updateData.code}"`,
        );
      }
    }

    // Aplicar actualizaciones
    Object.assign(subject, updateData);

    return this.subjectRepository.save(subject);
  }

  async removeSubject(id: string): Promise<void> {
    const subject = await this.findOneSubject(id);
    
    // Verificar si hay asignaciones activas
    const activeAssignments = await this.assignmentRepository.count({
      where: { subject: { id } },
    });
    
    if (activeAssignments > 0) {
      throw new BadRequestException(
        `No se puede eliminar la asignatura porque tiene ${activeAssignments} asignaciones activas`,
      );
    }

    await this.subjectRepository.remove(subject);
  }

  async findSubjectsByCourse(courseId: string): Promise<Subject[]> {
    return this.subjectRepository.find({
      where: { course: { id: courseId } },
      relations: ['course'],
      order: { name: 'ASC' },
    });
  }

  // ==================== SUBJECT ASSIGNMENTS ====================

  async findAllAssignments(): Promise<SubjectAssignment[]> {
    return this.assignmentRepository.find({
      relations: [
        'teacher',
        'teacher.user',
        'teacher.user.profile',
        'subject',
        'subject.course',
        'classGroup',
        'classGroup.courses',
        'academicYear',
      ],
      order: {
        academicYear: { startDate: 'DESC' },
        classGroup: { name: 'ASC' },
        subject: { name: 'ASC' },
      },
    });
  }

  async findOneAssignment(id: string): Promise<SubjectAssignment> {
    const assignment = await this.assignmentRepository.findOne({
      where: { id },
      relations: [
        'teacher',
        'teacher.user',
        'teacher.user.profile',
        'subject',
        'subject.course',
        'classGroup',
        'classGroup.courses',
        'academicYear',
      ],
    });

    if (!assignment) {
      throw new NotFoundException(`Asignación con ID ${id} no encontrada`);
    }

    return assignment;
  }

  async createAssignment(createAssignmentDto: CreateSubjectAssignmentDto): Promise<SubjectAssignment> {
    const { teacherId, subjectId, classGroupId, academicYearId, ...assignmentData } = createAssignmentDto;

    // Verificar que el profesor existe
    const teacher = await this.teacherRepository.findOne({
      where: { id: teacherId },
      relations: ['user', 'user.profile'],
    });
    if (!teacher) {
      throw new NotFoundException(`Profesor con ID ${teacherId} no encontrado`);
    }

    // Verificar que la asignatura existe
    const subject = await this.subjectRepository.findOne({
      where: { id: subjectId },
      relations: ['course'],
    });
    if (!subject) {
      throw new NotFoundException(`Asignatura con ID ${subjectId} no encontrada`);
    }

    // Verificar que el grupo de clase existe
    const classGroup = await this.classGroupRepository.findOne({
      where: { id: classGroupId },
      relations: ['courses'],
    });
    if (!classGroup) {
      throw new NotFoundException(`Grupo de clase con ID ${classGroupId} no encontrado`);
    }

    // Verificar que el año académico existe
    const academicYear = await this.academicYearRepository.findOne({
      where: { id: academicYearId },
    });
    if (!academicYear) {
      throw new NotFoundException(`Año académico con ID ${academicYearId} no encontrado`);
    }

    // Verificar que no existe ya una asignación igual
    const existingAssignment = await this.assignmentRepository.findOne({
      where: {
        teacher: { id: teacherId },
        subject: { id: subjectId },
        classGroup: { id: classGroupId },
        academicYear: { id: academicYearId },
      },
    });
    if (existingAssignment) {
      throw new ConflictException(
        `Ya existe una asignación para este profesor, asignatura y grupo en el año académico especificado`,
      );
    }

    // Crear la asignación
    const assignment = this.assignmentRepository.create({
      ...assignmentData,
      teacher,
      subject,
      classGroup,
      academicYear,
    });

    return this.assignmentRepository.save(assignment);
  }

  async updateAssignment(id: string, updateAssignmentDto: UpdateSubjectAssignmentDto): Promise<SubjectAssignment> {
    const assignment = await this.findOneAssignment(id);
    const { teacherId, subjectId, classGroupId, academicYearId, ...updateData } = updateAssignmentDto;

    // Actualizar profesor si se proporciona
    if (teacherId) {
      const teacher = await this.teacherRepository.findOne({
        where: { id: teacherId },
        relations: ['user', 'user.profile'],
      });
      if (!teacher) {
        throw new NotFoundException(`Profesor con ID ${teacherId} no encontrado`);
      }
      assignment.teacher = teacher;
    }

    // Actualizar asignatura si se proporciona
    if (subjectId) {
      const subject = await this.subjectRepository.findOne({
        where: { id: subjectId },
        relations: ['course'],
      });
      if (!subject) {
        throw new NotFoundException(`Asignatura con ID ${subjectId} no encontrada`);
      }
      assignment.subject = subject;
    }

    // Actualizar grupo si se proporciona
    if (classGroupId) {
      const classGroup = await this.classGroupRepository.findOne({
        where: { id: classGroupId },
        relations: ['courses'],
      });
      if (!classGroup) {
        throw new NotFoundException(`Grupo de clase con ID ${classGroupId} no encontrado`);
      }
      assignment.classGroup = classGroup;
    }

    // Actualizar año académico si se proporciona
    if (academicYearId) {
      const academicYear = await this.academicYearRepository.findOne({
        where: { id: academicYearId },
      });
      if (!academicYear) {
        throw new NotFoundException(`Año académico con ID ${academicYearId} no encontrado`);
      }
      assignment.academicYear = academicYear;
    }

    // Aplicar otras actualizaciones
    Object.assign(assignment, updateData);

    return this.assignmentRepository.save(assignment);
  }

  async removeAssignment(id: string): Promise<void> {
    const assignment = await this.findOneAssignment(id);
    await this.assignmentRepository.remove(assignment);
  }

  async findAssignmentsByTeacher(teacherId: string): Promise<SubjectAssignment[]> {
    return this.assignmentRepository.find({
      where: { teacher: { id: teacherId } },
      relations: [
        'subject',
        'subject.course',
        'classGroup',
        'classGroup.courses',
        'classGroup.students',
        'academicYear',
      ],
      order: {
        academicYear: { startDate: 'DESC' },
        classGroup: { name: 'ASC' },
        subject: { name: 'ASC' },
      },
    });
  }

  async findAssignmentsByClassGroup(classGroupId: string): Promise<SubjectAssignment[]> {
    return this.assignmentRepository.find({
      where: { classGroup: { id: classGroupId } },
      relations: [
        'teacher',
        'teacher.user',
        'teacher.user.profile',
        'subject',
        'academicYear',
      ],
      order: { subject: { name: 'ASC' } },
    });
  }

  async findAssignmentsByAcademicYear(academicYearId: string): Promise<SubjectAssignment[]> {
    return this.assignmentRepository.find({
      where: { academicYear: { id: academicYearId } },
      relations: [
        'teacher',
        'teacher.user',
        'teacher.user.profile',
        'subject',
        'classGroup',
        'classGroup.courses',
      ],
      order: {
        classGroup: { name: 'ASC' },
        subject: { name: 'ASC' },
      },
    });
  }

  // === METHODS FOR EVALUATIONS INTEGRATION ===

  /**
   * Get subjects available for a specific student based on their class group
   */
  async findSubjectsByStudent(studentId: string): Promise<Subject[]> {
    // First, find the student's class groups
    const classGroups = await this.classGroupRepository.find({
      where: { students: { id: studentId } },
      relations: ['course']
    });

    if (classGroups.length === 0) {
      return [];
    }

    // Get subjects from assignments for those class groups
    const assignments = await this.assignmentRepository.find({
      where: { classGroup: { id: In(classGroups.map(group => group.id)) } },
      relations: ['subject', 'subject.course']
    });

    // Extract unique subjects
    const subjects = Array.from(
      new Map(assignments.map(assignment => [assignment.subject.id, assignment.subject])).values()
    );

    return subjects;
  }

  /**
   * Get subjects that a teacher teaches to a specific class group
   */
  async findSubjectsByTeacherAndGroup(teacherId: string, classGroupId: string): Promise<Subject[]> {
    const assignments = await this.assignmentRepository.find({
      where: {
        teacher: { id: teacherId },
        classGroup: { id: classGroupId }
      },
      relations: ['subject', 'subject.course']
    });

    return assignments.map(assignment => assignment.subject);
  }

  /**
   * Get subjects that a teacher can evaluate (all subjects they teach)
   */
  async findSubjectsByTeacher(teacherId: string): Promise<Subject[]> {
    const assignments = await this.assignmentRepository.find({
      where: { teacher: { id: teacherId } },
      relations: ['subject', 'subject.course', 'classGroup']
    });

    // Extract unique subjects
    const subjects = Array.from(
      new Map(assignments.map(assignment => [assignment.subject.id, assignment.subject])).values()
    );

    return subjects;
  }

  /**
   * Get detailed assignment information for evaluations
   */
  async findAssignmentDetails(teacherId: string, subjectId: string, classGroupId: string): Promise<SubjectAssignment | null> {
    return this.assignmentRepository.findOne({
      where: {
        teacher: { id: teacherId },
        subject: { id: subjectId },
        classGroup: { id: classGroupId }
      },
      relations: [
        'teacher',
        'teacher.user',
        'teacher.user.profile',
        'subject',
        'subject.course',
        'classGroup',
        'classGroup.course',
        'academicYear'
      ]
    });
  }

  /**
   * Get statistics for subjects system
   */
  async getSubjectStatistics() {
    const [
      totalSubjects,
      totalAssignments,
      subjectsWithoutAssignments,
      teachersWithAssignments
    ] = await Promise.all([
      this.subjectRepository.count(),
      this.assignmentRepository.count(),
      this.subjectRepository
        .createQueryBuilder('subject')
        .leftJoin('subject_assignments', 'assignment', 'assignment.subjectId = subject.id')
        .where('assignment.id IS NULL')
        .getCount(),
      this.assignmentRepository
        .createQueryBuilder('assignment')
        .select('COUNT(DISTINCT assignment.teacherId)', 'count')
        .getRawOne()
    ]);

    return {
      totalSubjects,
      totalAssignments,
      subjectsWithoutAssignments,
      teachersWithAssignments: parseInt(teachersWithAssignments?.count || '0'),
      assignmentsPerSubject: totalSubjects > 0 ? (totalAssignments / totalSubjects).toFixed(2) : '0'
    };
  }

  /**
   * Check if a teacher can evaluate a specific subject for a specific student
   */
  async canTeacherEvaluateSubject(teacherId: string, subjectId: string, studentId: string): Promise<boolean> {
    // Get student's class groups
    const studentGroups = await this.classGroupRepository.find({
      where: { students: { id: studentId } },
      select: ['id']
    });

    if (studentGroups.length === 0) {
      return false;
    }

    // Check if teacher has assignment for this subject in any of student's groups
    const assignment = await this.assignmentRepository.findOne({
      where: {
        teacher: { id: teacherId },
        subject: { id: subjectId },
        classGroup: { id: In(studentGroups.map(group => group.id)) }
      }
    });

    return !!assignment;
  }
}