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
exports.ClassGroupsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const class_group_entity_1 = require("../students/entities/class-group.entity");
const student_entity_1 = require("../students/entities/student.entity");
const teacher_entity_1 = require("../teachers/entities/teacher.entity");
const course_entity_1 = require("../students/entities/course.entity");
const academic_year_entity_1 = require("../students/entities/academic-year.entity");
let ClassGroupsService = class ClassGroupsService {
    constructor(classGroupRepository, studentRepository, teacherRepository, courseRepository, academicYearRepository) {
        this.classGroupRepository = classGroupRepository;
        this.studentRepository = studentRepository;
        this.teacherRepository = teacherRepository;
        this.courseRepository = courseRepository;
        this.academicYearRepository = academicYearRepository;
    }
    async findAll() {
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
    async findOne(id) {
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
            throw new common_1.NotFoundException(`Grupo de clase con ID ${id} no encontrado`);
        }
        return classGroup;
    }
    async findByAcademicYear(academicYearId) {
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
    async findByCourse(courseId) {
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
    async findByTutor(tutorId) {
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
    async findByTeacherUserId(userId) {
        const queryBuilder = this.classGroupRepository
            .createQueryBuilder('classGroup')
            .leftJoinAndSelect('classGroup.academicYear', 'academicYear')
            .leftJoinAndSelect('classGroup.courses', 'courses')
            .leftJoinAndSelect('courses.cycle', 'cycle')
            .leftJoinAndSelect('cycle.educationalLevel', 'educationalLevel')
            .leftJoinAndSelect('classGroup.tutor', 'tutor')
            .leftJoinAndSelect('tutor.user', 'tutorUser')
            .leftJoinAndSelect('tutorUser.profile', 'tutorProfile')
            .leftJoinAndSelect('classGroup.students', 'students')
            .leftJoinAndSelect('students.user', 'studentUser')
            .leftJoinAndSelect('studentUser.profile', 'studentProfile')
            .where('tutorUser.id = :userId', { userId })
            .orderBy('academicYear.startDate', 'DESC')
            .addOrderBy('classGroup.section', 'ASC');
        const result = await queryBuilder.getMany();
        return result;
    }
    async create(createClassGroupDto) {
        const { academicYearId, courseIds, tutorId, studentIds, ...classGroupData } = createClassGroupDto;
        const academicYear = await this.academicYearRepository.findOne({
            where: { id: academicYearId },
        });
        if (!academicYear) {
            throw new common_1.NotFoundException(`Año académico con ID ${academicYearId} no encontrado`);
        }
        const courses = await this.courseRepository.find({
            where: { id: (0, typeorm_2.In)(courseIds) },
            relations: ['cycle', 'cycle.educationalLevel'],
        });
        if (courses.length !== courseIds.length) {
            throw new common_1.NotFoundException(`Uno o más cursos no fueron encontrados`);
        }
        const existingClassGroup = await this.classGroupRepository.findOne({
            where: {
                name: classGroupData.name,
                academicYear: { id: academicYearId },
            },
        });
        if (existingClassGroup) {
            throw new common_1.ConflictException(`Ya existe un grupo de clase con el nombre "${classGroupData.name}" en el año académico ${academicYear.name}`);
        }
        let tutor;
        if (tutorId) {
            tutor = await this.teacherRepository.findOne({
                where: { id: tutorId },
                relations: ['user', 'user.profile'],
            });
            if (!tutor) {
                throw new common_1.NotFoundException(`Profesor con ID ${tutorId} no encontrado`);
            }
        }
        let students = [];
        if (studentIds && studentIds.length > 0) {
            students = await this.studentRepository.find({
                where: { id: (0, typeorm_2.In)(studentIds) },
                relations: ['user', 'user.profile'],
            });
            if (students.length !== studentIds.length) {
                const foundIds = students.map(s => s.id);
                const missingIds = studentIds.filter(id => !foundIds.includes(id));
                throw new common_1.NotFoundException(`Estudiantes con IDs ${missingIds.join(', ')} no encontrados`);
            }
        }
        const classGroup = this.classGroupRepository.create({
            ...classGroupData,
            academicYear,
            courses,
            tutor,
            students,
        });
        return this.classGroupRepository.save(classGroup);
    }
    async update(id, updateClassGroupDto) {
        const classGroup = await this.findOne(id);
        const { academicYearId, courseIds, tutorId, studentIds, ...updateData } = updateClassGroupDto;
        if (academicYearId) {
            const academicYear = await this.academicYearRepository.findOne({
                where: { id: academicYearId },
            });
            if (!academicYear) {
                throw new common_1.NotFoundException(`Año académico con ID ${academicYearId} no encontrado`);
            }
            classGroup.academicYear = academicYear;
        }
        if (courseIds) {
            const courses = await this.courseRepository.find({
                where: { id: (0, typeorm_2.In)(courseIds) },
                relations: ['cycle', 'cycle.educationalLevel'],
            });
            if (courses.length !== courseIds.length) {
                throw new common_1.NotFoundException(`Uno o más cursos no fueron encontrados`);
            }
            classGroup.courses = courses;
        }
        if (tutorId) {
            const tutor = await this.teacherRepository.findOne({
                where: { id: tutorId },
                relations: ['user', 'user.profile'],
            });
            if (!tutor) {
                throw new common_1.NotFoundException(`Profesor con ID ${tutorId} no encontrado`);
            }
            classGroup.tutor = tutor;
        }
        if (studentIds) {
            if (studentIds.length > 0) {
                const students = await this.studentRepository.find({
                    where: { id: (0, typeorm_2.In)(studentIds) },
                    relations: ['user', 'user.profile'],
                });
                if (students.length !== studentIds.length) {
                    const foundIds = students.map(s => s.id);
                    const missingIds = studentIds.filter(id => !foundIds.includes(id));
                    throw new common_1.NotFoundException(`Estudiantes con IDs ${missingIds.join(', ')} no encontrados`);
                }
                classGroup.students = students;
            }
            else {
                classGroup.students = [];
            }
        }
        Object.assign(classGroup, updateData);
        return this.classGroupRepository.save(classGroup);
    }
    async assignStudents(id, assignStudentsDto) {
        const classGroup = await this.findOne(id);
        const { studentIds } = assignStudentsDto;
        const students = await this.studentRepository.find({
            where: { id: (0, typeorm_2.In)(studentIds) },
            relations: ['user', 'user.profile'],
        });
        if (students.length !== studentIds.length) {
            const foundIds = students.map(s => s.id);
            const missingIds = studentIds.filter(id => !foundIds.includes(id));
            throw new common_1.NotFoundException(`Estudiantes con IDs ${missingIds.join(', ')} no encontrados`);
        }
        const currentStudentIds = classGroup.students.map(s => s.id);
        const newStudents = students.filter(s => !currentStudentIds.includes(s.id));
        classGroup.students = [...classGroup.students, ...newStudents];
        return this.classGroupRepository.save(classGroup);
    }
    async removeStudent(id, studentId) {
        const classGroup = await this.findOne(id);
        classGroup.students = classGroup.students.filter(s => s.id !== studentId);
        return this.classGroupRepository.save(classGroup);
    }
    async assignTutor(id, tutorId) {
        const classGroup = await this.findOne(id);
        const tutor = await this.teacherRepository.findOne({
            where: { id: tutorId },
            relations: ['user', 'user.profile'],
        });
        if (!tutor) {
            throw new common_1.NotFoundException(`Profesor con ID ${tutorId} no encontrado`);
        }
        classGroup.tutor = tutor;
        return this.classGroupRepository.save(classGroup);
    }
    async removeTutor(id) {
        const classGroup = await this.findOne(id);
        classGroup.tutor = null;
        return this.classGroupRepository.save(classGroup);
    }
    async remove(id) {
        const classGroup = await this.findOne(id);
        await this.classGroupRepository.remove(classGroup);
    }
    async getAvailableStudents(courseId) {
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
    async getAvailableTeachers() {
        return this.teacherRepository.find({
            relations: ['user', 'user.profile'],
            where: { user: { isActive: true } },
        });
    }
    async getAvailableCourses() {
        const query = this.courseRepository
            .createQueryBuilder('course')
            .leftJoinAndSelect('course.cycle', 'cycle')
            .leftJoinAndSelect('cycle.educationalLevel', 'educationalLevel')
            .orderBy(`CASE educationalLevel.code 
                 WHEN 'INFANTIL' THEN 1 
                 WHEN 'PRIMARIA' THEN 2 
                 WHEN 'SECUNDARIA' THEN 3 
                 ELSE 4 END`, 'ASC')
            .addOrderBy('cycle.order', 'ASC')
            .addOrderBy('course.order', 'ASC');
        const result = await query.getMany();
        return result;
    }
    async findTeacherClasses(teacherId) {
        const tutoredClasses = await this.classGroupRepository.find({
            where: { tutor: { id: teacherId } },
            relations: [
                'academicYear',
                'courses',
                'courses.cycle',
                'courses.cycle.educationalLevel',
                'tutor',
                'tutor.user',
                'tutor.user.profile',
            ],
        });
        const assignmentClasses = await this.classGroupRepository
            .createQueryBuilder('classGroup')
            .leftJoinAndSelect('classGroup.academicYear', 'academicYear')
            .leftJoinAndSelect('classGroup.courses', 'courses')
            .leftJoinAndSelect('courses.cycle', 'cycle')
            .leftJoinAndSelect('cycle.educationalLevel', 'educationalLevel')
            .leftJoinAndSelect('classGroup.tutor', 'tutor')
            .leftJoinAndSelect('tutor.user', 'tutorUser')
            .leftJoinAndSelect('tutorUser.profile', 'tutorProfile')
            .innerJoin('subject_assignments', 'sa', 'sa.classGroupId = classGroup.id')
            .where('sa.teacherId = :teacherId', { teacherId })
            .getMany();
        const allClassesMap = new Map();
        [...tutoredClasses, ...assignmentClasses].forEach(classGroup => {
            allClassesMap.set(classGroup.id, classGroup);
        });
        return Array.from(allClassesMap.values()).sort((a, b) => {
            const aLevel = a.courses[0]?.cycle?.educationalLevel?.code || '';
            const bLevel = b.courses[0]?.cycle?.educationalLevel?.code || '';
            const levelOrder = { 'INFANTIL': 1, 'PRIMARIA': 2, 'SECUNDARIA': 3 };
            const aOrder = levelOrder[aLevel] || 999;
            const bOrder = levelOrder[bLevel] || 999;
            if (aOrder !== bOrder) {
                return aOrder - bOrder;
            }
            return a.name.localeCompare(b.name);
        });
    }
    async findTeacherClassesByUserId(userId) {
        const teacher = await this.teacherRepository.findOne({
            where: { user: { id: userId } },
            select: ['id'],
        });
        if (!teacher) {
            throw new common_1.NotFoundException('Profesor no encontrado para este usuario');
        }
        return this.findTeacherClasses(teacher.id);
    }
};
exports.ClassGroupsService = ClassGroupsService;
exports.ClassGroupsService = ClassGroupsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(class_group_entity_1.ClassGroup)),
    __param(1, (0, typeorm_1.InjectRepository)(student_entity_1.Student)),
    __param(2, (0, typeorm_1.InjectRepository)(teacher_entity_1.Teacher)),
    __param(3, (0, typeorm_1.InjectRepository)(course_entity_1.Course)),
    __param(4, (0, typeorm_1.InjectRepository)(academic_year_entity_1.AcademicYear)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ClassGroupsService);
//# sourceMappingURL=class-groups.service.js.map