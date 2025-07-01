import { ActivitiesService } from './activities.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { AssessActivityDto, BulkAssessActivityDto } from './dto/assess-activity.dto';
import { ActivityStatisticsDto, TeacherActivitySummaryDto } from './dto/activity-statistics.dto';
import { SubjectAssignmentWithStudentsDto } from './dto/subject-assignment-with-students.dto';
import { CreateFromTemplateDto } from './dto/activity-template.dto';
import { SubjectActivitySummaryDto } from './dto/subject-activity-summary.dto';
import { Activity } from './entities/activity.entity';
import { ActivityAssessment } from './entities/activity-assessment.entity';
export declare class ActivitiesController {
    private readonly activitiesService;
    constructor(activitiesService: ActivitiesService);
    create(createActivityDto: CreateActivityDto, req: any): Promise<Activity>;
    findAll(req: any, classGroupId?: string, startDate?: string, endDate?: string): Promise<Activity[]>;
    getTeacherSummary(req: any): Promise<TeacherActivitySummaryDto>;
    findOne(id: string): Promise<Activity>;
    update(id: string, updateActivityDto: UpdateActivityDto, req: any): Promise<Activity>;
    remove(id: string, req: any): Promise<{
        message: string;
    }>;
    assessStudent(activityId: string, studentId: string, assessDto: AssessActivityDto, req: any): Promise<ActivityAssessment>;
    bulkAssess(activityId: string, bulkAssessDto: BulkAssessActivityDto, req: any): Promise<ActivityAssessment[]>;
    getActivityStatistics(id: string, req: any): Promise<ActivityStatisticsDto>;
    getTeacherSubjectAssignments(req: any): Promise<SubjectAssignmentWithStudentsDto[]>;
    findActivitiesBySubjectAssignment(subjectAssignmentId: string, req: any, includeArchived?: boolean): Promise<Activity[]>;
    getSubjectActivitySummary(subjectAssignmentId: string, req: any): Promise<SubjectActivitySummaryDto>;
    getTeacherTemplates(req: any): Promise<Activity[]>;
    createFromTemplate(createFromTemplateDto: CreateFromTemplateDto, req: any): Promise<Activity>;
    toggleArchive(id: string, req: any): Promise<Activity>;
    getFamilyActivities(req: any, studentId?: string, limit?: number): Promise<ActivityAssessment[]>;
    getTestTeacherAssignments(): Promise<SubjectAssignmentWithStudentsDto[]>;
    getTestTeacherSummary(): Promise<TeacherActivitySummaryDto>;
}
