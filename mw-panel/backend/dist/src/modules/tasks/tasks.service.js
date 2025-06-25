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
exports.TasksService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const entities_1 = require("./entities");
const teacher_entity_1 = require("../teachers/entities/teacher.entity");
const student_entity_1 = require("../students/entities/student.entity");
const subject_assignment_entity_1 = require("../students/entities/subject-assignment.entity");
const family_entity_1 = require("../users/entities/family.entity");
const user_entity_1 = require("../users/entities/user.entity");
let TasksService = class TasksService {
    constructor(tasksRepository, submissionsRepository, attachmentsRepository, submissionAttachmentsRepository, teachersRepository, studentsRepository, subjectAssignmentsRepository, familiesRepository, familyStudentsRepository, usersRepository) {
        this.tasksRepository = tasksRepository;
        this.submissionsRepository = submissionsRepository;
        this.attachmentsRepository = attachmentsRepository;
        this.submissionAttachmentsRepository = submissionAttachmentsRepository;
        this.teachersRepository = teachersRepository;
        this.studentsRepository = studentsRepository;
        this.subjectAssignmentsRepository = subjectAssignmentsRepository;
        this.familiesRepository = familiesRepository;
        this.familyStudentsRepository = familyStudentsRepository;
        this.usersRepository = usersRepository;
    }
    async create(createTaskDto, userId) {
        const teacher = await this.teachersRepository.findOne({
            where: { user: { id: userId } },
        });
        if (!teacher) {
            throw new common_1.NotFoundException('Profesor no encontrado');
        }
        await this.verifyTeacherSubjectAssignmentAccess(teacher.id, createTaskDto.subjectAssignmentId);
        const assignedDate = new Date(createTaskDto.assignedDate);
        const dueDate = new Date(createTaskDto.dueDate);
        if (dueDate <= assignedDate) {
            throw new common_1.BadRequestException('La fecha de entrega debe ser posterior a la fecha de asignación');
        }
        const task = this.tasksRepository.create({
            ...createTaskDto,
            teacherId: teacher.id,
            assignedDate,
            dueDate,
            allowedFileTypes: createTaskDto.allowedFileTypes ? JSON.stringify(createTaskDto.allowedFileTypes) : null,
            maxFileSize: createTaskDto.maxFileSizeMB ? createTaskDto.maxFileSizeMB * 1024 * 1024 : null,
            status: entities_1.TaskStatus.DRAFT,
        });
        const savedTask = await this.tasksRepository.save(task);
        if (savedTask.taskType === entities_1.TaskType.EXAM) {
            await this.createNotificationsForExamTask(savedTask.id, createTaskDto.subjectAssignmentId, createTaskDto.targetStudentIds);
        }
        else {
            await this.createSubmissionRecordsForTask(savedTask.id, createTaskDto.subjectAssignmentId, createTaskDto.targetStudentIds);
        }
        return this.findOne(savedTask.id);
    }
    async findAllByTeacher(userId, query) {
        const teacher = await this.teachersRepository.findOne({
            where: { user: { id: userId } },
        });
        if (!teacher) {
            throw new common_1.NotFoundException('Profesor no encontrado');
        }
        const page = parseInt(query.page || '1');
        const limit = parseInt(query.limit || '10');
        const offset = (page - 1) * limit;
        const queryBuilder = this.tasksRepository.createQueryBuilder('task')
            .leftJoinAndSelect('task.subjectAssignment', 'subjectAssignment')
            .leftJoinAndSelect('subjectAssignment.subject', 'subject')
            .leftJoinAndSelect('subjectAssignment.classGroup', 'classGroup')
            .leftJoinAndSelect('task.submissions', 'submissions')
            .leftJoinAndSelect('submissions.student', 'student')
            .leftJoinAndSelect('student.user', 'user')
            .leftJoinAndSelect('user.profile', 'profile')
            .leftJoinAndSelect('task.attachments', 'attachments')
            .where('task.teacherId = :teacherId', { teacherId: teacher.id })
            .andWhere('task.isActive = :isActive', { isActive: true });
        if (query.classGroupId) {
            queryBuilder.andWhere('subjectAssignment.classGroupId = :classGroupId', { classGroupId: query.classGroupId });
        }
        if (query.subjectAssignmentId) {
            queryBuilder.andWhere('task.subjectAssignmentId = :subjectAssignmentId', { subjectAssignmentId: query.subjectAssignmentId });
        }
        if (query.taskType) {
            queryBuilder.andWhere('task.taskType = :taskType', { taskType: query.taskType });
        }
        if (query.status) {
            queryBuilder.andWhere('task.status = :status', { status: query.status });
        }
        if (query.priority) {
            queryBuilder.andWhere('task.priority = :priority', { priority: query.priority });
        }
        if (query.startDate && query.endDate) {
            queryBuilder.andWhere('task.assignedDate BETWEEN :startDate AND :endDate', {
                startDate: new Date(query.startDate),
                endDate: new Date(query.endDate),
            });
        }
        if (query.onlyOverdue) {
            queryBuilder.andWhere('task.dueDate < :now', { now: new Date() })
                .andWhere('task.status = :publishedStatus', { publishedStatus: entities_1.TaskStatus.PUBLISHED });
        }
        if (query.search) {
            queryBuilder.andWhere('(task.title ILIKE :search OR task.description ILIKE :search)', {
                search: `%${query.search}%`,
            });
        }
        queryBuilder.orderBy('task.createdAt', 'DESC');
        const [tasks, total] = await queryBuilder
            .take(limit)
            .skip(offset)
            .getManyAndCount();
        return { tasks, total };
    }
    async findOne(id) {
        const task = await this.tasksRepository.findOne({
            where: { id, isActive: true },
            relations: [
                'subjectAssignment',
                'subjectAssignment.subject',
                'subjectAssignment.classGroup',
                'teacher',
                'teacher.user',
                'teacher.user.profile',
                'submissions',
                'submissions.student',
                'submissions.student.user',
                'submissions.student.user.profile',
                'submissions.attachments',
                'attachments',
            ],
        });
        if (!task) {
            throw new common_1.NotFoundException('Tarea no encontrada');
        }
        return task;
    }
    async update(id, updateTaskDto, userId) {
        const task = await this.findOne(id);
        const teacher = await this.teachersRepository.findOne({
            where: { user: { id: userId } },
        });
        if (!teacher) {
            throw new common_1.NotFoundException('Profesor no encontrado');
        }
        if (task.teacherId !== teacher.id) {
            throw new common_1.ForbiddenException('No tienes permisos para editar esta tarea');
        }
        if (updateTaskDto.status === entities_1.TaskStatus.PUBLISHED) {
            if (!task.title || !task.dueDate) {
                throw new common_1.BadRequestException('Para publicar una tarea debe tener al menos título y fecha de entrega');
            }
            updateTaskDto.publishedAt = new Date();
        }
        if (updateTaskDto.status === entities_1.TaskStatus.CLOSED) {
            updateTaskDto.closedAt = new Date();
        }
        const updateData = { ...updateTaskDto };
        if (updateData.allowedFileTypes) {
            updateData.allowedFileTypes = JSON.stringify(updateData.allowedFileTypes);
        }
        if (updateData.maxFileSizeMB) {
            updateData.maxFileSize = updateData.maxFileSizeMB * 1024 * 1024;
            delete updateData.maxFileSizeMB;
        }
        await this.tasksRepository.update(id, updateData);
        return this.findOne(id);
    }
    async remove(id, userId) {
        const task = await this.findOne(id);
        const teacher = await this.teachersRepository.findOne({
            where: { user: { id: userId } },
        });
        if (!teacher) {
            throw new common_1.NotFoundException('Profesor no encontrado');
        }
        if (task.teacherId !== teacher.id) {
            throw new common_1.ForbiddenException('No tienes permisos para eliminar esta tarea');
        }
        if (task.status === entities_1.TaskStatus.PUBLISHED && task.submissions.some(s => s.status !== entities_1.SubmissionStatus.NOT_SUBMITTED)) {
            throw new common_1.BadRequestException('No se puede eliminar una tarea publicada con entregas realizadas');
        }
        await this.tasksRepository.update(id, { isActive: false });
    }
    async getStudentByUserId(userId) {
        console.log(`[DEBUG] getStudentByUserId called with userId: ${userId}`);
        if (!userId || userId === 'undefined' || userId === 'null') {
            console.log(`[ERROR] Invalid userId provided: ${userId}`);
            return null;
        }
        const result = await this.studentsRepository.findOne({
            where: { user: { id: userId } },
        });
        console.log(`[DEBUG] getStudentByUserId result:`, result ? `found student ${result.id}` : 'no student found');
        return result;
    }
    async getTeacherByUserId(userId) {
        console.log(`[DEBUG] getTeacherByUserId called with userId: ${userId}`);
        if (!userId || userId === 'undefined' || userId === 'null') {
            console.log(`[ERROR] Invalid userId provided: ${userId}`);
            return null;
        }
        const result = await this.teachersRepository.findOne({
            where: { user: { id: userId } },
            relations: ['user'],
        });
        console.log(`[DEBUG] getTeacherByUserId result:`, result ? `found teacher ${result.id}` : 'no teacher found');
        return result;
    }
    async submitTask(taskId, submitDto, userId) {
        console.log(`[DEBUG] submitTask called - taskId: ${taskId}, userId: ${userId}`);
        const student = await this.getStudentByUserId(userId);
        if (!student) {
            throw new common_1.NotFoundException('Estudiante no encontrado para este usuario');
        }
        const studentId = student.id;
        console.log(`[DEBUG] Student found - studentId: ${studentId}, enrollmentNumber: ${student.enrollmentNumber}`);
        const task = await this.findOne(taskId);
        if (task.status !== entities_1.TaskStatus.PUBLISHED) {
            throw new common_1.BadRequestException('No se puede entregar una tarea que no está publicada');
        }
        if (task.taskType === entities_1.TaskType.EXAM) {
            throw new common_1.BadRequestException('Las tareas de tipo "Test Yourself" no requieren entrega digital. Son recordatorios de examen.');
        }
        console.log(`[DEBUG] Looking for submission with taskId: ${taskId}, studentId: ${studentId}`);
        const submission = await this.submissionsRepository.findOne({
            where: { taskId, studentId },
            relations: ['attachments'],
        });
        console.log(`[DEBUG] Submission found: ${submission ? 'YES' : 'NO'}, status: ${submission?.status}, needsRevision: ${submission?.needsRevision}`);
        if (submission) {
            console.log(`[DEBUG] Submission details - id: ${submission.id}, submittedAt: ${submission.submittedAt}`);
        }
        if (!submission) {
            throw new common_1.NotFoundException('No tienes esta tarea asignada');
        }
        if (submission.status === entities_1.SubmissionStatus.SUBMITTED && !submission.needsRevision) {
            console.log(`[DEBUG] Task already submitted by student ${studentId} - blocking resubmission`);
            throw new common_1.BadRequestException('Esta tarea ya fue entregada');
        }
        if (task.requiresFile && (!submission.attachments || submission.attachments.length === 0)) {
            throw new common_1.BadRequestException('Esta tarea requiere un archivo adjunto');
        }
        const now = new Date();
        const isLate = now > task.dueDate;
        if (isLate && !task.allowLateSubmission) {
            throw new common_1.BadRequestException('Ya no se aceptan entregas para esta tarea');
        }
        const updateData = {
            content: submitDto.content,
            submissionNotes: submitDto.submissionNotes,
            submittedAt: now,
            isLate,
            status: isLate ? entities_1.SubmissionStatus.LATE : entities_1.SubmissionStatus.SUBMITTED,
            needsRevision: false,
        };
        if (!submission.firstSubmittedAt) {
            updateData.firstSubmittedAt = now;
            updateData.attemptNumber = 1;
        }
        else {
            updateData.attemptNumber = submission.attemptNumber + 1;
        }
        await this.submissionsRepository.update(submission.id, updateData);
        return this.submissionsRepository.findOne({
            where: { id: submission.id },
            relations: ['task', 'student', 'student.user', 'student.user.profile', 'attachments'],
        });
    }
    async resolveStudentIdFromUserId(userId) {
        const student = await this.studentsRepository.findOne({
            where: { user: { id: userId } },
        });
        if (!student) {
            throw new common_1.NotFoundException('Estudiante no encontrado');
        }
        return student.id;
    }
    async getStudentTasks(userId, query) {
        const studentId = await this.resolveStudentIdFromUserId(userId);
        const page = parseInt(query.page || '1');
        const limit = parseInt(query.limit || '10');
        const offset = (page - 1) * limit;
        const queryBuilder = this.tasksRepository.createQueryBuilder('task')
            .leftJoinAndSelect('task.subjectAssignment', 'subjectAssignment')
            .leftJoinAndSelect('subjectAssignment.subject', 'subject')
            .leftJoinAndSelect('subjectAssignment.classGroup', 'classGroup')
            .leftJoinAndSelect('task.teacher', 'teacher')
            .leftJoinAndSelect('teacher.user', 'teacherUser')
            .leftJoinAndSelect('teacherUser.profile', 'teacherProfile')
            .leftJoinAndSelect('task.submissions', 'submissions', 'submissions.studentId = :studentId')
            .leftJoinAndSelect('submissions.attachments', 'submissionAttachments')
            .leftJoinAndSelect('task.attachments', 'taskAttachments')
            .where('task.status = :publishedStatus', { publishedStatus: entities_1.TaskStatus.PUBLISHED })
            .andWhere('task.isActive = :isActive', { isActive: true })
            .setParameter('studentId', studentId);
        queryBuilder.andWhere('EXISTS (SELECT 1 FROM task_submissions ts WHERE ts."taskId" = task.id AND ts."studentId" = :studentId)', { studentId });
        if (query.submissionStatus) {
            queryBuilder.andWhere('submissions.status = :submissionStatus', { submissionStatus: query.submissionStatus });
        }
        if (query.onlyPending) {
            queryBuilder.andWhere('submissions.status IN (:...pendingStatuses)', {
                pendingStatuses: [entities_1.SubmissionStatus.NOT_SUBMITTED, entities_1.SubmissionStatus.RETURNED],
            });
        }
        if (query.onlyGraded) {
            queryBuilder.andWhere('submissions.isGraded = :isGraded', { isGraded: true });
        }
        if (query.subjectId) {
            queryBuilder.andWhere('subjectAssignment.subjectId = :subjectId', { subjectId: query.subjectId });
        }
        if (query.startDate && query.endDate) {
            queryBuilder.andWhere('task.assignedDate BETWEEN :startDate AND :endDate', {
                startDate: new Date(query.startDate),
                endDate: new Date(query.endDate),
            });
        }
        queryBuilder.orderBy('task.dueDate', 'ASC');
        const [tasks, total] = await queryBuilder
            .take(limit)
            .skip(offset)
            .getManyAndCount();
        return { tasks, total };
    }
    async getSubmission(submissionId, userId) {
        const submission = await this.submissionsRepository.findOne({
            where: { id: submissionId },
            relations: [
                'task',
                'task.subjectAssignment',
                'task.subjectAssignment.subject',
                'task.subjectAssignment.classGroup',
                'student',
                'student.user',
                'student.user.profile',
                'attachments',
            ],
        });
        if (!submission) {
            throw new common_1.NotFoundException('Entrega no encontrada');
        }
        let hasAccess = false;
        const teacher = await this.teachersRepository.findOne({
            where: { user: { id: userId } },
        });
        if (teacher && submission.task.teacherId === teacher.id) {
            hasAccess = true;
        }
        const student = await this.studentsRepository.findOne({
            where: { user: { id: userId } },
        });
        if (student && submission.studentId === student.id) {
            hasAccess = true;
        }
        if (!hasAccess) {
            const families = await this.familiesRepository.find({
                where: [
                    { primaryContact: { id: userId } },
                    { secondaryContact: { id: userId } },
                ],
            });
            if (families.length > 0) {
                for (const family of families) {
                    const familyStudents = await this.familyStudentsRepository.find({
                        where: { familyId: family.id },
                    });
                    const studentIds = familyStudents.map(fs => fs.studentId);
                    if (studentIds.includes(submission.studentId)) {
                        hasAccess = true;
                        break;
                    }
                }
            }
        }
        if (!hasAccess) {
            throw new common_1.ForbiddenException('No tienes permisos para ver esta entrega');
        }
        return submission;
    }
    async gradeSubmission(submissionId, gradeDto, userId) {
        const submission = await this.submissionsRepository.findOne({
            where: { id: submissionId },
            relations: ['task', 'student', 'student.user', 'student.user.profile'],
        });
        if (!submission) {
            throw new common_1.NotFoundException('Entrega no encontrada');
        }
        const teacher = await this.teachersRepository.findOne({
            where: { user: { id: userId } },
        });
        if (!teacher) {
            throw new common_1.NotFoundException('Profesor no encontrado');
        }
        if (submission.task.teacherId !== teacher.id) {
            throw new common_1.ForbiddenException('No tienes permisos para calificar esta entrega');
        }
        if (submission.status === entities_1.SubmissionStatus.NOT_SUBMITTED) {
            throw new common_1.BadRequestException('No se puede calificar una entrega no realizada');
        }
        let finalGrade = gradeDto.grade;
        if (submission.isLate && submission.task.latePenalty > 0) {
            finalGrade = gradeDto.grade * (1 - submission.task.latePenalty);
        }
        const updateData = {
            grade: gradeDto.grade,
            finalGrade,
            teacherFeedback: gradeDto.teacherFeedback,
            privateNotes: gradeDto.privateNotes,
            needsRevision: gradeDto.needsRevision || false,
            isGraded: true,
            gradedAt: new Date(),
            status: gradeDto.needsRevision ? entities_1.SubmissionStatus.RETURNED : entities_1.SubmissionStatus.GRADED,
        };
        await this.submissionsRepository.update(submissionId, updateData);
        return this.submissionsRepository.findOne({
            where: { id: submissionId },
            relations: ['task', 'student', 'student.user', 'student.user.profile', 'attachments'],
        });
    }
    async getTeacherStatistics(userId) {
        const teacher = await this.teachersRepository.findOne({
            where: { user: { id: userId } },
        });
        if (!teacher) {
            throw new common_1.NotFoundException('Profesor no encontrado');
        }
        const tasks = await this.tasksRepository.find({
            where: { teacherId: teacher.id, isActive: true },
            relations: ['submissions'],
        });
        const totalTasks = tasks.length;
        const publishedTasks = tasks.filter(t => t.status === entities_1.TaskStatus.PUBLISHED).length;
        const draftTasks = tasks.filter(t => t.status === entities_1.TaskStatus.DRAFT).length;
        const closedTasks = tasks.filter(t => t.status === entities_1.TaskStatus.CLOSED).length;
        const overdueTasks = tasks.filter(t => t.isOverdue).length;
        const allSubmissions = tasks.flatMap(t => t.submissions);
        const totalSubmissions = allSubmissions.length;
        const gradedSubmissions = allSubmissions.filter(s => s.isGraded).length;
        const pendingSubmissions = allSubmissions.filter(s => s.status === entities_1.SubmissionStatus.NOT_SUBMITTED).length;
        const lateSubmissions = allSubmissions.filter(s => s.isLate).length;
        const gradesSubmissions = allSubmissions.filter(s => s.finalGrade !== null && s.finalGrade !== undefined);
        const averageGrade = gradesSubmissions.length > 0
            ? gradesSubmissions.reduce((sum, s) => sum + s.finalGrade, 0) / gradesSubmissions.length
            : 0;
        const submissionRate = totalSubmissions > 0
            ? ((totalSubmissions - pendingSubmissions) / totalSubmissions) * 100
            : 0;
        return {
            totalTasks,
            publishedTasks,
            draftTasks,
            closedTasks,
            overdueTasks,
            totalSubmissions,
            gradedSubmissions,
            pendingSubmissions,
            lateSubmissions,
            averageGrade: Math.round(averageGrade * 100) / 100,
            submissionRate: Math.round(submissionRate * 100) / 100,
        };
    }
    async getStudentStatistics(userId) {
        const studentId = await this.resolveStudentIdFromUserId(userId);
        const submissions = await this.submissionsRepository.find({
            where: { studentId },
            relations: ['task'],
        });
        const totalAssigned = submissions.length;
        const submitted = submissions.filter(s => s.status !== entities_1.SubmissionStatus.NOT_SUBMITTED).length;
        const pending = submissions.filter(s => s.status === entities_1.SubmissionStatus.NOT_SUBMITTED).length;
        const graded = submissions.filter(s => s.isGraded).length;
        const lateSubmissions = submissions.filter(s => s.isLate).length;
        const gradesSubmissions = submissions.filter(s => s.finalGrade !== null && s.finalGrade !== undefined);
        const averageGrade = gradesSubmissions.length > 0
            ? gradesSubmissions.reduce((sum, s) => sum + s.finalGrade, 0) / gradesSubmissions.length
            : 0;
        const submissionRate = totalAssigned > 0 ? (submitted / totalAssigned) * 100 : 0;
        const pendingTasks = submissions
            .filter(s => s.status === entities_1.SubmissionStatus.NOT_SUBMITTED)
            .map(s => s.task)
            .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
        const nextDueDate = pendingTasks.length > 0 ? pendingTasks[0].dueDate : null;
        return {
            totalAssigned,
            submitted,
            pending,
            graded,
            lateSubmissions,
            averageGrade: Math.round(averageGrade * 100) / 100,
            submissionRate: Math.round(submissionRate * 100) / 100,
            nextDueDate,
        };
    }
    async verifyTeacherSubjectAssignmentAccess(teacherId, subjectAssignmentId) {
        const subjectAssignment = await this.subjectAssignmentsRepository.findOne({
            where: { id: subjectAssignmentId },
            relations: ['teacher'],
        });
        if (!subjectAssignment) {
            throw new common_1.NotFoundException('Asignación de asignatura no encontrada');
        }
        if (subjectAssignment.teacherId !== teacherId) {
            throw new common_1.ForbiddenException('No tienes permisos para asignar tareas en esta asignatura');
        }
    }
    async createSubmissionRecordsForTask(taskId, subjectAssignmentId, targetStudentIds) {
        const subjectAssignment = await this.subjectAssignmentsRepository.findOne({
            where: { id: subjectAssignmentId },
            relations: ['classGroup', 'classGroup.students'],
        });
        if (!subjectAssignment) {
            throw new common_1.NotFoundException('Asignación de asignatura no encontrada');
        }
        let students = subjectAssignment.classGroup.students;
        if (targetStudentIds && targetStudentIds.length > 0) {
            students = students.filter(student => targetStudentIds.includes(student.id));
        }
        const submissions = students.map(student => this.submissionsRepository.create({
            taskId,
            studentId: student.id,
            status: entities_1.SubmissionStatus.NOT_SUBMITTED,
        }));
        await this.submissionsRepository.save(submissions);
    }
    async createNotificationsForExamTask(taskId, subjectAssignmentId, targetStudentIds) {
        const subjectAssignment = await this.subjectAssignmentsRepository.findOne({
            where: { id: subjectAssignmentId },
            relations: ['classGroup', 'classGroup.students', 'classGroup.students.user', 'classGroup.students.user.profile'],
        });
        if (!subjectAssignment) {
            throw new common_1.NotFoundException('Asignación de asignatura no encontrada');
        }
        let students = subjectAssignment.classGroup.students;
        if (targetStudentIds && targetStudentIds.length > 0) {
            students = students.filter(student => targetStudentIds.includes(student.id));
        }
        const examRecords = students.map(student => this.submissionsRepository.create({
            taskId,
            studentId: student.id,
            status: entities_1.SubmissionStatus.NOT_SUBMITTED,
            isExamNotification: true,
            content: 'Recordatorio de examen - No requiere entrega digital',
        }));
        await this.submissionsRepository.save(examRecords);
    }
    async getFamilyTasks(userId, query) {
        const studentIds = await this.getFamilyStudentIds(userId);
        if (studentIds.length === 0) {
            throw new common_1.NotFoundException('No se encontraron estudiantes asociados a esta familia');
        }
        let targetStudentIds = studentIds;
        if (query.studentId) {
            if (!studentIds.includes(query.studentId)) {
                throw new common_1.ForbiddenException('No tienes acceso a los datos de este estudiante');
            }
            targetStudentIds = [query.studentId];
        }
        const page = parseInt(query.page || '1');
        const limit = parseInt(query.limit || '10');
        const offset = (page - 1) * limit;
        const queryBuilder = this.tasksRepository.createQueryBuilder('task')
            .leftJoinAndSelect('task.subjectAssignment', 'subjectAssignment')
            .leftJoinAndSelect('subjectAssignment.subject', 'subject')
            .leftJoinAndSelect('subjectAssignment.classGroup', 'classGroup')
            .leftJoinAndSelect('task.teacher', 'teacher')
            .leftJoinAndSelect('teacher.user', 'teacherUser')
            .leftJoinAndSelect('teacherUser.profile', 'teacherProfile')
            .leftJoinAndSelect('task.submissions', 'submissions', 'submissions.studentId IN (:...studentIds)')
            .leftJoinAndSelect('submissions.student', 'student')
            .leftJoinAndSelect('student.user', 'studentUser')
            .leftJoinAndSelect('studentUser.profile', 'studentProfile')
            .leftJoinAndSelect('submissions.attachments', 'submissionAttachments')
            .leftJoinAndSelect('task.attachments', 'taskAttachments')
            .where('task.status = :publishedStatus', { publishedStatus: entities_1.TaskStatus.PUBLISHED })
            .andWhere('task.isActive = :isActive', { isActive: true })
            .andWhere('EXISTS (SELECT 1 FROM task_submissions ts WHERE ts."taskId" = task.id AND ts."studentId" IN (:...studentIds))', { studentIds: targetStudentIds })
            .setParameter('studentIds', targetStudentIds);
        if (query.submissionStatus) {
            queryBuilder.andWhere('submissions.status = :submissionStatus', { submissionStatus: query.submissionStatus });
        }
        if (query.onlyPending) {
            queryBuilder.andWhere('submissions.status IN (:...pendingStatuses)', {
                pendingStatuses: [entities_1.SubmissionStatus.NOT_SUBMITTED, entities_1.SubmissionStatus.RETURNED],
            });
        }
        if (query.onlyGraded) {
            queryBuilder.andWhere('submissions.isGraded = :isGraded', { isGraded: true });
        }
        if (query.subjectId) {
            queryBuilder.andWhere('subjectAssignment.subjectId = :subjectId', { subjectId: query.subjectId });
        }
        if (query.startDate && query.endDate) {
            queryBuilder.andWhere('task.assignedDate BETWEEN :startDate AND :endDate', {
                startDate: new Date(query.startDate),
                endDate: new Date(query.endDate),
            });
        }
        queryBuilder.orderBy('task.dueDate', 'ASC');
        const [tasks, total] = await queryBuilder
            .take(limit)
            .skip(offset)
            .getManyAndCount();
        return { tasks, total };
    }
    async getFamilyStudentIds(userId) {
        const familyStudents = await this.familyStudentsRepository
            .createQueryBuilder('fs')
            .innerJoin('fs.family', 'family')
            .innerJoin('family.primaryContact', 'primaryContact')
            .leftJoin('family.secondaryContact', 'secondaryContact')
            .where('primaryContact.id = :userId OR secondaryContact.id = :userId', { userId })
            .getMany();
        return familyStudents.map(fs => fs.studentId);
    }
    async uploadTaskAttachments(taskId, files, userId, descriptions) {
        const task = await this.findOne(taskId);
        const teacher = await this.teachersRepository.findOne({
            where: { user: { id: userId } },
        });
        if (!teacher) {
            throw new common_1.NotFoundException('Profesor no encontrado');
        }
        if (task.teacherId !== teacher.id) {
            throw new common_1.ForbiddenException('No tienes permisos para subir archivos a esta tarea');
        }
        const attachments = files.map((file, index) => this.attachmentsRepository.create({
            taskId,
            filename: file.filename,
            originalName: file.originalname,
            mimeType: file.mimetype,
            size: file.size,
            path: file.path,
            type: this.getFileTypeFromMimeType(file.mimetype),
            description: descriptions?.[index] || `Archivo adjunto: ${file.originalname}`,
            downloadCount: 0,
        }));
        await this.attachmentsRepository.save(attachments);
    }
    async uploadSubmissionAttachments(submissionId, files, studentId, descriptions) {
        const submission = await this.submissionsRepository.findOne({
            where: { id: submissionId },
            relations: ['task'],
        });
        if (!submission) {
            throw new common_1.NotFoundException('Entrega no encontrada');
        }
        if (submission.studentId !== studentId) {
            throw new common_1.ForbiddenException('No tienes permisos para subir archivos a esta entrega');
        }
        if (submission.task.status === entities_1.TaskStatus.CLOSED) {
            throw new common_1.BadRequestException('Esta tarea ya está cerrada');
        }
        const maxVersion = await this.submissionAttachmentsRepository.maximum('version', { submissionId }) || 0;
        const attachments = files.map((file, index) => this.submissionAttachmentsRepository.create({
            submissionId,
            filename: file.filename,
            originalName: file.originalname,
            mimeType: file.mimetype,
            size: file.size,
            path: file.path,
            status: entities_1.SubmissionAttachmentStatus.UPLOADED,
            description: descriptions?.[index] || `Archivo de entrega: ${file.originalname}`,
            isMainSubmission: index === 0 && !descriptions,
            version: maxVersion + 1,
        }));
        await this.submissionAttachmentsRepository.save(attachments);
    }
    async downloadAttachment(attachmentId, type = 'task') {
        let attachment;
        if (type === 'task') {
            attachment = await this.attachmentsRepository.findOne({ where: { id: attachmentId } });
            if (attachment) {
                await this.attachmentsRepository.update(attachmentId, {
                    downloadCount: attachment.downloadCount + 1
                });
            }
        }
        else {
            attachment = await this.submissionAttachmentsRepository.findOne({ where: { id: attachmentId } });
        }
        if (!attachment) {
            throw new common_1.NotFoundException('Archivo no encontrado');
        }
        return {
            filePath: attachment.path,
            originalName: attachment.originalName,
        };
    }
    async deleteTaskAttachment(attachmentId, userId) {
        const attachment = await this.attachmentsRepository.findOne({
            where: { id: attachmentId },
            relations: ['task'],
        });
        if (!attachment) {
            throw new common_1.NotFoundException('Archivo no encontrado');
        }
        const teacher = await this.teachersRepository.findOne({
            where: { user: { id: userId } },
        });
        if (!teacher) {
            throw new common_1.NotFoundException('Profesor no encontrado');
        }
        if (attachment.task.teacherId !== teacher.id) {
            throw new common_1.ForbiddenException('No tienes permisos para eliminar este archivo');
        }
        await this.attachmentsRepository.remove(attachment);
    }
    async deleteSubmissionAttachment(attachmentId, studentId) {
        const attachment = await this.submissionAttachmentsRepository.findOne({
            where: { id: attachmentId },
            relations: ['submission'],
        });
        if (!attachment) {
            throw new common_1.NotFoundException('Archivo no encontrado');
        }
        if (attachment.submission.studentId !== studentId) {
            throw new common_1.ForbiddenException('No tienes permisos para eliminar este archivo');
        }
        await this.submissionAttachmentsRepository.remove(attachment);
    }
    async getSystemStatistics() {
        const [totalTasks, totalSubmissions, pendingGrading, overdueTasks] = await Promise.all([
            this.tasksRepository.count({
                where: { isActive: true },
            }),
            this.submissionsRepository.count({
                where: { status: (0, typeorm_2.In)([entities_1.SubmissionStatus.SUBMITTED, entities_1.SubmissionStatus.LATE, entities_1.SubmissionStatus.GRADED]) },
            }),
            this.submissionsRepository.count({
                where: {
                    status: (0, typeorm_2.In)([entities_1.SubmissionStatus.SUBMITTED, entities_1.SubmissionStatus.LATE]),
                    isGraded: false,
                },
            }),
            this.tasksRepository.count({
                where: {
                    dueDate: (0, typeorm_2.Between)(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date()),
                    status: entities_1.TaskStatus.PUBLISHED,
                },
            }),
        ]);
        const submissionRate = totalTasks > 0 ? (totalSubmissions / totalTasks * 100) : 0;
        const averageGradingTime = await this.calculateAverageGradingTime();
        return {
            totalTasks,
            totalSubmissions,
            pendingGrading,
            overdueTasks,
            submissionRate: Math.round(submissionRate),
            averageGradingTime,
            lastUpdated: new Date(),
        };
    }
    async getAdvancedTeacherStatistics(userId) {
        const teacher = await this.getTeacherByUserId(userId);
        if (!teacher) {
            throw new common_1.NotFoundException('Profesor no encontrado para este usuario');
        }
        const teacherId = teacher.id;
        const [tasks, submissions, pendingGrading] = await Promise.all([
            this.tasksRepository.find({
                where: { teacherId, isActive: true },
                relations: ['submissions', 'attachments', 'subjectAssignment', 'subjectAssignment.subject'],
            }),
            this.submissionsRepository.find({
                where: { task: { teacherId } },
                relations: ['task', 'student', 'student.user', 'student.user.profile'],
            }),
            this.submissionsRepository.find({
                where: {
                    task: { teacherId },
                    status: (0, typeorm_2.In)([entities_1.SubmissionStatus.SUBMITTED, entities_1.SubmissionStatus.LATE]),
                    isGraded: false,
                },
                relations: ['task', 'student', 'student.user', 'student.user.profile'],
            }),
        ]);
        const subjectStats = this.calculateSubjectStatistics(tasks);
        const studentPerformance = this.calculateStudentPerformance(submissions);
        const timeAnalytics = this.calculateTimeAnalytics(tasks, submissions);
        const engagementMetrics = this.calculateEngagementMetrics(tasks, submissions);
        const submittedSubmissions = submissions.filter(s => s.status !== entities_1.SubmissionStatus.NOT_SUBMITTED);
        const gradedSubmissions = submittedSubmissions.filter(s => s.isGraded);
        const completionRate = submittedSubmissions.length > 0
            ? Math.min(Math.round((gradedSubmissions.length / submittedSubmissions.length) * 100), 100)
            : 0;
        return {
            overview: {
                totalTasks: tasks.length,
                totalSubmissions: submissions.length,
                pendingGrading: pendingGrading.length,
                completionRate,
            },
            subjectStats,
            studentPerformance: studentPerformance.slice(0, 10),
            timeAnalytics,
            engagementMetrics,
            pendingGrading: pendingGrading.slice(0, 5),
        };
    }
    async getTaskSubmissionAnalytics(taskId, teacherId) {
        const task = await this.tasksRepository.findOne({
            where: { id: taskId, teacherId },
            relations: [
                'submissions',
                'submissions.student',
                'submissions.student.user',
                'submissions.student.user.profile',
                'submissions.attachments',
                'subjectAssignment',
                'subjectAssignment.classGroup',
                'subjectAssignment.classGroup.students',
            ],
        });
        if (!task) {
            throw new common_1.NotFoundException('Tarea no encontrada');
        }
        const totalStudents = task.subjectAssignment?.classGroup?.students?.length || 0;
        const submissions = task.submissions || [];
        const submissionAnalysis = {
            total: submissions.length,
            onTime: submissions.filter(s => !s.isLate).length,
            late: submissions.filter(s => s.isLate).length,
            graded: submissions.filter(s => s.isGraded).length,
            pending: submissions.filter(s => !s.isGraded).length,
            notSubmitted: totalStudents - submissions.length,
        };
        const gradedSubmissions = submissions.filter(s => s.isGraded && s.finalGrade !== null);
        const gradeAnalysis = {
            average: gradedSubmissions.length > 0
                ? gradedSubmissions.reduce((acc, s) => acc + s.finalGrade, 0) / gradedSubmissions.length
                : 0,
            highest: gradedSubmissions.length > 0
                ? Math.max(...gradedSubmissions.map(s => s.finalGrade))
                : 0,
            lowest: gradedSubmissions.length > 0
                ? Math.min(...gradedSubmissions.map(s => s.finalGrade))
                : 0,
            distribution: this.calculateGradeDistribution(gradedSubmissions),
        };
        const submissionTimeline = submissions
            .filter(s => s.submittedAt)
            .map(s => ({
            date: s.submittedAt.toISOString().split('T')[0],
            count: 1,
        }))
            .reduce((acc, curr) => {
            const existing = acc.find(item => item.date === curr.date);
            if (existing) {
                existing.count++;
            }
            else {
                acc.push(curr);
            }
            return acc;
        }, [])
            .sort((a, b) => a.date.localeCompare(b.date));
        return {
            taskInfo: {
                id: task.id,
                title: task.title,
                dueDate: task.dueDate,
                status: task.status,
                totalStudents,
            },
            submissionAnalysis,
            gradeAnalysis,
            submissionTimeline,
            recentSubmissions: submissions
                .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
                .slice(0, 10),
        };
    }
    async getPendingGrading(teacherId) {
        const pendingSubmissions = await this.submissionsRepository.find({
            where: {
                task: { teacherId },
                status: (0, typeorm_2.In)([entities_1.SubmissionStatus.SUBMITTED, entities_1.SubmissionStatus.LATE]),
                isGraded: false,
            },
            relations: [
                'task',
                'student',
                'student.user',
                'student.user.profile',
                'attachments',
            ],
            order: { submittedAt: 'ASC' },
        });
        return pendingSubmissions.map(submission => ({
            id: submission.id,
            taskTitle: submission.task.title,
            taskId: submission.task.id,
            studentName: `${submission.student.user.profile.firstName} ${submission.student.user.profile.lastName}`,
            studentId: submission.student.id,
            submittedAt: submission.submittedAt,
            daysPending: Math.ceil((new Date().getTime() - new Date(submission.submittedAt).getTime()) / (1000 * 60 * 60 * 24)),
            hasAttachments: submission.attachments?.length > 0,
            isLate: submission.isLate,
        }));
    }
    async getTestPendingGrading() {
        const teacher = await this.teachersRepository.findOne({
            where: { user: { email: 'profesor@mwpanel.com' } },
            relations: ['user'],
        });
        if (!teacher) {
            throw new common_1.NotFoundException('Profesor de prueba no encontrado');
        }
        return this.getPendingGrading(teacher.id);
    }
    async getTestSubmission(submissionId) {
        const submission = await this.submissionsRepository.findOne({
            where: { id: submissionId },
            relations: [
                'task',
                'task.subjectAssignment',
                'task.subjectAssignment.subject',
                'task.subjectAssignment.classGroup',
                'student',
                'student.user',
                'student.user.profile',
                'attachments',
            ],
        });
        if (!submission) {
            throw new common_1.NotFoundException('Entrega no encontrada');
        }
        return submission;
    }
    async getOverdueTasks(teacherId) {
        const now = new Date();
        const overdueTasks = await this.tasksRepository.find({
            where: {
                teacherId,
                dueDate: (0, typeorm_2.Between)(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), now),
                status: entities_1.TaskStatus.PUBLISHED,
            },
            relations: [
                'submissions',
                'subjectAssignment',
                'subjectAssignment.classGroup',
                'subjectAssignment.classGroup.students',
                'subjectAssignment.subject',
            ],
        });
        return overdueTasks.map(task => {
            const totalStudents = task.subjectAssignment?.classGroup?.students?.length || 0;
            const submittedCount = task.submissions?.length || 0;
            const missingSubmissions = totalStudents - submittedCount;
            return {
                id: task.id,
                title: task.title,
                dueDate: task.dueDate,
                subjectName: task.subjectAssignment?.subject?.name,
                totalStudents,
                submittedCount,
                missingSubmissions,
                completionRate: Math.round((submittedCount / Math.max(totalStudents, 1)) * 100),
                daysOverdue: Math.ceil((now.getTime() - task.dueDate.getTime()) / (1000 * 60 * 60 * 24)),
            };
        });
    }
    async sendBulkReminders(taskIds, teacherId, customMessage) {
        const tasks = await this.tasksRepository.find({
            where: {
                id: (0, typeorm_2.In)(taskIds),
                teacherId,
            },
            relations: [
                'subjectAssignment',
                'subjectAssignment.classGroup',
                'subjectAssignment.classGroup.students',
                'subjectAssignment.classGroup.students.user',
                'submissions',
            ],
        });
        if (tasks.length === 0) {
            throw new common_1.NotFoundException('No se encontraron tareas válidas');
        }
        let totalReminders = 0;
        for (const task of tasks) {
            const studentsToRemind = task.subjectAssignment?.classGroup?.students?.filter(student => {
                return !task.submissions?.some(submission => submission.studentId === student.id);
            }) || [];
            totalReminders += studentsToRemind.length;
            console.log(`Enviando recordatorio de tarea "${task.title}" a ${studentsToRemind.length} estudiantes`);
        }
        return {
            message: `Recordatorios enviados exitosamente`,
            taskCount: tasks.length,
            reminderCount: totalReminders,
            sentAt: new Date(),
        };
    }
    calculateSubjectStatistics(tasks) {
        const subjectMap = new Map();
        tasks.forEach(task => {
            const subjectName = task.subjectAssignment?.subject?.name || 'Sin asignatura';
            const submissionCount = task.submissions?.length || 0;
            const gradedCount = task.submissions?.filter(s => s.isGraded).length || 0;
            if (!subjectMap.has(subjectName)) {
                subjectMap.set(subjectName, {
                    name: subjectName,
                    taskCount: 0,
                    submissionCount: 0,
                    gradedCount: 0,
                    averageGrade: 0,
                });
            }
            const stats = subjectMap.get(subjectName);
            stats.taskCount++;
            stats.submissionCount += submissionCount;
            stats.gradedCount += gradedCount;
        });
        return Array.from(subjectMap.values());
    }
    calculateStudentPerformance(submissions) {
        const studentMap = new Map();
        submissions.forEach(submission => {
            const studentKey = submission.student.id;
            const studentName = `${submission.student.user.profile.firstName} ${submission.student.user.profile.lastName}`;
            if (!studentMap.has(studentKey)) {
                studentMap.set(studentKey, {
                    studentId: studentKey,
                    studentName,
                    submissionCount: 0,
                    averageGrade: 0,
                    onTimeRate: 0,
                    grades: [],
                });
            }
            const stats = studentMap.get(studentKey);
            stats.submissionCount++;
            if (submission.finalGrade !== null) {
                stats.grades.push(submission.finalGrade);
            }
        });
        Array.from(studentMap.values()).forEach(stats => {
            if (stats.grades.length > 0) {
                stats.averageGrade = stats.grades.reduce((a, b) => a + b, 0) / stats.grades.length;
            }
        });
        return Array.from(studentMap.values()).sort((a, b) => b.averageGrade - a.averageGrade);
    }
    calculateTimeAnalytics(tasks, submissions) {
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const recentTasks = tasks.filter(t => t.createdAt >= thirtyDaysAgo);
        const recentSubmissions = submissions.filter(s => s.submittedAt && s.submittedAt >= thirtyDaysAgo);
        return {
            tasksCreatedLast30Days: recentTasks.length,
            submissionsLast30Days: recentSubmissions.length,
            averageSubmissionsPerTask: recentTasks.length > 0 ? recentSubmissions.length / recentTasks.length : 0,
        };
    }
    calculateEngagementMetrics(tasks, submissions) {
        const totalPossibleSubmissions = tasks.reduce((acc, task) => {
            return acc + (task.subjectAssignment?.classGroup?.students?.length || 0);
        }, 0);
        const validSubmissions = submissions.filter(s => s.status !== entities_1.SubmissionStatus.NOT_SUBMITTED);
        const submissionRate = totalPossibleSubmissions > 0 ?
            Math.min((validSubmissions.length / totalPossibleSubmissions) * 100, 100) : 0;
        const onTimeRate = validSubmissions.length > 0 ?
            (validSubmissions.filter(s => !s.isLate).length / validSubmissions.length) * 100 : 0;
        return {
            submissionRate: Math.round(submissionRate),
            onTimeRate: Math.round(onTimeRate),
            averageAttachmentsPerSubmission: validSubmissions.length > 0
                ? validSubmissions.reduce((acc, s) => acc + (s.attachments?.length || 0), 0) / validSubmissions.length
                : 0,
        };
    }
    calculateGradeDistribution(submissions) {
        const ranges = [
            { label: '90-100%', min: 90, max: 100, count: 0 },
            { label: '80-89%', min: 80, max: 89, count: 0 },
            { label: '70-79%', min: 70, max: 79, count: 0 },
            { label: '60-69%', min: 60, max: 69, count: 0 },
            { label: '0-59%', min: 0, max: 59, count: 0 },
        ];
        submissions.forEach(submission => {
            if (submission.finalGrade !== null && submission.task?.maxPoints) {
                const percentage = (submission.finalGrade / submission.task.maxPoints) * 100;
                const range = ranges.find(r => percentage >= r.min && percentage <= r.max);
                if (range)
                    range.count++;
            }
        });
        return ranges;
    }
    async calculateAverageGradingTime() {
        const gradedSubmissions = await this.submissionsRepository.find({
            where: { isGraded: true },
            select: ['submittedAt', 'gradedAt'],
        });
        if (gradedSubmissions.length === 0)
            return 0;
        const totalTime = gradedSubmissions.reduce((acc, submission) => {
            if (submission.submittedAt && submission.gradedAt) {
                return acc + (submission.gradedAt.getTime() - submission.submittedAt.getTime());
            }
            return acc;
        }, 0);
        return Math.round(totalTime / gradedSubmissions.length / (1000 * 60 * 60 * 24));
    }
    getFileTypeFromMimeType(mimeType) {
        if (mimeType.startsWith('image/')) {
            return entities_1.AttachmentType.EXAMPLE;
        }
        if (mimeType === 'application/pdf' ||
            mimeType.includes('document') ||
            mimeType === 'text/plain') {
            return entities_1.AttachmentType.INSTRUCTION;
        }
        if (mimeType.includes('spreadsheet') ||
            mimeType.includes('excel')) {
            return entities_1.AttachmentType.TEMPLATE;
        }
        if (mimeType.includes('presentation') ||
            mimeType.includes('powerpoint')) {
            return entities_1.AttachmentType.REFERENCE;
        }
        return entities_1.AttachmentType.RESOURCE;
    }
    async getUpcomingDeadlines(teacherId) {
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 30);
        const tasks = await this.tasksRepository.find({
            where: {
                teacherId,
                dueDate: (0, typeorm_2.Between)(startDate, endDate),
            },
            relations: [
                'subjectAssignment',
                'subjectAssignment.subject',
                'subjectAssignment.classGroup',
                'submissions',
                'submissions.student',
                'submissions.student.user',
                'submissions.student.user.profile',
            ],
            order: {
                dueDate: 'ASC',
            },
        });
        const now = new Date();
        return tasks.map(task => {
            const totalStudents = task.subjectAssignment?.classGroup?.students?.length || 0;
            const submissionCount = task.submissions?.filter(s => s.status === 'submitted' || s.status === 'late').length || 0;
            const isOverdue = task.dueDate < now;
            const isDueToday = task.dueDate.toDateString() === now.toDateString();
            let status = 'upcoming';
            if (isOverdue)
                status = 'overdue';
            else if (isDueToday)
                status = 'due_today';
            return {
                id: task.id,
                title: task.title,
                dueDate: task.dueDate.toISOString(),
                subject: task.subjectAssignment?.subject?.name || 'Sin asignatura',
                classGroup: task.subjectAssignment?.classGroup?.name || 'Sin grupo',
                submissionCount,
                totalStudents,
                status,
            };
        });
    }
};
exports.TasksService = TasksService;
exports.TasksService = TasksService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.Task)),
    __param(1, (0, typeorm_1.InjectRepository)(entities_1.TaskSubmission)),
    __param(2, (0, typeorm_1.InjectRepository)(entities_1.TaskAttachment)),
    __param(3, (0, typeorm_1.InjectRepository)(entities_1.TaskSubmissionAttachment)),
    __param(4, (0, typeorm_1.InjectRepository)(teacher_entity_1.Teacher)),
    __param(5, (0, typeorm_1.InjectRepository)(student_entity_1.Student)),
    __param(6, (0, typeorm_1.InjectRepository)(subject_assignment_entity_1.SubjectAssignment)),
    __param(7, (0, typeorm_1.InjectRepository)(family_entity_1.Family)),
    __param(8, (0, typeorm_1.InjectRepository)(family_entity_1.FamilyStudent)),
    __param(9, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], TasksService);
//# sourceMappingURL=tasks.service.js.map