import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In, Like } from 'typeorm';
import {
  Task,
  TaskSubmission,
  TaskAttachment,
  TaskSubmissionAttachment,
  TaskStatus,
  TaskType,
  SubmissionStatus,
  AttachmentType,
  SubmissionAttachmentStatus,
} from './entities';
import {
  CreateTaskDto,
  UpdateTaskDto,
  SubmitTaskDto,
  GradeTaskDto,
  TaskQueryDto,
  StudentTaskQueryDto,
  FamilyTaskQueryDto,
  TaskStatisticsDto,
  StudentTaskStatisticsDto,
  SubjectTaskSummaryDto,
} from './dto';
import { Teacher } from '../teachers/entities/teacher.entity';
import { Student } from '../students/entities/student.entity';
import { SubjectAssignment } from '../students/entities/subject-assignment.entity';
import { Family, FamilyStudent } from '../users/entities/family.entity';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>,
    @InjectRepository(TaskSubmission)
    private submissionsRepository: Repository<TaskSubmission>,
    @InjectRepository(TaskAttachment)
    private attachmentsRepository: Repository<TaskAttachment>,
    @InjectRepository(TaskSubmissionAttachment)
    private submissionAttachmentsRepository: Repository<TaskSubmissionAttachment>,
    @InjectRepository(Teacher)
    private teachersRepository: Repository<Teacher>,
    @InjectRepository(Student)
    private studentsRepository: Repository<Student>,
    @InjectRepository(SubjectAssignment)
    private subjectAssignmentsRepository: Repository<SubjectAssignment>,
    @InjectRepository(Family)
    private familiesRepository: Repository<Family>,
    @InjectRepository(FamilyStudent)
    private familyStudentsRepository: Repository<FamilyStudent>,
  ) {}

  // ==================== CRUD TAREAS (PROFESORES) ====================

  async create(createTaskDto: CreateTaskDto, userId: string): Promise<Task> {
    // Obtener el teacher ID a partir del user ID
    const teacher = await this.teachersRepository.findOne({
      where: { user: { id: userId } },
    });

    if (!teacher) {
      throw new NotFoundException('Profesor no encontrado');
    }

    // Verificar que el profesor tiene acceso a la asignación de asignatura
    await this.verifyTeacherSubjectAssignmentAccess(teacher.id, createTaskDto.subjectAssignmentId);

    // Validar fechas
    const assignedDate = new Date(createTaskDto.assignedDate);
    const dueDate = new Date(createTaskDto.dueDate);
    
    if (dueDate <= assignedDate) {
      throw new BadRequestException('La fecha de entrega debe ser posterior a la fecha de asignación');
    }

    // Crear la tarea
    const task = this.tasksRepository.create({
      ...createTaskDto,
      teacherId: teacher.id,
      assignedDate,
      dueDate,
      allowedFileTypes: createTaskDto.allowedFileTypes ? JSON.stringify(createTaskDto.allowedFileTypes) : null,
      maxFileSize: createTaskDto.maxFileSizeMB ? createTaskDto.maxFileSizeMB * 1024 * 1024 : null, // Convertir MB a bytes
      status: TaskStatus.DRAFT, // Siempre empieza como borrador
    });

    const savedTask = await this.tasksRepository.save(task);

    // Para tareas tipo EXAM (Test Yourself), crear notificaciones en lugar de registros de entrega
    if (savedTask.taskType === TaskType.EXAM) {
      await this.createNotificationsForExamTask(savedTask.id, createTaskDto.subjectAssignmentId, createTaskDto.targetStudentIds);
    } else {
      // Crear registros de entrega para otros tipos de tareas
      await this.createSubmissionRecordsForTask(savedTask.id, createTaskDto.subjectAssignmentId, createTaskDto.targetStudentIds);
    }

    return this.findOne(savedTask.id);
  }

  async findAllByTeacher(userId: string, query: TaskQueryDto): Promise<{ tasks: Task[]; total: number }> {
    // Obtener el teacher ID a partir del user ID
    const teacher = await this.teachersRepository.findOne({
      where: { user: { id: userId } },
    });

    if (!teacher) {
      throw new NotFoundException('Profesor no encontrado');
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

    // Aplicar filtros
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
        .andWhere('task.status = :publishedStatus', { publishedStatus: TaskStatus.PUBLISHED });
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

  async findOne(id: string): Promise<Task> {
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
      throw new NotFoundException('Tarea no encontrada');
    }

    return task;
  }

  async update(id: string, updateTaskDto: UpdateTaskDto, userId: string): Promise<Task> {
    const task = await this.findOne(id);
    
    // Obtener el teacher ID a partir del user ID
    const teacher = await this.teachersRepository.findOne({
      where: { user: { id: userId } },
    });

    if (!teacher) {
      throw new NotFoundException('Profesor no encontrado');
    }
    
    // Verificar que el profesor es el propietario
    if (task.teacherId !== teacher.id) {
      throw new ForbiddenException('No tienes permisos para editar esta tarea');
    }

    // Si se está publicando, validar que tenga contenido mínimo
    if (updateTaskDto.status === TaskStatus.PUBLISHED) {
      if (!task.title || !task.dueDate) {
        throw new BadRequestException('Para publicar una tarea debe tener al menos título y fecha de entrega');
      }
      updateTaskDto.publishedAt = new Date();
    }

    // Si se está cerrando
    if (updateTaskDto.status === TaskStatus.CLOSED) {
      updateTaskDto.closedAt = new Date();
    }

    // Procesar campos especiales
    const updateData: any = { ...updateTaskDto };
    
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

  async remove(id: string, userId: string): Promise<void> {
    const task = await this.findOne(id);
    
    // Obtener el teacher ID a partir del user ID
    const teacher = await this.teachersRepository.findOne({
      where: { user: { id: userId } },
    });

    if (!teacher) {
      throw new NotFoundException('Profesor no encontrado');
    }
    
    if (task.teacherId !== teacher.id) {
      throw new ForbiddenException('No tienes permisos para eliminar esta tarea');
    }

    // Solo permitir eliminar si no hay entregas o está en borrador
    if (task.status === TaskStatus.PUBLISHED && task.submissions.some(s => s.status !== SubmissionStatus.NOT_SUBMITTED)) {
      throw new BadRequestException('No se puede eliminar una tarea publicada con entregas realizadas');
    }

    await this.tasksRepository.update(id, { isActive: false });
  }

  // ==================== ENTREGAS (ESTUDIANTES) ====================

  async submitTask(taskId: string, submitDto: SubmitTaskDto, studentId: string): Promise<TaskSubmission> {
    const task = await this.findOne(taskId);
    
    // Verificar que la tarea está publicada
    if (task.status !== TaskStatus.PUBLISHED) {
      throw new BadRequestException('No se puede entregar una tarea que no está publicada');
    }

    // Verificar que no es una tarea tipo EXAM (Test Yourself)
    if (task.taskType === TaskType.EXAM) {
      throw new BadRequestException('Las tareas de tipo "Test Yourself" no requieren entrega digital. Son recordatorios de examen.');
    }

    // Verificar que el estudiante está asignado a esta tarea
    const submission = await this.submissionsRepository.findOne({
      where: { taskId, studentId },
      relations: ['attachments'],
    });

    if (!submission) {
      throw new NotFoundException('No tienes esta tarea asignada');
    }

    // Verificar si ya fue entregada y no permite reenvíos
    if (submission.status === SubmissionStatus.SUBMITTED && !submission.needsRevision) {
      throw new BadRequestException('Esta tarea ya fue entregada');
    }

    // Verificar si requiere archivo y no hay adjuntos
    if (task.requiresFile && (!submission.attachments || submission.attachments.length === 0)) {
      throw new BadRequestException('Esta tarea requiere un archivo adjunto');
    }

    const now = new Date();
    const isLate = now > task.dueDate;

    // Verificar entregas tardías
    if (isLate && !task.allowLateSubmission) {
      throw new BadRequestException('Ya no se aceptan entregas para esta tarea');
    }

    // Actualizar la entrega
    const updateData: Partial<TaskSubmission> = {
      content: submitDto.content,
      submissionNotes: submitDto.submissionNotes,
      submittedAt: now,
      isLate,
      status: isLate ? SubmissionStatus.LATE : SubmissionStatus.SUBMITTED,
      needsRevision: false,
    };

    // Si es la primera entrega
    if (!submission.firstSubmittedAt) {
      updateData.firstSubmittedAt = now;
      updateData.attemptNumber = 1;
    } else {
      updateData.attemptNumber = submission.attemptNumber + 1;
    }

    await this.submissionsRepository.update(submission.id, updateData);

    return this.submissionsRepository.findOne({
      where: { id: submission.id },
      relations: ['task', 'student', 'student.user', 'student.user.profile', 'attachments'],
    });
  }

  private async resolveStudentIdFromUserId(userId: string): Promise<string> {
    const student = await this.studentsRepository.findOne({
      where: { user: { id: userId } },
    });
    
    if (!student) {
      throw new NotFoundException('Estudiante no encontrado');
    }
    
    return student.id;
  }

  async getStudentTasks(userId: string, query: StudentTaskQueryDto): Promise<{ tasks: Task[]; total: number }> {
    // Resolver userId a studentId
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
      .where('task.status = :publishedStatus', { publishedStatus: TaskStatus.PUBLISHED })
      .andWhere('task.isActive = :isActive', { isActive: true })
      .setParameter('studentId', studentId);

    // Solo mostrar tareas donde el estudiante tiene una entrega asignada
    queryBuilder.andWhere(
      'EXISTS (SELECT 1 FROM task_submissions ts WHERE ts."taskId" = task.id AND ts."studentId" = :studentId)',
      { studentId }
    );

    // Aplicar filtros
    if (query.submissionStatus) {
      queryBuilder.andWhere('submissions.status = :submissionStatus', { submissionStatus: query.submissionStatus });
    }

    if (query.onlyPending) {
      queryBuilder.andWhere('submissions.status IN (:...pendingStatuses)', {
        pendingStatuses: [SubmissionStatus.NOT_SUBMITTED, SubmissionStatus.RETURNED],
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

  // ==================== CALIFICACIÓN (PROFESORES) ====================

  async gradeSubmission(submissionId: string, gradeDto: GradeTaskDto, userId: string): Promise<TaskSubmission> {
    const submission = await this.submissionsRepository.findOne({
      where: { id: submissionId },
      relations: ['task', 'student', 'student.user', 'student.user.profile'],
    });

    if (!submission) {
      throw new NotFoundException('Entrega no encontrada');
    }

    // Obtener el teacher ID a partir del user ID
    const teacher = await this.teachersRepository.findOne({
      where: { user: { id: userId } },
    });

    if (!teacher) {
      throw new NotFoundException('Profesor no encontrado');
    }

    // Verificar que el profesor es propietario de la tarea
    if (submission.task.teacherId !== teacher.id) {
      throw new ForbiddenException('No tienes permisos para calificar esta entrega');
    }

    // Verificar que la entrega fue realizada
    if (submission.status === SubmissionStatus.NOT_SUBMITTED) {
      throw new BadRequestException('No se puede calificar una entrega no realizada');
    }

    // Calcular nota final aplicando penalizaciones
    let finalGrade = gradeDto.grade;
    if (submission.isLate && submission.task.latePenalty > 0) {
      finalGrade = gradeDto.grade * (1 - submission.task.latePenalty);
    }

    const updateData: Partial<TaskSubmission> = {
      grade: gradeDto.grade,
      finalGrade,
      teacherFeedback: gradeDto.teacherFeedback,
      privateNotes: gradeDto.privateNotes,
      needsRevision: gradeDto.needsRevision || false,
      isGraded: true,
      gradedAt: new Date(),
      status: gradeDto.needsRevision ? SubmissionStatus.RETURNED : SubmissionStatus.GRADED,
    };

    await this.submissionsRepository.update(submissionId, updateData);

    return this.submissionsRepository.findOne({
      where: { id: submissionId },
      relations: ['task', 'student', 'student.user', 'student.user.profile', 'attachments'],
    });
  }

  // ==================== ESTADÍSTICAS ====================

  async getTeacherStatistics(userId: string): Promise<TaskStatisticsDto> {
    // Obtener el teacher ID a partir del user ID
    const teacher = await this.teachersRepository.findOne({
      where: { user: { id: userId } },
    });

    if (!teacher) {
      throw new NotFoundException('Profesor no encontrado');
    }

    const tasks = await this.tasksRepository.find({
      where: { teacherId: teacher.id, isActive: true },
      relations: ['submissions'],
    });

    const totalTasks = tasks.length;
    const publishedTasks = tasks.filter(t => t.status === TaskStatus.PUBLISHED).length;
    const draftTasks = tasks.filter(t => t.status === TaskStatus.DRAFT).length;
    const closedTasks = tasks.filter(t => t.status === TaskStatus.CLOSED).length;
    const overdueTasks = tasks.filter(t => t.isOverdue).length;

    const allSubmissions = tasks.flatMap(t => t.submissions);
    const totalSubmissions = allSubmissions.length;
    const gradedSubmissions = allSubmissions.filter(s => s.isGraded).length;
    const pendingSubmissions = allSubmissions.filter(s => s.status === SubmissionStatus.NOT_SUBMITTED).length;
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

  async getStudentStatistics(userId: string): Promise<StudentTaskStatisticsDto> {
    // Resolver userId a studentId
    const studentId = await this.resolveStudentIdFromUserId(userId);
    const submissions = await this.submissionsRepository.find({
      where: { studentId },
      relations: ['task'],
    });

    const totalAssigned = submissions.length;
    const submitted = submissions.filter(s => s.status !== SubmissionStatus.NOT_SUBMITTED).length;
    const pending = submissions.filter(s => s.status === SubmissionStatus.NOT_SUBMITTED).length;
    const graded = submissions.filter(s => s.isGraded).length;
    const lateSubmissions = submissions.filter(s => s.isLate).length;

    const gradesSubmissions = submissions.filter(s => s.finalGrade !== null && s.finalGrade !== undefined);
    const averageGrade = gradesSubmissions.length > 0 
      ? gradesSubmissions.reduce((sum, s) => sum + s.finalGrade, 0) / gradesSubmissions.length 
      : 0;

    const submissionRate = totalAssigned > 0 ? (submitted / totalAssigned) * 100 : 0;

    // Próxima fecha de entrega
    const pendingTasks = submissions
      .filter(s => s.status === SubmissionStatus.NOT_SUBMITTED)
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

  // ==================== MÉTODOS AUXILIARES ====================

  private async verifyTeacherSubjectAssignmentAccess(teacherId: string, subjectAssignmentId: string): Promise<void> {
    const subjectAssignment = await this.subjectAssignmentsRepository.findOne({
      where: { id: subjectAssignmentId },
      relations: ['teacher'],
    });

    if (!subjectAssignment) {
      throw new NotFoundException('Asignación de asignatura no encontrada');
    }

    if (subjectAssignment.teacherId !== teacherId) {
      throw new ForbiddenException('No tienes permisos para asignar tareas en esta asignatura');
    }
  }

  private async createSubmissionRecordsForTask(taskId: string, subjectAssignmentId: string, targetStudentIds?: string[]): Promise<void> {
    const subjectAssignment = await this.subjectAssignmentsRepository.findOne({
      where: { id: subjectAssignmentId },
      relations: ['classGroup', 'classGroup.students'],
    });

    if (!subjectAssignment) {
      throw new NotFoundException('Asignación de asignatura no encontrada');
    }

    let students = subjectAssignment.classGroup.students;

    // Si se especificaron estudiantes objetivo, filtrar
    if (targetStudentIds && targetStudentIds.length > 0) {
      students = students.filter(student => targetStudentIds.includes(student.id));
    }

    const submissions = students.map(student => 
      this.submissionsRepository.create({
        taskId,
        studentId: student.id,
        status: SubmissionStatus.NOT_SUBMITTED,
      })
    );

    await this.submissionsRepository.save(submissions);
  }

  private async createNotificationsForExamTask(taskId: string, subjectAssignmentId: string, targetStudentIds?: string[]): Promise<void> {
    const subjectAssignment = await this.subjectAssignmentsRepository.findOne({
      where: { id: subjectAssignmentId },
      relations: ['classGroup', 'classGroup.students', 'classGroup.students.user', 'classGroup.students.user.profile'],
    });

    if (!subjectAssignment) {
      throw new NotFoundException('Asignación de asignatura no encontrada');
    }

    let students = subjectAssignment.classGroup.students;

    // Si se especificaron estudiantes objetivo, filtrar
    if (targetStudentIds && targetStudentIds.length > 0) {
      students = students.filter(student => targetStudentIds.includes(student.id));
    }

    // Crear registros especiales para exámenes que no requieren entrega
    // pero sí permiten seguimiento para calendario futuro
    const examRecords = students.map(student => 
      this.submissionsRepository.create({
        taskId,
        studentId: student.id,
        status: SubmissionStatus.NOT_SUBMITTED,
        isExamNotification: true, // Campo especial para distinguir notificaciones de examen
        content: 'Recordatorio de examen - No requiere entrega digital',
      })
    );

    await this.submissionsRepository.save(examRecords);

    // TODO: Aquí se implementarían las notificaciones reales
    // - Notificaciones push a padres
    // - Recordatorios en calendario para estudiantes
    // - Integración con sistema de notificaciones existente
  }

  // ==================== MÉTODOS PARA FAMILIAS ====================

  async getFamilyTasks(familyId: string, query: FamilyTaskQueryDto): Promise<{ tasks: Task[]; total: number }> {
    // Verificar acceso familiar
    const studentIds = await this.getFamilyStudentIds(familyId);
    
    if (studentIds.length === 0) {
      throw new NotFoundException('No se encontraron estudiantes asociados a esta familia');
    }

    // Si se especifica un estudiante, verificar que pertenece a la familia
    let targetStudentIds = studentIds;
    if (query.studentId) {
      if (!studentIds.includes(query.studentId)) {
        throw new ForbiddenException('No tienes acceso a los datos de este estudiante');
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
      .where('task.status = :publishedStatus', { publishedStatus: TaskStatus.PUBLISHED })
      .andWhere('task.isActive = :isActive', { isActive: true })
      .andWhere(
        'EXISTS (SELECT 1 FROM task_submissions ts WHERE ts."taskId" = task.id AND ts."studentId" IN (:...studentIds))',
        { studentIds: targetStudentIds }
      )
      .setParameter('studentIds', targetStudentIds);

    // Aplicar filtros específicos de familias
    if (query.submissionStatus) {
      queryBuilder.andWhere('submissions.status = :submissionStatus', { submissionStatus: query.submissionStatus });
    }

    if (query.onlyPending) {
      queryBuilder.andWhere('submissions.status IN (:...pendingStatuses)', {
        pendingStatuses: [SubmissionStatus.NOT_SUBMITTED, SubmissionStatus.RETURNED],
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

  private async getFamilyStudentIds(familyId: string): Promise<string[]> {
    const familyStudents = await this.familyStudentsRepository.find({
      where: { familyId },
      relations: ['student'],
    });

    return familyStudents.map(fs => fs.studentId);
  }

  // ==================== GESTIÓN DE ARCHIVOS ADJUNTOS ====================

  async uploadTaskAttachments(taskId: string, files: Express.Multer.File[], userId: string, descriptions?: string[]): Promise<void> {
    const task = await this.findOne(taskId);
    
    // Obtener el teacher ID a partir del user ID
    const teacher = await this.teachersRepository.findOne({
      where: { user: { id: userId } },
    });

    if (!teacher) {
      throw new NotFoundException('Profesor no encontrado');
    }
    
    if (task.teacherId !== teacher.id) {
      throw new ForbiddenException('No tienes permisos para subir archivos a esta tarea');
    }

    const attachments = files.map((file, index) => 
      this.attachmentsRepository.create({
        taskId,
        filename: file.filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        path: file.path,
        type: this.getFileTypeFromMimeType(file.mimetype),
        description: descriptions?.[index] || `Archivo adjunto: ${file.originalname}`,
        downloadCount: 0,
      })
    );

    await this.attachmentsRepository.save(attachments);
  }

  async uploadSubmissionAttachments(submissionId: string, files: Express.Multer.File[], studentId: string, descriptions?: string[]): Promise<void> {
    const submission = await this.submissionsRepository.findOne({
      where: { id: submissionId },
      relations: ['task'],
    });

    if (!submission) {
      throw new NotFoundException('Entrega no encontrada');
    }

    if (submission.studentId !== studentId) {
      throw new ForbiddenException('No tienes permisos para subir archivos a esta entrega');
    }

    // Verificar si la tarea aún acepta entregas
    if (submission.task.status === TaskStatus.CLOSED) {
      throw new BadRequestException('Esta tarea ya está cerrada');
    }

    // Obtener el número de versión más alto existente
    const maxVersion = await this.submissionAttachmentsRepository.maximum('version', { submissionId }) || 0;

    const attachments = files.map((file, index) => 
      this.submissionAttachmentsRepository.create({
        submissionId,
        filename: file.filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        path: file.path,
        status: SubmissionAttachmentStatus.UPLOADED,
        description: descriptions?.[index] || `Archivo de entrega: ${file.originalname}`,
        isMainSubmission: index === 0 && !descriptions, // Primer archivo es principal si no hay descripción específica
        version: maxVersion + 1,
      })
    );

    await this.submissionAttachmentsRepository.save(attachments);
  }

  async downloadAttachment(attachmentId: string, type: 'task' | 'submission' = 'task'): Promise<{ filePath: string; originalName: string }> {
    let attachment: any;
    
    if (type === 'task') {
      attachment = await this.attachmentsRepository.findOne({ where: { id: attachmentId } });
      if (attachment) {
        // Incrementar contador de descargas
        await this.attachmentsRepository.update(attachmentId, { 
          downloadCount: attachment.downloadCount + 1 
        });
      }
    } else {
      attachment = await this.submissionAttachmentsRepository.findOne({ where: { id: attachmentId } });
    }

    if (!attachment) {
      throw new NotFoundException('Archivo no encontrado');
    }

    return {
      filePath: attachment.path,
      originalName: attachment.originalName,
    };
  }

  async deleteTaskAttachment(attachmentId: string, userId: string): Promise<void> {
    const attachment = await this.attachmentsRepository.findOne({
      where: { id: attachmentId },
      relations: ['task'],
    });

    if (!attachment) {
      throw new NotFoundException('Archivo no encontrado');
    }

    // Obtener el teacher ID a partir del user ID
    const teacher = await this.teachersRepository.findOne({
      where: { user: { id: userId } },
    });

    if (!teacher) {
      throw new NotFoundException('Profesor no encontrado');
    }

    if (attachment.task.teacherId !== teacher.id) {
      throw new ForbiddenException('No tienes permisos para eliminar este archivo');
    }

    await this.attachmentsRepository.remove(attachment);
  }

  async deleteSubmissionAttachment(attachmentId: string, studentId: string): Promise<void> {
    const attachment = await this.submissionAttachmentsRepository.findOne({
      where: { id: attachmentId },
      relations: ['submission'],
    });

    if (!attachment) {
      throw new NotFoundException('Archivo no encontrado');
    }

    if (attachment.submission.studentId !== studentId) {
      throw new ForbiddenException('No tienes permisos para eliminar este archivo');
    }

    await this.submissionAttachmentsRepository.remove(attachment);
  }

  private getFileTypeFromMimeType(mimeType: string): AttachmentType {
    // Map MIME types to general purpose attachment types
    if (mimeType.startsWith('image/')) {
      return AttachmentType.EXAMPLE; // Images typically serve as examples
    }
    
    if (mimeType === 'application/pdf' || 
        mimeType.includes('document') || 
        mimeType === 'text/plain') {
      return AttachmentType.INSTRUCTION; // Documents are typically instructions
    }
    
    if (mimeType.includes('spreadsheet') || 
        mimeType.includes('excel')) {
      return AttachmentType.TEMPLATE; // Spreadsheets are often templates
    }
    
    if (mimeType.includes('presentation') || 
        mimeType.includes('powerpoint')) {
      return AttachmentType.REFERENCE; // Presentations are often reference material
    }
    
    // Default to resource for other types
    return AttachmentType.RESOURCE;
  }
}