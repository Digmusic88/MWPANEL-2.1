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
exports.ActivitiesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const activity_entity_1 = require("./entities/activity.entity");
const activity_assessment_entity_1 = require("./entities/activity-assessment.entity");
const activity_notification_entity_1 = require("./entities/activity-notification.entity");
const class_group_entity_1 = require("../students/entities/class-group.entity");
const student_entity_1 = require("../students/entities/student.entity");
const family_entity_1 = require("../users/entities/family.entity");
const teacher_entity_1 = require("../teachers/entities/teacher.entity");
const subject_assignment_entity_1 = require("../students/entities/subject-assignment.entity");
let ActivitiesService = class ActivitiesService {
    constructor(activitiesRepository, assessmentsRepository, notificationsRepository, classGroupsRepository, studentsRepository, familiesRepository, familyStudentsRepository, teachersRepository, subjectAssignmentsRepository) {
        this.activitiesRepository = activitiesRepository;
        this.assessmentsRepository = assessmentsRepository;
        this.notificationsRepository = notificationsRepository;
        this.classGroupsRepository = classGroupsRepository;
        this.studentsRepository = studentsRepository;
        this.familiesRepository = familiesRepository;
        this.familyStudentsRepository = familyStudentsRepository;
        this.teachersRepository = teachersRepository;
        this.subjectAssignmentsRepository = subjectAssignmentsRepository;
    }
    async create(createActivityDto, teacherId) {
        await this.verifyTeacherSubjectAssignmentAccess(teacherId, createActivityDto.subjectAssignmentId);
        if (createActivityDto.valuationType === activity_entity_1.ActivityValuationType.SCORE && !createActivityDto.maxScore) {
            throw new common_1.BadRequestException('maxScore es requerido para actividades de tipo score');
        }
        const activity = this.activitiesRepository.create({
            ...createActivityDto,
            teacherId,
            assignedDate: new Date(createActivityDto.assignedDate),
            reviewDate: createActivityDto.reviewDate ? new Date(createActivityDto.reviewDate) : null,
            notifyOnHappy: createActivityDto.notifyOnHappy ?? false,
            notifyOnNeutral: createActivityDto.notifyOnNeutral ?? true,
            notifyOnSad: createActivityDto.notifyOnSad ?? true,
            isTemplate: createActivityDto.isTemplate ?? false,
            isArchived: false,
        });
        const savedActivity = await this.activitiesRepository.save(activity);
        const targetStudentIds = createActivityDto.targetStudentIds;
        await this.createAssessmentRecordsForActivity(savedActivity.id, createActivityDto.subjectAssignmentId, targetStudentIds);
        return this.findOne(savedActivity.id);
    }
    async findAll(teacherId, classGroupId, startDate, endDate) {
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
    async findOne(id) {
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
            throw new common_1.NotFoundException(`Actividad con ID ${id} no encontrada`);
        }
        return activity;
    }
    async update(id, updateActivityDto, teacherId) {
        const activity = await this.findOne(id);
        if (activity.teacherId !== teacherId) {
            throw new common_1.ForbiddenException('No tienes permisos para editar esta actividad');
        }
        if (updateActivityDto.valuationType === activity_entity_1.ActivityValuationType.SCORE && !updateActivityDto.maxScore) {
            throw new common_1.BadRequestException('maxScore es requerido para actividades de tipo score');
        }
        const updateData = { ...updateActivityDto };
        if (updateActivityDto.assignedDate) {
            updateData.assignedDate = new Date(updateActivityDto.assignedDate);
        }
        if (updateActivityDto.reviewDate) {
            updateData.reviewDate = new Date(updateActivityDto.reviewDate);
        }
        await this.activitiesRepository.update(id, updateData);
        return this.findOne(id);
    }
    async remove(id, teacherId) {
        const activity = await this.findOne(id);
        if (activity.teacherId !== teacherId) {
            throw new common_1.ForbiddenException('No tienes permisos para eliminar esta actividad');
        }
        await this.activitiesRepository.update(id, { isActive: false });
    }
    async assessStudent(activityId, studentId, assessDto, teacherId, userId) {
        const activity = await this.findOne(activityId);
        if (activity.teacherId !== teacherId) {
            throw new common_1.ForbiddenException('No tienes permisos para valorar esta actividad');
        }
        this.validateAssessmentValue(activity.valuationType, assessDto.value, activity.maxScore);
        let assessment = await this.assessmentsRepository.findOne({
            where: { activityId, studentId },
        });
        if (!assessment) {
            throw new common_1.NotFoundException('Registro de valoración no encontrado');
        }
        let finalUserId = userId;
        if (!finalUserId) {
            const teacher = await this.teachersRepository.findOne({
                where: { id: teacherId },
                relations: ['user'],
                select: { id: true, user: { id: true } }
            });
            if (teacher?.user?.id) {
                finalUserId = teacher.user.id;
            }
            else {
                throw new common_1.BadRequestException('No se pudo encontrar el usuario asociado al profesor');
            }
        }
        assessment.value = assessDto.value;
        assessment.comment = assessDto.comment || null;
        assessment.assessedAt = new Date();
        assessment.assessedById = finalUserId;
        assessment.isAssessed = true;
        const savedAssessment = await this.assessmentsRepository.save(assessment);
        if (activity.notifyFamilies && this.shouldNotifyFamily(activity, assessDto.value)) {
            await this.createFamilyNotification(savedAssessment.id, studentId);
        }
        return savedAssessment;
    }
    async bulkAssess(activityId, bulkAssessDto, teacherId, userId) {
        const activity = await this.findOne(activityId);
        if (activity.teacherId !== teacherId) {
            throw new common_1.ForbiddenException('No tienes permisos para valorar esta actividad');
        }
        this.validateAssessmentValue(activity.valuationType, bulkAssessDto.value, activity.maxScore);
        let finalUserId = userId;
        if (!finalUserId) {
            const teacher = await this.teachersRepository.findOne({
                where: { id: teacherId },
                relations: ['user'],
                select: { id: true, user: { id: true } }
            });
            if (teacher?.user?.id) {
                finalUserId = teacher.user.id;
            }
            else {
                throw new common_1.BadRequestException('No se pudo encontrar el usuario asociado al profesor');
            }
        }
        let targetStudentIds;
        if (bulkAssessDto.studentIds && bulkAssessDto.studentIds.length > 0) {
            targetStudentIds = bulkAssessDto.studentIds;
        }
        else {
            const classGroup = await this.classGroupsRepository.findOne({
                where: { id: activity.classGroupId },
                relations: ['students'],
            });
            targetStudentIds = classGroup.students.map(student => student.id);
        }
        const assessments = await this.assessmentsRepository.find({
            where: {
                activityId,
                studentId: (0, typeorm_2.In)(targetStudentIds),
            },
        });
        const updatedAssessments = [];
        for (const assessment of assessments) {
            assessment.value = bulkAssessDto.value;
            assessment.comment = bulkAssessDto.comment || null;
            assessment.assessedAt = new Date();
            assessment.assessedById = finalUserId;
            assessment.isAssessed = true;
            const saved = await this.assessmentsRepository.save(assessment);
            updatedAssessments.push(saved);
            if (activity.notifyFamilies && this.shouldNotifyFamily(activity, bulkAssessDto.value)) {
                await this.createFamilyNotification(saved.id, assessment.studentId);
            }
        }
        return updatedAssessments;
    }
    async getActivityStatistics(activityId, teacherId) {
        const activity = await this.findOne(activityId);
        if (activity.teacherId !== teacherId) {
            throw new common_1.ForbiddenException('No tienes permisos para ver estas estadísticas');
        }
        const assessments = activity.assessments;
        const totalStudents = assessments.length;
        const assessedStudents = assessments.filter(a => a.isAssessed).length;
        const pendingStudents = totalStudents - assessedStudents;
        const statistics = {
            activityId: activity.id,
            activityName: activity.name,
            totalStudents,
            assessedStudents,
            pendingStudents,
            completionPercentage: totalStudents > 0 ? Math.round((assessedStudents / totalStudents) * 100) : 0,
        };
        if (activity.valuationType === activity_entity_1.ActivityValuationType.EMOJI) {
            const emojiCounts = {
                happy: assessments.filter(a => a.value === activity_assessment_entity_1.EmojiValue.HAPPY).length,
                neutral: assessments.filter(a => a.value === activity_assessment_entity_1.EmojiValue.NEUTRAL).length,
                sad: assessments.filter(a => a.value === activity_assessment_entity_1.EmojiValue.SAD).length,
            };
            statistics.emojiDistribution = emojiCounts;
        }
        else if (activity.valuationType === activity_entity_1.ActivityValuationType.SCORE) {
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
    async getTeacherSummary(teacherId) {
        const today = new Date();
        const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
        const endOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 6));
        const todayActivities = await this.activitiesRepository.count({
            where: {
                teacherId,
                isActive: true,
                assignedDate: new Date().toISOString().split('T')[0],
            },
        });
        const pendingAssessments = await this.assessmentsRepository
            .createQueryBuilder('assessment')
            .innerJoin('assessment.activity', 'activity')
            .where('activity.teacherId = :teacherId', { teacherId })
            .andWhere('activity.isActive = :isActive', { isActive: true })
            .andWhere('assessment.isAssessed = :isAssessed', { isAssessed: false })
            .getCount();
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
        const positiveAssessments = await this.assessmentsRepository
            .createQueryBuilder('assessment')
            .innerJoin('assessment.activity', 'activity')
            .where('activity.teacherId = :teacherId', { teacherId })
            .andWhere('activity.isActive = :isActive', { isActive: true })
            .andWhere('assessment.isAssessed = :isAssessed', { isAssessed: true })
            .andWhere('assessment.value = :value', { value: activity_assessment_entity_1.EmojiValue.HAPPY })
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
    async getFamilyActivities(familyUserId, studentId, limit = 10) {
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
        }
        else {
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
    async createAssessmentRecords(activityId, classGroupId) {
        const classGroup = await this.classGroupsRepository.findOne({
            where: { id: classGroupId },
            relations: ['students'],
        });
        if (!classGroup) {
            throw new common_1.NotFoundException(`Grupo de clase con ID ${classGroupId} no encontrado`);
        }
        const assessmentRecords = classGroup.students.map(student => this.assessmentsRepository.create({
            activityId,
            studentId: student.id,
            isAssessed: false,
        }));
        await this.assessmentsRepository.save(assessmentRecords);
    }
    validateAssessmentValue(valuationType, value, maxScore) {
        if (valuationType === activity_entity_1.ActivityValuationType.EMOJI) {
            if (!Object.values(activity_assessment_entity_1.EmojiValue).includes(value)) {
                throw new common_1.BadRequestException(`Valor de emoji inválido: ${value}. Valores permitidos: ${Object.values(activity_assessment_entity_1.EmojiValue).join(', ')}`);
            }
        }
        else if (valuationType === activity_entity_1.ActivityValuationType.SCORE) {
            const numericValue = parseFloat(value);
            if (isNaN(numericValue) || numericValue < 0 || (maxScore && numericValue > maxScore)) {
                throw new common_1.BadRequestException(`Valor de puntuación inválido: ${value}. Debe ser un número entre 0 y ${maxScore}`);
            }
        }
    }
    async verifyTeacherAccess(teacherId, classGroupId) {
        const tutoredClasses = await this.classGroupsRepository.find({
            where: { tutor: { id: teacherId } },
            select: ['id'],
        });
        const isTutor = tutoredClasses.some(cls => cls.id === classGroupId);
        if (isTutor) {
            return;
        }
        const assignmentQuery = await this.classGroupsRepository
            .createQueryBuilder('classGroup')
            .innerJoin('subject_assignments', 'sa', 'sa.classGroupId = classGroup.id')
            .where('sa.teacherId = :teacherId', { teacherId })
            .andWhere('classGroup.id = :classGroupId', { classGroupId })
            .getCount();
        if (assignmentQuery === 0) {
            throw new common_1.ForbiddenException('No tienes acceso a este grupo de clase');
        }
    }
    async createFamilyNotification(assessmentId, studentId) {
        try {
            const familyRelations = await this.familyStudentsRepository.find({
                where: { student: { id: studentId } },
                relations: ['family'],
            });
            for (const relation of familyRelations) {
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
            await this.assessmentsRepository.update(assessmentId, {
                notifiedAt: new Date(),
            });
        }
        catch (error) {
            console.error('Error creating family notification:', error);
        }
    }
    async verifyFamilyStudentAccess(familyUserId, studentId) {
        const familyRelation = await this.familyStudentsRepository.findOne({
            where: [
                { family: { primaryContact: { id: familyUserId } }, student: { id: studentId } },
                { family: { secondaryContact: { id: familyUserId } }, student: { id: studentId } },
            ],
        });
        if (!familyRelation) {
            throw new common_1.ForbiddenException('No tienes acceso a las actividades de este estudiante');
        }
    }
    async getFamilyStudentIds(familyUserId) {
        const familyRelations = await this.familyStudentsRepository.find({
            where: [
                { family: { primaryContact: { id: familyUserId } } },
                { family: { secondaryContact: { id: familyUserId } } },
            ],
            relations: ['student'],
        });
        return familyRelations.map(relation => relation.student.id);
    }
    shouldNotifyFamily(activity, assessmentValue) {
        if (activity.valuationType === activity_entity_1.ActivityValuationType.SCORE) {
            return true;
        }
        if (activity.valuationType === activity_entity_1.ActivityValuationType.EMOJI) {
            switch (assessmentValue) {
                case activity_assessment_entity_1.EmojiValue.HAPPY:
                    return activity.notifyOnHappy;
                case activity_assessment_entity_1.EmojiValue.NEUTRAL:
                    return activity.notifyOnNeutral;
                case activity_assessment_entity_1.EmojiValue.SAD:
                    return activity.notifyOnSad;
                default:
                    return false;
            }
        }
        return false;
    }
    async getTeacherIdFromUserId(userId) {
        const teacher = await this.teachersRepository.findOne({
            where: { user: { id: userId } },
            select: ['id'],
        });
        if (!teacher) {
            throw new common_1.NotFoundException('Profesor no encontrado para este usuario');
        }
        return teacher.id;
    }
    async createByUserId(createActivityDto, userId) {
        const teacherId = await this.getTeacherIdFromUserId(userId);
        return this.create(createActivityDto, teacherId);
    }
    async findAllByUserId(userId, classGroupId, startDate, endDate) {
        const teacherId = await this.getTeacherIdFromUserId(userId);
        return this.findAll(teacherId, classGroupId, startDate, endDate);
    }
    async updateByUserId(id, updateActivityDto, userId) {
        const teacherId = await this.getTeacherIdFromUserId(userId);
        return this.update(id, updateActivityDto, teacherId);
    }
    async removeByUserId(id, userId) {
        const teacherId = await this.getTeacherIdFromUserId(userId);
        return this.remove(id, teacherId);
    }
    async assessStudentByUserId(activityId, studentId, assessDto, userId) {
        const teacherId = await this.getTeacherIdFromUserId(userId);
        return this.assessStudent(activityId, studentId, assessDto, teacherId, userId);
    }
    async bulkAssessByUserId(activityId, bulkAssessDto, userId) {
        const teacherId = await this.getTeacherIdFromUserId(userId);
        return this.bulkAssess(activityId, bulkAssessDto, teacherId, userId);
    }
    async getActivityStatisticsByUserId(activityId, userId) {
        const teacherId = await this.getTeacherIdFromUserId(userId);
        return this.getActivityStatistics(activityId, teacherId);
    }
    async getTeacherSummaryByUserId(userId) {
        const teacherId = await this.getTeacherIdFromUserId(userId);
        return this.getTeacherSummary(teacherId);
    }
    async getTeacherSubjectAssignments(teacherId) {
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
    async getTeacherSubjectAssignmentsByUserId(userId) {
        const teacherId = await this.getTeacherIdFromUserId(userId);
        return this.getTeacherSubjectAssignments(teacherId);
    }
    async findActivitiesBySubjectAssignmentUserId(subjectAssignmentId, userId, includeArchived = false) {
        const teacherId = await this.getTeacherIdFromUserId(userId);
        return this.findActivitiesBySubjectAssignment(subjectAssignmentId, teacherId, includeArchived);
    }
    async getSubjectActivitySummaryByUserId(subjectAssignmentId, userId) {
        const teacherId = await this.getTeacherIdFromUserId(userId);
        return this.getSubjectActivitySummary(subjectAssignmentId, teacherId);
    }
    async getTeacherTemplatesByUserId(userId) {
        const teacherId = await this.getTeacherIdFromUserId(userId);
        return this.findTemplatesByTeacher(teacherId);
    }
    async createFromTemplateByUserId(createFromTemplateDto, userId) {
        const teacherId = await this.getTeacherIdFromUserId(userId);
        return this.createFromTemplate(createFromTemplateDto, teacherId);
    }
    async toggleArchiveByUserId(activityId, userId) {
        const teacherId = await this.getTeacherIdFromUserId(userId);
        const activity = await this.findOne(activityId);
        if (activity.teacherId !== teacherId) {
            throw new common_1.ForbiddenException('No tienes permisos para modificar esta actividad');
        }
        const newArchivedState = !activity.isArchived;
        await this.activitiesRepository.update(activityId, { isArchived: newArchivedState });
        return this.findOne(activityId);
    }
    async findActivitiesBySubjectAssignment(subjectAssignmentId, teacherId, includeArchived = false, includeTemplates = false) {
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
    async findTemplatesByTeacher(teacherId) {
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
    async createFromTemplate(createFromTemplateDto, teacherId) {
        const template = await this.activitiesRepository.findOne({
            where: { id: createFromTemplateDto.templateId, isTemplate: true },
            relations: ['subjectAssignment'],
        });
        if (!template) {
            throw new common_1.NotFoundException('Plantilla de actividad no encontrada');
        }
        if (template.teacherId !== teacherId) {
            throw new common_1.ForbiddenException('No tienes permisos para usar esta plantilla');
        }
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
        const targetStudentIds = createFromTemplateDto.targetStudentIds;
        await this.createAssessmentRecordsForActivity(savedActivity.id, template.subjectAssignmentId, targetStudentIds);
        return this.findOne(savedActivity.id);
    }
    async archiveActivity(activityId, teacherId) {
        const activity = await this.findOne(activityId);
        if (activity.teacherId !== teacherId) {
            throw new common_1.ForbiddenException('No tienes permisos para archivar esta actividad');
        }
        await this.activitiesRepository.update(activityId, { isArchived: true });
    }
    async unarchiveActivity(activityId, teacherId) {
        const activity = await this.findOne(activityId);
        if (activity.teacherId !== teacherId) {
            throw new common_1.ForbiddenException('No tienes permisos para desarchivar esta actividad');
        }
        await this.activitiesRepository.update(activityId, { isArchived: false });
    }
    async getSubjectActivitySummary(subjectAssignmentId, teacherId) {
        await this.verifyTeacherSubjectAssignmentAccess(teacherId, subjectAssignmentId);
        const subjectAssignment = await this.subjectAssignmentsRepository.findOne({
            where: { id: subjectAssignmentId },
            relations: ['subject', 'classGroup'],
        });
        if (!subjectAssignment) {
            throw new common_1.NotFoundException('Asignación de asignatura no encontrada');
        }
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
        const pendingAssessments = await this.assessmentsRepository
            .createQueryBuilder('assessment')
            .innerJoin('assessment.activity', 'activity')
            .where('activity.subjectAssignmentId = :subjectAssignmentId', { subjectAssignmentId })
            .andWhere('activity.isActive = :isActive', { isActive: true })
            .andWhere('activity.isArchived = :isArchived', { isArchived: false })
            .andWhere('assessment.isAssessed = :isAssessed', { isAssessed: false })
            .getCount();
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
    async verifyTeacherSubjectAssignmentAccess(teacherId, subjectAssignmentId) {
        const assignment = await this.subjectAssignmentsRepository.findOne({
            where: { id: subjectAssignmentId, teacher: { id: teacherId } },
        });
        if (!assignment) {
            throw new common_1.ForbiddenException('No tienes acceso a esta asignación de asignatura');
        }
    }
    async createAssessmentRecordsForActivity(activityId, subjectAssignmentId, targetStudentIds) {
        const subjectAssignment = await this.subjectAssignmentsRepository.findOne({
            where: { id: subjectAssignmentId },
            relations: ['classGroup', 'classGroup.students'],
        });
        if (!subjectAssignment) {
            throw new common_1.NotFoundException('Asignación de asignatura no encontrada');
        }
        let studentsToAssess = subjectAssignment.classGroup.students;
        if (targetStudentIds && targetStudentIds.length > 0) {
            studentsToAssess = studentsToAssess.filter(student => targetStudentIds.includes(student.id));
        }
        const assessmentRecords = studentsToAssess.map(student => this.assessmentsRepository.create({
            activityId,
            studentId: student.id,
            isAssessed: false,
        }));
        await this.assessmentsRepository.save(assessmentRecords);
    }
};
exports.ActivitiesService = ActivitiesService;
exports.ActivitiesService = ActivitiesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(activity_entity_1.Activity)),
    __param(1, (0, typeorm_1.InjectRepository)(activity_assessment_entity_1.ActivityAssessment)),
    __param(2, (0, typeorm_1.InjectRepository)(activity_notification_entity_1.ActivityNotification)),
    __param(3, (0, typeorm_1.InjectRepository)(class_group_entity_1.ClassGroup)),
    __param(4, (0, typeorm_1.InjectRepository)(student_entity_1.Student)),
    __param(5, (0, typeorm_1.InjectRepository)(family_entity_1.Family)),
    __param(6, (0, typeorm_1.InjectRepository)(family_entity_1.FamilyStudent)),
    __param(7, (0, typeorm_1.InjectRepository)(teacher_entity_1.Teacher)),
    __param(8, (0, typeorm_1.InjectRepository)(subject_assignment_entity_1.SubjectAssignment)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ActivitiesService);
//# sourceMappingURL=activities.service.js.map