import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In } from 'typeorm';
import { Activity, ActivityValuationType } from './entities/activity.entity';
import { ActivityAssessment, EmojiValue } from './entities/activity-assessment.entity';
import { ActivityNotification } from './entities/activity-notification.entity';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { AssessActivityDto, BulkAssessActivityDto } from './dto/assess-activity.dto';
import { ActivityStatisticsDto, TeacherActivitySummaryDto } from './dto/activity-statistics.dto';
import { SubjectAssignmentWithStudentsDto } from './dto/subject-assignment-with-students.dto';
import { CreateFromTemplateDto } from './dto/activity-template.dto';
import { SubjectActivitySummaryDto } from './dto/subject-activity-summary.dto';
import { ClassGroup } from '../students/entities/class-group.entity';
import { Student } from '../students/entities/student.entity';
import { Family, FamilyStudent } from '../users/entities/family.entity';
import { Teacher } from '../teachers/entities/teacher.entity';
import { SubjectAssignment } from '../students/entities/subject-assignment.entity';

@Injectable()
export class ActivitiesService {
  constructor(
    @InjectRepository(Activity)
    private activitiesRepository: Repository<Activity>,
    @InjectRepository(ActivityAssessment)
    private assessmentsRepository: Repository<ActivityAssessment>,
    @InjectRepository(ActivityNotification)
    private notificationsRepository: Repository<ActivityNotification>,
    @InjectRepository(ClassGroup)
    private classGroupsRepository: Repository<ClassGroup>,
    @InjectRepository(Student)
    private studentsRepository: Repository<Student>,
    @InjectRepository(Family)
    private familiesRepository: Repository<Family>,
    @InjectRepository(FamilyStudent)
    private familyStudentsRepository: Repository<FamilyStudent>,
    @InjectRepository(Teacher)
    private teachersRepository: Repository<Teacher>,
    @InjectRepository(SubjectAssignment)
    private subjectAssignmentsRepository: Repository<SubjectAssignment>,
  ) {}

  // ==================== CRUD ACTIVIDADES ====================

  async create(createActivityDto: CreateActivityDto, teacherId: string): Promise<Activity> {
    // Verificar que el profesor tiene acceso a la asignación de asignatura
    await this.verifyTeacherSubjectAssignmentAccess(teacherId, createActivityDto.subjectAssignmentId);

    // Validar datos específicos del tipo de valoración
    if (createActivityDto.valuationType === ActivityValuationType.SCORE && !createActivityDto.maxScore) {
      throw new BadRequestException('maxScore es requerido para actividades de tipo score');
    }

    // Crear la actividad
    const activity = this.activitiesRepository.create({
      ...createActivityDto,
      teacherId,
      assignedDate: new Date(createActivityDto.assignedDate),
      reviewDate: createActivityDto.reviewDate ? new Date(createActivityDto.reviewDate) : null,
      // Configurar valores por defecto para notificaciones si no se especifican
      notifyOnHappy: createActivityDto.notifyOnHappy ?? false,
      notifyOnNeutral: createActivityDto.notifyOnNeutral ?? true,
      notifyOnSad: createActivityDto.notifyOnSad ?? true,
      // Nuevos campos
      isTemplate: createActivityDto.isTemplate ?? false,
      isArchived: false,
    });

    const savedActivity = await this.activitiesRepository.save(activity);

    // Crear registros de valoración para estudiantes específicos o todo el grupo
    const targetStudentIds = createActivityDto.targetStudentIds;
    await this.createAssessmentRecordsForActivity(savedActivity.id, createActivityDto.subjectAssignmentId, targetStudentIds);

    return this.findOne(savedActivity.id);
  }

  async findAll(
    teacherId: string,
    classGroupId?: string,
    startDate?: string,
    endDate?: string,
  ): Promise<Activity[]> {
    const query = this.activitiesRepository.createQueryBuilder('activity')
      .leftJoinAndSelect('activity.classGroup', 'classGroup')
      .leftJoinAndSelect('activity.teacher', 'teacher')
      .leftJoinAndSelect('activity.assessments', 'assessments')
      .leftJoinAndSelect('assessments.student', 'student')
      .leftJoinAndSelect('student.user', 'user')
      .leftJoinAndSelect('user.profile', 'profile')
      .where('activity.teacherId = :teacherId', { teacherId })
      .andWhere('activity.isActive = :isActive', { isActive: true });

    if (classGroupId) {
      query.andWhere('activity.classGroupId = :classGroupId', { classGroupId });
    }

    if (startDate && endDate) {
      query.andWhere('activity.assignedDate BETWEEN :startDate AND :endDate', {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      });
    }

    return query
      .orderBy('activity.assignedDate', 'DESC')
      .addOrderBy('activity.createdAt', 'DESC')
      .getMany();
  }

  async findOne(id: string): Promise<Activity> {
    const activity = await this.activitiesRepository.findOne({
      where: { id, isActive: true },
      relations: [
        'classGroup',
        'teacher',
        'teacher.user',
        'teacher.user.profile',
        'assessments',
        'assessments.student',
        'assessments.student.user',
        'assessments.student.user.profile',
      ],
    });

    if (!activity) {
      throw new NotFoundException(`Actividad con ID ${id} no encontrada`);
    }

    return activity;
  }

  async update(id: string, updateActivityDto: UpdateActivityDto, teacherId: string): Promise<Activity> {
    const activity = await this.findOne(id);

    // Verificar que el profesor es el propietario
    if (activity.teacherId !== teacherId) {
      throw new ForbiddenException('No tienes permisos para editar esta actividad');
    }

    // Validar cambios en tipo de valoración
    if (updateActivityDto.valuationType === ActivityValuationType.SCORE && !updateActivityDto.maxScore) {
      throw new BadRequestException('maxScore es requerido para actividades de tipo score');
    }

    const updateData: any = { ...updateActivityDto };
    if (updateActivityDto.assignedDate) {
      updateData.assignedDate = new Date(updateActivityDto.assignedDate);
    }
    if (updateActivityDto.reviewDate) {
      updateData.reviewDate = new Date(updateActivityDto.reviewDate);
    }

    await this.activitiesRepository.update(id, updateData);
    return this.findOne(id);
  }

  async remove(id: string, teacherId: string): Promise<void> {
    const activity = await this.findOne(id);

    if (activity.teacherId !== teacherId) {
      throw new ForbiddenException('No tienes permisos para eliminar esta actividad');
    }

    // Soft delete
    await this.activitiesRepository.update(id, { isActive: false });
  }

  // ==================== VALORACIONES ====================

  async assessStudent(
    activityId: string,
    studentId: string,
    assessDto: AssessActivityDto,
    teacherId: string,
    userId?: string,
  ): Promise<ActivityAssessment> {
    // Verificar que la actividad existe y el profesor tiene acceso
    const activity = await this.findOne(activityId);
    if (activity.teacherId !== teacherId) {
      throw new ForbiddenException('No tienes permisos para valorar esta actividad');
    }

    // Validar el valor según el tipo de actividad
    this.validateAssessmentValue(activity.valuationType, assessDto.value, activity.maxScore);

    // Buscar o crear el registro de valoración
    let assessment = await this.assessmentsRepository.findOne({
      where: { activityId, studentId },
    });

    if (!assessment) {
      throw new NotFoundException('Registro de valoración no encontrado');
    }

    // SOLUCION DEFINITIVA: Si no tenemos userId, buscar el userId del teacher
    let finalUserId = userId;
    if (!finalUserId) {
      const teacher = await this.teachersRepository.findOne({
        where: { id: teacherId },
        relations: ['user'],
        select: { id: true, user: { id: true } }
      });
      if (teacher?.user?.id) {
        finalUserId = teacher.user.id;
      } else {
        throw new BadRequestException('No se pudo encontrar el usuario asociado al profesor');
      }
    }

    // Actualizar la valoración
    assessment.value = assessDto.value;
    assessment.comment = assessDto.comment || null;
    assessment.assessedAt = new Date();
    assessment.assessedById = finalUserId; // Siempre usar un userId válido
    assessment.isAssessed = true;

    const savedAssessment = await this.assessmentsRepository.save(assessment);

    // Si la actividad tiene notificación habilitada, verificar si se debe notificar según el tipo de emoji
    if (activity.notifyFamilies && this.shouldNotifyFamily(activity, assessDto.value)) {
      await this.createFamilyNotification(savedAssessment.id, studentId);
    }

    return savedAssessment;
  }

  async bulkAssess(
    activityId: string,
    bulkAssessDto: BulkAssessActivityDto,
    teacherId: string,
    userId?: string,
  ): Promise<ActivityAssessment[]> {
    const activity = await this.findOne(activityId);
    if (activity.teacherId !== teacherId) {
      throw new ForbiddenException('No tienes permisos para valorar esta actividad');
    }

    this.validateAssessmentValue(activity.valuationType, bulkAssessDto.value, activity.maxScore);

    // SOLUCION DEFINITIVA: Si no tenemos userId, buscar el userId del teacher
    let finalUserId = userId;
    if (!finalUserId) {
      const teacher = await this.teachersRepository.findOne({
        where: { id: teacherId },
        relations: ['user'],
        select: { id: true, user: { id: true } }
      });
      if (teacher?.user?.id) {
        finalUserId = teacher.user.id;
      } else {
        throw new BadRequestException('No se pudo encontrar el usuario asociado al profesor');
      }
    }

    // Obtener estudiantes objetivo
    let targetStudentIds: string[];
    if (bulkAssessDto.studentIds && bulkAssessDto.studentIds.length > 0) {
      targetStudentIds = bulkAssessDto.studentIds;
    } else {
      // Obtener todos los estudiantes del grupo
      const classGroup = await this.classGroupsRepository.findOne({
        where: { id: activity.classGroupId },
        relations: ['students'],
      });
      targetStudentIds = classGroup.students.map(student => student.id);
    }

    // Actualizar valoraciones masivamente
    const assessments = await this.assessmentsRepository.find({
      where: {
        activityId,
        studentId: In(targetStudentIds),
      },
    });

    const updatedAssessments: ActivityAssessment[] = [];

    for (const assessment of assessments) {
      assessment.value = bulkAssessDto.value;
      assessment.comment = bulkAssessDto.comment || null;
      assessment.assessedAt = new Date();
      assessment.assessedById = finalUserId; // Siempre usar un userId válido
      assessment.isAssessed = true;

      const saved = await this.assessmentsRepository.save(assessment);
      updatedAssessments.push(saved);

      // Crear notificación si corresponde según configuración de emoji
      if (activity.notifyFamilies && this.shouldNotifyFamily(activity, bulkAssessDto.value)) {
        await this.createFamilyNotification(saved.id, assessment.studentId);
      }
    }

    return updatedAssessments;
  }

  // ==================== ESTADÍSTICAS ====================

  async getActivityStatistics(activityId: string, teacherId: string): Promise<ActivityStatisticsDto> {
    const activity = await this.findOne(activityId);
    if (activity.teacherId !== teacherId) {
      throw new ForbiddenException('No tienes permisos para ver estas estadísticas');
    }

    const assessments = activity.assessments;
    const totalStudents = assessments.length;
    const assessedStudents = assessments.filter(a => a.isAssessed).length;
    const pendingStudents = totalStudents - assessedStudents;

    const statistics: ActivityStatisticsDto = {
      activityId: activity.id,
      activityName: activity.name,
      totalStudents,
      assessedStudents,
      pendingStudents,
      completionPercentage: totalStudents > 0 ? Math.round((assessedStudents / totalStudents) * 100) : 0,
    };

    if (activity.valuationType === ActivityValuationType.EMOJI) {
      const emojiCounts = {
        happy: assessments.filter(a => a.value === EmojiValue.HAPPY).length,
        neutral: assessments.filter(a => a.value === EmojiValue.NEUTRAL).length,
        sad: assessments.filter(a => a.value === EmojiValue.SAD).length,
      };
      statistics.emojiDistribution = emojiCounts;
    } else if (activity.valuationType === ActivityValuationType.SCORE) {
      const scores = assessments
        .filter(a => a.isAssessed && a.value)
        .map(a => parseFloat(a.value))
        .filter(score => !isNaN(score));

      if (scores.length > 0) {
        statistics.scoreStatistics = {
          average: Math.round((scores.reduce((sum, score) => sum + score, 0) / scores.length) * 10) / 10,
          min: Math.min(...scores),
          max: Math.max(...scores),
          maxPossible: activity.maxScore || 10,
        };
      }
    }

    return statistics;
  }

  async getTeacherSummary(teacherId: string): Promise<TeacherActivitySummaryDto> {
    const today = new Date();
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
    const endOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 6));

    // Actividades de hoy
    const todayActivities = await this.activitiesRepository.count({
      where: {
        teacherId,
        isActive: true,
        assignedDate: new Date().toISOString().split('T')[0] as any,
      },
    });

    // Valoraciones pendientes
    const pendingAssessments = await this.assessmentsRepository
      .createQueryBuilder('assessment')
      .innerJoin('assessment.activity', 'activity')
      .where('activity.teacherId = :teacherId', { teacherId })
      .andWhere('activity.isActive = :isActive', { isActive: true })
      .andWhere('assessment.isAssessed = :isAssessed', { isAssessed: false })
      .getCount();

    // Valoraciones de esta semana
    const weekAssessments = await this.assessmentsRepository
      .createQueryBuilder('assessment')
      .innerJoin('assessment.activity', 'activity')
      .where('activity.teacherId = :teacherId', { teacherId })
      .andWhere('activity.isActive = :isActive', { isActive: true })
      .andWhere('assessment.isAssessed = :isAssessed', { isAssessed: true })
      .andWhere('assessment.assessedAt BETWEEN :startOfWeek AND :endOfWeek', {
        startOfWeek,
        endOfWeek,
      })
      .getCount();

    // Ratio de valoraciones positivas
    const positiveAssessments = await this.assessmentsRepository
      .createQueryBuilder('assessment')
      .innerJoin('assessment.activity', 'activity')
      .where('activity.teacherId = :teacherId', { teacherId })
      .andWhere('activity.isActive = :isActive', { isActive: true })
      .andWhere('assessment.isAssessed = :isAssessed', { isAssessed: true })
      .andWhere('assessment.value = :value', { value: EmojiValue.HAPPY })
      .getCount();

    const totalAssessments = await this.assessmentsRepository
      .createQueryBuilder('assessment')
      .innerJoin('assessment.activity', 'activity')
      .where('activity.teacherId = :teacherId', { teacherId })
      .andWhere('activity.isActive = :isActive', { isActive: true })
      .andWhere('assessment.isAssessed = :isAssessed', { isAssessed: true })
      .getCount();

    return {
      todayActivities,
      pendingAssessments,
      weekAssessments,
      positiveRatio: totalAssessments > 0 ? Math.round((positiveAssessments / totalAssessments) * 100) : 0,
    };
  }

  // ==================== MÉTODOS PARA FAMILIAS ====================

  async getFamilyActivities(familyUserId: string, studentId?: string, limit = 10): Promise<ActivityAssessment[]> {
    // Verificar acceso de la familia al estudiante
    if (studentId) {
      await this.verifyFamilyStudentAccess(familyUserId, studentId);
    }

    const query = this.assessmentsRepository
      .createQueryBuilder('assessment')
      .innerJoin('assessment.activity', 'activity')
      .innerJoin('assessment.student', 'student')
      .innerJoin('student.user', 'user')
      .innerJoin('user.profile', 'profile')
      .leftJoin('activity.teacher', 'teacher')
      .leftJoin('teacher.user', 'teacherUser')
      .leftJoin('teacherUser.profile', 'teacherProfile')
      .leftJoin('activity.subjectAssignment', 'subjectAssignment')
      .leftJoin('subjectAssignment.subject', 'subject')
      .leftJoin('subjectAssignment.classGroup', 'classGroup')
      .where('assessment.isAssessed = :isAssessed', { isAssessed: true })
      .andWhere('assessment.notifiedAt IS NOT NULL')
      .andWhere('activity.isActive = :isActive', { isActive: true });

    if (studentId) {
      query.andWhere('assessment.studentId = :studentId', { studentId });
    } else {
      // Obtener todos los estudiantes de la familia
      const familyStudents = await this.getFamilyStudentIds(familyUserId);
      query.andWhere('assessment.studentId IN (:...studentIds)', { studentIds: familyStudents });
    }

    return query
      .select([
        'assessment',
        'activity.id',
        'activity.name',
        'activity.description',
        'activity.assignedDate',
        'activity.valuationType',
        'activity.maxScore',
        'student.id',
        'user.id',
        'profile.firstName',
        'profile.lastName',
        'teacher.id',
        'teacherUser.id',
        'teacherProfile.firstName',
        'teacherProfile.lastName',
        'subjectAssignment.id',
        'subject.id',
        'subject.name',
        'subject.code',
        'classGroup.id',
        'classGroup.name',
      ])
      .orderBy('assessment.assessedAt', 'DESC')
      .limit(limit)
      .getMany();
  }

  // ==================== MÉTODOS AUXILIARES ====================

  private async createAssessmentRecords(activityId: string, classGroupId: string): Promise<void> {
    const classGroup = await this.classGroupsRepository.findOne({
      where: { id: classGroupId },
      relations: ['students'],
    });

    if (!classGroup) {
      throw new NotFoundException(`Grupo de clase con ID ${classGroupId} no encontrado`);
    }

    const assessmentRecords = classGroup.students.map(student => 
      this.assessmentsRepository.create({
        activityId,
        studentId: student.id,
        isAssessed: false,
      })
    );

    await this.assessmentsRepository.save(assessmentRecords);
  }

  private validateAssessmentValue(valuationType: ActivityValuationType, value: string, maxScore?: number): void {
    if (valuationType === ActivityValuationType.EMOJI) {
      if (!Object.values(EmojiValue).includes(value as EmojiValue)) {
        throw new BadRequestException(`Valor de emoji inválido: ${value}. Valores permitidos: ${Object.values(EmojiValue).join(', ')}`);
      }
    } else if (valuationType === ActivityValuationType.SCORE) {
      const numericValue = parseFloat(value);
      if (isNaN(numericValue) || numericValue < 0 || (maxScore && numericValue > maxScore)) {
        throw new BadRequestException(`Valor de puntuación inválido: ${value}. Debe ser un número entre 0 y ${maxScore}`);
      }
    }
  }

  private async verifyTeacherAccess(teacherId: string, classGroupId: string): Promise<void> {
    // Verificar si es tutor del grupo
    const tutoredClasses = await this.classGroupsRepository.find({
      where: { tutor: { id: teacherId } },
      select: ['id'],
    });

    const isTutor = tutoredClasses.some(cls => cls.id === classGroupId);
    
    if (isTutor) {
      return; // Tiene acceso como tutor
    }

    // Verificar si tiene asignaturas en el grupo
    const assignmentQuery = await this.classGroupsRepository
      .createQueryBuilder('classGroup')
      .innerJoin('subject_assignments', 'sa', 'sa.classGroupId = classGroup.id')
      .where('sa.teacherId = :teacherId', { teacherId })
      .andWhere('classGroup.id = :classGroupId', { classGroupId })
      .getCount();

    if (assignmentQuery === 0) {
      throw new ForbiddenException('No tienes acceso a este grupo de clase');
    }
  }

  private async createFamilyNotification(assessmentId: string, studentId: string): Promise<void> {
    try {
      // Obtener familias relacionadas con el estudiante
      const familyRelations = await this.familyStudentsRepository.find({
        where: { student: { id: studentId } },
        relations: ['family'],
      });

      for (const relation of familyRelations) {
        // Verificar si ya existe notificación
        const existingNotification = await this.notificationsRepository.findOne({
          where: {
            assessmentId,
            familyId: relation.family.id,
          },
        });

        if (!existingNotification) {
          const notification = this.notificationsRepository.create({
            assessmentId,
            familyId: relation.family.id,
          });
          await this.notificationsRepository.save(notification);
        }
      }

      // Marcar la valoración como notificada
      await this.assessmentsRepository.update(assessmentId, {
        notifiedAt: new Date(),
      });
    } catch (error) {
      console.error('Error creating family notification:', error);
      // No fallar la valoración por errores de notificación
    }
  }

  private async verifyFamilyStudentAccess(familyUserId: string, studentId: string): Promise<void> {
    const familyRelation = await this.familyStudentsRepository.findOne({
      where: [
        { family: { primaryContact: { id: familyUserId } }, student: { id: studentId } },
        { family: { secondaryContact: { id: familyUserId } }, student: { id: studentId } },
      ],
    });

    if (!familyRelation) {
      throw new ForbiddenException('No tienes acceso a las actividades de este estudiante');
    }
  }

  private async getFamilyStudentIds(familyUserId: string): Promise<string[]> {
    const familyRelations = await this.familyStudentsRepository.find({
      where: [
        { family: { primaryContact: { id: familyUserId } } },
        { family: { secondaryContact: { id: familyUserId } } },
      ],
      relations: ['student'],
    });

    return familyRelations.map(relation => relation.student.id);
  }

  private shouldNotifyFamily(activity: Activity, assessmentValue: string): boolean {
    // Para actividades de score, siempre notificar si está habilitado
    if (activity.valuationType === ActivityValuationType.SCORE) {
      return true;
    }

    // Para actividades de emoji, verificar configuración específica
    if (activity.valuationType === ActivityValuationType.EMOJI) {
      switch (assessmentValue) {
        case EmojiValue.HAPPY:
          return activity.notifyOnHappy;
        case EmojiValue.NEUTRAL:
          return activity.notifyOnNeutral;
        case EmojiValue.SAD:
          return activity.notifyOnSad;
        default:
          return false;
      }
    }

    return false;
  }

  private async getTeacherIdFromUserId(userId: string): Promise<string> {
    const teacher = await this.teachersRepository.findOne({
      where: { user: { id: userId } },
      select: ['id'],
    });

    if (!teacher) {
      throw new NotFoundException('Profesor no encontrado para este usuario');
    }

    return teacher.id;
  }

  // Wrapper methods that convert userId to teacherId
  async createByUserId(createActivityDto: CreateActivityDto, userId: string): Promise<Activity> {
    const teacherId = await this.getTeacherIdFromUserId(userId);
    return this.create(createActivityDto, teacherId);
  }

  async findAllByUserId(userId: string, classGroupId?: string, startDate?: string, endDate?: string): Promise<Activity[]> {
    const teacherId = await this.getTeacherIdFromUserId(userId);
    return this.findAll(teacherId, classGroupId, startDate, endDate);
  }

  async updateByUserId(id: string, updateActivityDto: UpdateActivityDto, userId: string): Promise<Activity> {
    const teacherId = await this.getTeacherIdFromUserId(userId);
    return this.update(id, updateActivityDto, teacherId);
  }

  async removeByUserId(id: string, userId: string): Promise<void> {
    const teacherId = await this.getTeacherIdFromUserId(userId);
    return this.remove(id, teacherId);
  }

  async assessStudentByUserId(activityId: string, studentId: string, assessDto: AssessActivityDto, userId: string): Promise<ActivityAssessment> {
    const teacherId = await this.getTeacherIdFromUserId(userId);
    return this.assessStudent(activityId, studentId, assessDto, teacherId, userId);
  }

  async bulkAssessByUserId(activityId: string, bulkAssessDto: BulkAssessActivityDto, userId: string): Promise<ActivityAssessment[]> {
    const teacherId = await this.getTeacherIdFromUserId(userId);
    return this.bulkAssess(activityId, bulkAssessDto, teacherId, userId);
  }

  async getActivityStatisticsByUserId(activityId: string, userId: string): Promise<ActivityStatisticsDto> {
    const teacherId = await this.getTeacherIdFromUserId(userId);
    return this.getActivityStatistics(activityId, teacherId);
  }

  async getTeacherSummaryByUserId(userId: string): Promise<TeacherActivitySummaryDto> {
    const teacherId = await this.getTeacherIdFromUserId(userId);
    return this.getTeacherSummary(teacherId);
  }

  // ==================== MÉTODOS POR ASIGNATURA ====================

  async getTeacherSubjectAssignments(teacherId: string): Promise<SubjectAssignmentWithStudentsDto[]> {
    const assignments = await this.subjectAssignmentsRepository.find({
      where: { teacher: { id: teacherId } },
      relations: [
        'subject',
        'classGroup',
        'classGroup.students',
        'classGroup.students.user',
        'classGroup.students.user.profile',
        'academicYear'
      ],
    });

    return assignments.map(assignment => ({
      id: assignment.id,
      subject: {
        id: assignment.subject.id,
        name: assignment.subject.name,
        code: assignment.subject.code,
      },
      classGroup: {
        id: assignment.classGroup.id,
        name: assignment.classGroup.name,
      },
      academicYear: {
        id: assignment.academicYear.id,
        name: assignment.academicYear.name,
      },
      weeklyHours: assignment.weeklyHours,
      students: assignment.classGroup.students.map(student => ({
        id: student.id,
        enrollmentNumber: student.enrollmentNumber,
        user: {
          profile: {
            firstName: student.user.profile.firstName,
            lastName: student.user.profile.lastName,
          }
        }
      })),
    }));
  }

  async getTeacherSubjectAssignmentsByUserId(userId: string): Promise<SubjectAssignmentWithStudentsDto[]> {
    const teacherId = await this.getTeacherIdFromUserId(userId);
    return this.getTeacherSubjectAssignments(teacherId);
  }

  async findActivitiesBySubjectAssignmentUserId(
    subjectAssignmentId: string,
    userId: string,
    includeArchived: boolean = false,
  ): Promise<Activity[]> {
    const teacherId = await this.getTeacherIdFromUserId(userId);
    return this.findActivitiesBySubjectAssignment(subjectAssignmentId, teacherId, includeArchived);
  }

  async getSubjectActivitySummaryByUserId(
    subjectAssignmentId: string,
    userId: string,
  ): Promise<SubjectActivitySummaryDto> {
    const teacherId = await this.getTeacherIdFromUserId(userId);
    return this.getSubjectActivitySummary(subjectAssignmentId, teacherId);
  }

  async getTeacherTemplatesByUserId(userId: string): Promise<Activity[]> {
    const teacherId = await this.getTeacherIdFromUserId(userId);
    return this.findTemplatesByTeacher(teacherId);
  }

  async createFromTemplateByUserId(
    createFromTemplateDto: CreateFromTemplateDto,
    userId: string,
  ): Promise<Activity> {
    const teacherId = await this.getTeacherIdFromUserId(userId);
    return this.createFromTemplate(createFromTemplateDto, teacherId);
  }

  async toggleArchiveByUserId(activityId: string, userId: string): Promise<Activity> {
    const teacherId = await this.getTeacherIdFromUserId(userId);
    const activity = await this.findOne(activityId);
    
    if (activity.teacherId !== teacherId) {
      throw new ForbiddenException('No tienes permisos para modificar esta actividad');
    }

    const newArchivedState = !activity.isArchived;
    await this.activitiesRepository.update(activityId, { isArchived: newArchivedState });
    
    return this.findOne(activityId);
  }

  async findActivitiesBySubjectAssignment(
    subjectAssignmentId: string,
    teacherId: string,
    includeArchived: boolean = false,
    includeTemplates: boolean = false
  ): Promise<Activity[]> {
    await this.verifyTeacherSubjectAssignmentAccess(teacherId, subjectAssignmentId);

    const query = this.activitiesRepository.createQueryBuilder('activity')
      .leftJoinAndSelect('activity.subjectAssignment', 'subjectAssignment')
      .leftJoinAndSelect('subjectAssignment.subject', 'subject')
      .leftJoinAndSelect('activity.classGroup', 'classGroup')
      .leftJoinAndSelect('activity.teacher', 'teacher')
      .leftJoinAndSelect('activity.assessments', 'assessments')
      .leftJoinAndSelect('assessments.student', 'student')
      .leftJoinAndSelect('student.user', 'user')
      .leftJoinAndSelect('user.profile', 'profile')
      .where('activity.subjectAssignmentId = :subjectAssignmentId', { subjectAssignmentId })
      .andWhere('activity.isActive = :isActive', { isActive: true });

    if (!includeArchived) {
      query.andWhere('activity.isArchived = :isArchived', { isArchived: false });
    }

    if (!includeTemplates) {
      query.andWhere('activity.isTemplate = :isTemplate', { isTemplate: false });
    }

    return query
      .orderBy('activity.assignedDate', 'DESC')
      .addOrderBy('activity.createdAt', 'DESC')
      .getMany();
  }

  async findTemplatesByTeacher(teacherId: string): Promise<Activity[]> {
    const query = this.activitiesRepository.createQueryBuilder('activity')
      .leftJoinAndSelect('activity.subjectAssignment', 'subjectAssignment')
      .leftJoinAndSelect('subjectAssignment.subject', 'subject')
      .leftJoinAndSelect('activity.classGroup', 'classGroup')
      .where('activity.teacherId = :teacherId', { teacherId })
      .andWhere('activity.isTemplate = :isTemplate', { isTemplate: true })
      .andWhere('activity.isActive = :isActive', { isActive: true });

    return query
      .orderBy('activity.createdAt', 'DESC')
      .getMany();
  }

  async createFromTemplate(createFromTemplateDto: CreateFromTemplateDto, teacherId: string): Promise<Activity> {
    const template = await this.activitiesRepository.findOne({
      where: { id: createFromTemplateDto.templateId, isTemplate: true },
      relations: ['subjectAssignment'],
    });

    if (!template) {
      throw new NotFoundException('Plantilla de actividad no encontrada');
    }

    if (template.teacherId !== teacherId) {
      throw new ForbiddenException('No tienes permisos para usar esta plantilla');
    }

    // Crear actividad desde plantilla
    const newActivity = this.activitiesRepository.create({
      name: template.name,
      description: template.description,
      assignedDate: new Date(createFromTemplateDto.assignedDate),
      reviewDate: createFromTemplateDto.reviewDate ? new Date(createFromTemplateDto.reviewDate) : null,
      valuationType: template.valuationType,
      maxScore: template.maxScore,
      notifyFamilies: template.notifyFamilies,
      notifyOnHappy: template.notifyOnHappy,
      notifyOnNeutral: template.notifyOnNeutral,
      notifyOnSad: template.notifyOnSad,
      classGroupId: template.classGroupId,
      teacherId: template.teacherId,
      subjectAssignmentId: template.subjectAssignmentId,
      isTemplate: false,
      isArchived: false,
    });

    const savedActivity = await this.activitiesRepository.save(newActivity);

    // Crear registros de valoración
    const targetStudentIds = createFromTemplateDto.targetStudentIds;
    await this.createAssessmentRecordsForActivity(savedActivity.id, template.subjectAssignmentId, targetStudentIds);

    return this.findOne(savedActivity.id);
  }

  async archiveActivity(activityId: string, teacherId: string): Promise<void> {
    const activity = await this.findOne(activityId);

    if (activity.teacherId !== teacherId) {
      throw new ForbiddenException('No tienes permisos para archivar esta actividad');
    }

    await this.activitiesRepository.update(activityId, { isArchived: true });
  }

  async unarchiveActivity(activityId: string, teacherId: string): Promise<void> {
    const activity = await this.findOne(activityId);

    if (activity.teacherId !== teacherId) {
      throw new ForbiddenException('No tienes permisos para desarchivar esta actividad');
    }

    await this.activitiesRepository.update(activityId, { isArchived: false });
  }

  async getSubjectActivitySummary(subjectAssignmentId: string, teacherId: string): Promise<SubjectActivitySummaryDto> {
    await this.verifyTeacherSubjectAssignmentAccess(teacherId, subjectAssignmentId);

    const subjectAssignment = await this.subjectAssignmentsRepository.findOne({
      where: { id: subjectAssignmentId },
      relations: ['subject', 'classGroup'],
    });

    if (!subjectAssignment) {
      throw new NotFoundException('Asignación de asignatura no encontrada');
    }

    // Contar actividades
    const totalActivities = await this.activitiesRepository.count({
      where: { subjectAssignmentId, isActive: true },
    });

    const activeActivities = await this.activitiesRepository.count({
      where: { subjectAssignmentId, isActive: true, isArchived: false, isTemplate: false },
    });

    const archivedActivities = await this.activitiesRepository.count({
      where: { subjectAssignmentId, isActive: true, isArchived: true },
    });

    const templatesCount = await this.activitiesRepository.count({
      where: { subjectAssignmentId, isActive: true, isTemplate: true },
    });

    // Valoraciones pendientes
    const pendingAssessments = await this.assessmentsRepository
      .createQueryBuilder('assessment')
      .innerJoin('assessment.activity', 'activity')
      .where('activity.subjectAssignmentId = :subjectAssignmentId', { subjectAssignmentId })
      .andWhere('activity.isActive = :isActive', { isActive: true })
      .andWhere('activity.isArchived = :isArchived', { isArchived: false })
      .andWhere('assessment.isAssessed = :isAssessed', { isAssessed: false })
      .getCount();

    // Valoraciones de esta semana
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    const endOfWeek = new Date();
    endOfWeek.setDate(endOfWeek.getDate() - endOfWeek.getDay() + 6);

    const weekCompletedAssessments = await this.assessmentsRepository
      .createQueryBuilder('assessment')
      .innerJoin('assessment.activity', 'activity')
      .where('activity.subjectAssignmentId = :subjectAssignmentId', { subjectAssignmentId })
      .andWhere('activity.isActive = :isActive', { isActive: true })
      .andWhere('assessment.isAssessed = :isAssessed', { isAssessed: true })
      .andWhere('assessment.assessedAt BETWEEN :startOfWeek AND :endOfWeek', {
        startOfWeek,
        endOfWeek,
      })
      .getCount();

    // Ratio positivo
    const positiveAssessments = await this.assessmentsRepository
      .createQueryBuilder('assessment')
      .innerJoin('assessment.activity', 'activity')
      .where('activity.subjectAssignmentId = :subjectAssignmentId', { subjectAssignmentId })
      .andWhere('activity.isActive = :isActive', { isActive: true })
      .andWhere('assessment.isAssessed = :isAssessed', { isAssessed: true })
      .andWhere('assessment.value = :value', { value: 'happy' })
      .getCount();

    const totalAssessments = await this.assessmentsRepository
      .createQueryBuilder('assessment')
      .innerJoin('assessment.activity', 'activity')
      .where('activity.subjectAssignmentId = :subjectAssignmentId', { subjectAssignmentId })
      .andWhere('activity.isActive = :isActive', { isActive: true })
      .andWhere('assessment.isAssessed = :isAssessed', { isAssessed: true })
      .getCount();

    // Última actividad
    const lastActivity = await this.activitiesRepository.findOne({
      where: { subjectAssignmentId, isActive: true },
      order: { createdAt: 'DESC' },
    });

    return {
      subjectAssignmentId,
      subjectName: subjectAssignment.subject.name,
      subjectCode: subjectAssignment.subject.code,
      classGroupName: subjectAssignment.classGroup.name,
      totalActivities,
      activeActivities,
      archivedActivities,
      templatesCount,
      pendingAssessments,
      weekCompletedAssessments,
      positiveRatio: totalAssessments > 0 ? Math.round((positiveAssessments / totalAssessments) * 100) : 0,
      lastActivityDate: lastActivity?.createdAt,
    };
  }

  // ==================== MÉTODOS AUXILIARES EXTENDIDOS ====================

  private async verifyTeacherSubjectAssignmentAccess(teacherId: string, subjectAssignmentId: string): Promise<void> {
    const assignment = await this.subjectAssignmentsRepository.findOne({
      where: { id: subjectAssignmentId, teacher: { id: teacherId } },
    });

    if (!assignment) {
      throw new ForbiddenException('No tienes acceso a esta asignación de asignatura');
    }
  }

  private async createAssessmentRecordsForActivity(
    activityId: string,
    subjectAssignmentId: string,
    targetStudentIds?: string[]
  ): Promise<void> {
    const subjectAssignment = await this.subjectAssignmentsRepository.findOne({
      where: { id: subjectAssignmentId },
      relations: ['classGroup', 'classGroup.students'],
    });

    if (!subjectAssignment) {
      throw new NotFoundException('Asignación de asignatura no encontrada');
    }

    let studentsToAssess = subjectAssignment.classGroup.students;

    // Si se especificaron estudiantes específicos, filtrar
    if (targetStudentIds && targetStudentIds.length > 0) {
      studentsToAssess = studentsToAssess.filter(student => 
        targetStudentIds.includes(student.id)
      );
    }

    const assessmentRecords = studentsToAssess.map(student => 
      this.assessmentsRepository.create({
        activityId,
        studentId: student.id,
        isAssessed: false,
      })
    );

    await this.assessmentsRepository.save(assessmentRecords);
  }
}