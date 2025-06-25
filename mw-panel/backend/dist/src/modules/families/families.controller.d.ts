import { FamiliesService } from './families.service';
import { CreateFamilyDto } from './dto/create-family.dto';
import { UpdateFamilyDto } from './dto/update-family.dto';
export declare class FamiliesController {
    private readonly familiesService;
    constructor(familiesService: FamiliesService);
    create(createFamilyDto: CreateFamilyDto): Promise<import("../users/entities/family.entity").Family>;
    findAll(): Promise<import("../users/entities/family.entity").Family[]>;
    getAvailableStudents(): Promise<import("../students/entities/student.entity").Student[]>;
    getMyFamilyDashboard(req: any): Promise<{
        family: {
            id: string;
            primaryContact: {
                id: string;
                profile: {
                    firstName: string;
                    lastName: string;
                };
            };
            secondaryContact: {
                id: string;
                profile: {
                    firstName: string;
                    lastName: string;
                };
            };
        };
        students: {
            id: string;
            enrollmentNumber: string;
            relationship: import("../users/entities/family.entity").FamilyRelationship;
            user: {
                profile: {
                    firstName: string;
                    lastName: string;
                };
            };
            educationalLevel: import("../students/entities/educational-level.entity").EducationalLevel;
            course: import("../students/entities/course.entity").Course;
            classGroups: import("../students/entities/class-group.entity").ClassGroup[];
            stats: {
                totalEvaluations: number;
                completedEvaluations: number;
                pendingEvaluations: number;
                averageGrade: number;
                attendance: number;
            };
            recentEvaluations: {
                id: string;
                period: import("../evaluations/entities/evaluation-period.entity").EvaluationPeriod;
                createdAt: Date;
                competencyEvaluations: {
                    competencyName: string;
                    score: number;
                    displayGrade: string;
                    observations: string;
                }[];
            }[];
        }[];
        summary: {
            totalStudents: number;
            averageGrade: number;
            totalPendingEvaluations: number;
            totalCompletedEvaluations: number;
        };
    }>;
    getMyChildren(req: any): Promise<{
        id: string;
        enrollmentNumber: string;
        user: {
            profile: {
                firstName: string;
                lastName: string;
            };
        };
        relationship: import("../users/entities/family.entity").FamilyRelationship;
        educationalLevel: string;
        classGroups: {
            id: string;
            name: string;
            courses: string[];
        }[];
    }[]>;
    findOne(id: string): Promise<import("../users/entities/family.entity").Family>;
    update(id: string, updateFamilyDto: UpdateFamilyDto): Promise<import("../users/entities/family.entity").Family>;
    remove(id: string): Promise<void>;
}
