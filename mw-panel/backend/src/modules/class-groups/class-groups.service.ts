import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { ClassGroup } from '../students/entities/class-group.entity';
import { Student } from '../students/entities/student.entity';
import { Teacher } from '../teachers/entities/teacher.entity';
import { Course } from '../students/entities/course.entity';
import { AcademicYear } from '../students/entities/academic-year.entity';
import { CreateClassGroupDto } from './dto/create-class-group.dto';
import { UpdateClassGroupDto } from './dto/update-class-group.dto';
import { AssignStudentsDto } from './dto/assign-students.dto';

@Injectable()
export class ClassGroupsService {
  constructor(
    @InjectRepository(ClassGroup)
    private readonly classGroupRepository: Repository<ClassGroup>,
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    @InjectRepository(Teacher)
    private readonly teacherRepository: Repository<Teacher>,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    @InjectRepository(AcademicYear)
    private readonly academicYearRepository: Repository<AcademicYear>,
  ) {}

  async findAll(): Promise<ClassGroup[]> {
    return this.classGroupRepository.find({
      relations: [
        'academicYear',
        'courses',
        'courses.cycle',
        'courses.cycle.educationalLevel',
        'tutor',
        'tutor.user',
        'tutor.user.profile',
        'students',
        'students.user',
        'students.user.profile',
      ],
      order: {
        academicYear: { startDate: 'DESC' },
        section: 'ASC',
      },
    });
  }

  async findOne(id: string): Promise<ClassGroup> {
    const classGroup = await this.classGroupRepository.findOne({
      where: { id },
      relations: [
        'academicYear',
        'courses',
        'courses.cycle',
        'courses.cycle.educationalLevel',
        'tutor',
        'tutor.user',
        'tutor.user.profile',
        'students',
        'students.user',
        'students.user.profile',
      ],
    });

    if (!classGroup) {
      throw new NotFoundException(`Grupo de clase con ID ${id} no encontrado`);
    }

    return classGroup;
  }

  async findByAcademicYear(academicYearId: string): Promise<ClassGroup[]> {
    return this.classGroupRepository.find({
      where: { academicYear: { id: academicYearId } },
      relations: [
        'academicYear',
        'courses',
        'courses.cycle',
        'courses.cycle.educationalLevel',
        'tutor',
        'tutor.user',
        'tutor.user.profile',
        'students',
      ],
      order: {
        section: 'ASC',
      },
    });
  }

  async findByCourse(courseId: string): Promise<ClassGroup[]> {
    return this.classGroupRepository.find({
      where: { courses: { id: courseId } },
      relations: [
        'academicYear',
        'courses',
        'tutor',
        'tutor.user',
        'tutor.user.profile',
        'students',
      ],
      order: {
        academicYear: { startDate: 'DESC' },
        section: 'ASC',
      },
    });
  }

  async findByTutor(tutorId: string): Promise<ClassGroup[]> {
    return this.classGroupRepository.find({
      where: { tutor: { id: tutorId } },
      relations: [
        'academicYear',
        'courses',
        'courses.cycle',
        'courses.cycle.educationalLevel',
        'students',
        'students.user',
        'students.user.profile',
      ],
      order: {
        academicYear: { startDate: 'DESC' },
      },
    });
  }

  async create(createClassGroupDto: CreateClassGroupDto): Promise<ClassGroup> {
    const { academicYearId, courseIds, tutorId, studentIds, ...classGroupData } = createClassGroupDto;

    // Verificar que el año académico existe
    const academicYear = await this.academicYearRepository.findOne({
      where: { id: academicYearId },
    });
    if (!academicYear) {
      throw new NotFoundException(`Año académico con ID ${academicYearId} no encontrado`);
    }

    // Verificar que los cursos existen
    const courses = await this.courseRepository.find({
      where: { id: In(courseIds) },
      relations: ['cycle', 'cycle.educationalLevel'],
    });
    if (courses.length !== courseIds.length) {
      throw new NotFoundException(`Uno o más cursos no fueron encontrados`);
    }

    // Verificar si ya existe un grupo con el mismo nombre en el mismo año académico
    const existingClassGroup = await this.classGroupRepository.findOne({
      where: {
        name: classGroupData.name,
        academicYear: { id: academicYearId },
      },
    });
    if (existingClassGroup) {
      throw new ConflictException(
        `Ya existe un grupo de clase con el nombre "${classGroupData.name}" en el año académico ${academicYear.name}`,
      );
    }

    // Verificar que el tutor existe (si se proporciona)
    let tutor: Teacher | undefined;
    if (tutorId) {
      tutor = await this.teacherRepository.findOne({
        where: { id: tutorId },
        relations: ['user', 'user.profile'],
      });
      if (!tutor) {
        throw new NotFoundException(`Profesor con ID ${tutorId} no encontrado`);
      }
    }

    // Verificar que los estudiantes existen (si se proporcionan)
    let students: Student[] = [];
    if (studentIds && studentIds.length > 0) {
      students = await this.studentRepository.find({
        where: { id: In(studentIds) },
        relations: ['user', 'user.profile'],
      });
      if (students.length !== studentIds.length) {
        const foundIds = students.map(s => s.id);
        const missingIds = studentIds.filter(id => !foundIds.includes(id));
        throw new NotFoundException(
          `Estudiantes con IDs ${missingIds.join(', ')} no encontrados`,
        );
      }
    }

    // Crear el grupo de clase
    const classGroup = this.classGroupRepository.create({
      ...classGroupData,
      academicYear,
      courses,
      tutor,
      students,
    });

    return this.classGroupRepository.save(classGroup);
  }

  async update(id: string, updateClassGroupDto: UpdateClassGroupDto): Promise<ClassGroup> {
    const classGroup = await this.findOne(id);
    const { academicYearId, courseIds, tutorId, studentIds, ...updateData } = updateClassGroupDto;

    // Actualizar año académico si se proporciona
    if (academicYearId) {
      const academicYear = await this.academicYearRepository.findOne({
        where: { id: academicYearId },
      });
      if (!academicYear) {
        throw new NotFoundException(`Año académico con ID ${academicYearId} no encontrado`);
      }
      classGroup.academicYear = academicYear;
    }

    // Actualizar cursos si se proporcionan
    if (courseIds) {
      const courses = await this.courseRepository.find({
        where: { id: In(courseIds) },
        relations: ['cycle', 'cycle.educationalLevel'],
      });
      if (courses.length !== courseIds.length) {
        throw new NotFoundException(`Uno o más cursos no fueron encontrados`);
      }
      classGroup.courses = courses;
    }

    // Actualizar tutor si se proporciona
    if (tutorId) {
      const tutor = await this.teacherRepository.findOne({
        where: { id: tutorId },
        relations: ['user', 'user.profile'],
      });
      if (!tutor) {
        throw new NotFoundException(`Profesor con ID ${tutorId} no encontrado`);
      }
      classGroup.tutor = tutor;
    }

    // Actualizar estudiantes si se proporcionan
    if (studentIds) {
      if (studentIds.length > 0) {
        const students = await this.studentRepository.find({
          where: { id: In(studentIds) },
          relations: ['user', 'user.profile'],
        });
        if (students.length !== studentIds.length) {
          const foundIds = students.map(s => s.id);
          const missingIds = studentIds.filter(id => !foundIds.includes(id));
          throw new NotFoundException(
            `Estudiantes con IDs ${missingIds.join(', ')} no encontrados`,
          );
        }
        classGroup.students = students;
      } else {
        classGroup.students = [];
      }
    }

    // Aplicar otros cambios
    Object.assign(classGroup, updateData);

    return this.classGroupRepository.save(classGroup);
  }

  async assignStudents(id: string, assignStudentsDto: AssignStudentsDto): Promise<ClassGroup> {
    const classGroup = await this.findOne(id);
    const { studentIds } = assignStudentsDto;

    const students = await this.studentRepository.find({
      where: { id: In(studentIds) },
      relations: ['user', 'user.profile'],
    });

    if (students.length !== studentIds.length) {
      const foundIds = students.map(s => s.id);
      const missingIds = studentIds.filter(id => !foundIds.includes(id));
      throw new NotFoundException(
        `Estudiantes con IDs ${missingIds.join(', ')} no encontrados`,
      );
    }

    // Añadir estudiantes que no estén ya asignados
    const currentStudentIds = classGroup.students.map(s => s.id);
    const newStudents = students.filter(s => !currentStudentIds.includes(s.id));
    
    classGroup.students = [...classGroup.students, ...newStudents];

    return this.classGroupRepository.save(classGroup);
  }

  async removeStudent(id: string, studentId: string): Promise<ClassGroup> {
    const classGroup = await this.findOne(id);
    
    classGroup.students = classGroup.students.filter(s => s.id !== studentId);

    return this.classGroupRepository.save(classGroup);
  }

  async assignTutor(id: string, tutorId: string): Promise<ClassGroup> {
    const classGroup = await this.findOne(id);
    
    const tutor = await this.teacherRepository.findOne({
      where: { id: tutorId },
      relations: ['user', 'user.profile'],
    });

    if (!tutor) {
      throw new NotFoundException(`Profesor con ID ${tutorId} no encontrado`);
    }

    classGroup.tutor = tutor;

    return this.classGroupRepository.save(classGroup);
  }

  async removeTutor(id: string): Promise<ClassGroup> {
    const classGroup = await this.findOne(id);
    
    classGroup.tutor = null;

    return this.classGroupRepository.save(classGroup);
  }

  async remove(id: string): Promise<void> {
    const classGroup = await this.findOne(id);
    await this.classGroupRepository.remove(classGroup);
  }

  async getAvailableStudents(courseId?: string): Promise<Student[]> {
    const queryBuilder = this.studentRepository
      .createQueryBuilder('student')
      .leftJoinAndSelect('student.user', 'user')
      .leftJoinAndSelect('user.profile', 'profile')
      .leftJoinAndSelect('student.course', 'course')
      .leftJoinAndSelect('student.classGroups', 'classGroups');

    if (courseId) {
      queryBuilder.andWhere('course.id = :courseId', { courseId });
    }

    return queryBuilder.getMany();
  }

  async getAvailableTeachers(): Promise<Teacher[]> {
    return this.teacherRepository.find({
      relations: ['user', 'user.profile'],
      where: { user: { isActive: true } },
    });
  }
}