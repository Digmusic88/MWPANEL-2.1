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
exports.SubjectsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const subject_entity_1 = require("../students/entities/subject.entity");
const subject_assignment_entity_1 = require("../students/entities/subject-assignment.entity");
const teacher_entity_1 = require("../teachers/entities/teacher.entity");
const class_group_entity_1 = require("../students/entities/class-group.entity");
const course_entity_1 = require("../students/entities/course.entity");
const academic_year_entity_1 = require("../students/entities/academic-year.entity");
let SubjectsService = class SubjectsService {
    constructor(subjectRepository, assignmentRepository, teacherRepository, classGroupRepository, courseRepository, academicYearRepository) {
        this.subjectRepository = subjectRepository;
        this.assignmentRepository = assignmentRepository;
        this.teacherRepository = teacherRepository;
        this.classGroupRepository = classGroupRepository;
        this.courseRepository = courseRepository;
        this.academicYearRepository = academicYearRepository;
    }
    async findAllSubjects() {
        return this.subjectRepository.find({
            relations: ['course', 'course.cycle', 'course.cycle.educationalLevel'],
            order: {
                course: { order: 'ASC' },
                name: 'ASC',
            },
        });
    }
    async findOneSubject(id) {
        const subject = await this.subjectRepository.findOne({
            where: { id },
            relations: ['course', 'course.cycle', 'course.cycle.educationalLevel'],
        });
        if (!subject) {
            throw new common_1.NotFoundException(`Asignatura con ID ${id} no encontrada`);
        }
        return subject;
    }
    async createSubject(createSubjectDto) {
        const { courseId, ...subjectData } = createSubjectDto;
        const course = await this.courseRepository.findOne({
            where: { id: courseId },
            relations: ['cycle', 'cycle.educationalLevel'],
        });
        if (!course) {
            throw new common_1.NotFoundException(`Curso con ID ${courseId} no encontrado`);
        }
        const existingSubject = await this.subjectRepository.findOne({
            where: { code: subjectData.code },
        });
        if (existingSubject) {
            throw new common_1.ConflictException(`Ya existe una asignatura con el código "${subjectData.code}"`);
        }
        const subject = this.subjectRepository.create({
            ...subjectData,
            course,
        });
        return this.subjectRepository.save(subject);
    }
    async updateSubject(id, updateSubjectDto) {
        const subject = await this.findOneSubject(id);
        const { courseId, ...updateData } = updateSubjectDto;
        if (courseId) {
            const course = await this.courseRepository.findOne({
                where: { id: courseId },
                relations: ['cycle', 'cycle.educationalLevel'],
            });
            if (!course) {
                throw new common_1.NotFoundException(`Curso con ID ${courseId} no encontrado`);
            }
            subject.course = course;
        }
        if (updateData.code && updateData.code !== subject.code) {
            const existingSubject = await this.subjectRepository.findOne({
                where: { code: updateData.code },
            });
            if (existingSubject) {
                throw new common_1.ConflictException(`Ya existe una asignatura con el código "${updateData.code}"`);
            }
        }
        Object.assign(subject, updateData);
        return this.subjectRepository.save(subject);
    }
    async removeSubject(id) {
        const subject = await this.findOneSubject(id);
        const activeAssignments = await this.assignmentRepository.count({
            where: { subject: { id } },
        });
        if (activeAssignments > 0) {
            throw new common_1.BadRequestException(`No se puede eliminar la asignatura porque tiene ${activeAssignments} asignaciones activas`);
        }
        await this.subjectRepository.remove(subject);
    }
    async findSubjectsByCourse(courseId) {
        return this.subjectRepository.find({
            where: { course: { id: courseId } },
            relations: ['course'],
            order: { name: 'ASC' },
        });
    }
    async findAllAssignments() {
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
    async findOneAssignment(id) {
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
            throw new common_1.NotFoundException(`Asignación con ID ${id} no encontrada`);
        }
        return assignment;
    }
    async createAssignment(createAssignmentDto) {
        const { teacherId, subjectId, classGroupId, academicYearId, ...assignmentData } = createAssignmentDto;
        const teacher = await this.teacherRepository.findOne({
            where: { id: teacherId },
            relations: ['user', 'user.profile'],
        });
        if (!teacher) {
            throw new common_1.NotFoundException(`Profesor con ID ${teacherId} no encontrado`);
        }
        const subject = await this.subjectRepository.findOne({
            where: { id: subjectId },
            relations: ['course'],
        });
        if (!subject) {
            throw new common_1.NotFoundException(`Asignatura con ID ${subjectId} no encontrada`);
        }
        const classGroup = await this.classGroupRepository.findOne({
            where: { id: classGroupId },
            relations: ['courses'],
        });
        if (!classGroup) {
            throw new common_1.NotFoundException(`Grupo de clase con ID ${classGroupId} no encontrado`);
        }
        const academicYear = await this.academicYearRepository.findOne({
            where: { id: academicYearId },
        });
        if (!academicYear) {
            throw new common_1.NotFoundException(`Año académico con ID ${academicYearId} no encontrado`);
        }
        const existingAssignment = await this.assignmentRepository.findOne({
            where: {
                teacher: { id: teacherId },
                subject: { id: subjectId },
                classGroup: { id: classGroupId },
                academicYear: { id: academicYearId },
            },
        });
        if (existingAssignment) {
            throw new common_1.ConflictException(`Ya existe una asignación para este profesor, asignatura y grupo en el año académico especificado`);
        }
        const assignment = this.assignmentRepository.create({
            ...assignmentData,
            teacher,
            subject,
            classGroup,
            academicYear,
        });
        return this.assignmentRepository.save(assignment);
    }
    async updateAssignment(id, updateAssignmentDto) {
        const assignment = await this.findOneAssignment(id);
        const { teacherId, subjectId, classGroupId, academicYearId, ...updateData } = updateAssignmentDto;
        if (teacherId) {
            const teacher = await this.teacherRepository.findOne({
                where: { id: teacherId },
                relations: ['user', 'user.profile'],
            });
            if (!teacher) {
                throw new common_1.NotFoundException(`Profesor con ID ${teacherId} no encontrado`);
            }
            assignment.teacher = teacher;
        }
        if (subjectId) {
            const subject = await this.subjectRepository.findOne({
                where: { id: subjectId },
                relations: ['course'],
            });
            if (!subject) {
                throw new common_1.NotFoundException(`Asignatura con ID ${subjectId} no encontrada`);
            }
            assignment.subject = subject;
        }
        if (classGroupId) {
            const classGroup = await this.classGroupRepository.findOne({
                where: { id: classGroupId },
                relations: ['courses'],
            });
            if (!classGroup) {
                throw new common_1.NotFoundException(`Grupo de clase con ID ${classGroupId} no encontrado`);
            }
            assignment.classGroup = classGroup;
        }
        if (academicYearId) {
            const academicYear = await this.academicYearRepository.findOne({
                where: { id: academicYearId },
            });
            if (!academicYear) {
                throw new common_1.NotFoundException(`Año académico con ID ${academicYearId} no encontrado`);
            }
            assignment.academicYear = academicYear;
        }
        Object.assign(assignment, updateData);
        return this.assignmentRepository.save(assignment);
    }
    async removeAssignment(id) {
        const assignment = await this.findOneAssignment(id);
        await this.assignmentRepository.remove(assignment);
    }
    async findAssignmentsByTeacher(teacherId) {
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
    async findAssignmentsByClassGroup(classGroupId) {
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
    async findAssignmentsByAcademicYear(academicYearId) {
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
};
exports.SubjectsService = SubjectsService;
exports.SubjectsService = SubjectsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(subject_entity_1.Subject)),
    __param(1, (0, typeorm_1.InjectRepository)(subject_assignment_entity_1.SubjectAssignment)),
    __param(2, (0, typeorm_1.InjectRepository)(teacher_entity_1.Teacher)),
    __param(3, (0, typeorm_1.InjectRepository)(class_group_entity_1.ClassGroup)),
    __param(4, (0, typeorm_1.InjectRepository)(course_entity_1.Course)),
    __param(5, (0, typeorm_1.InjectRepository)(academic_year_entity_1.AcademicYear)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], SubjectsService);
//# sourceMappingURL=subjects.service.js.map