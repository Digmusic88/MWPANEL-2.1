import { User } from '../../users/entities/user.entity';
import { EducationalLevel } from './educational-level.entity';
import { Course } from './course.entity';
import { ClassGroup } from './class-group.entity';
import { Evaluation } from '../../evaluations/entities/evaluation.entity';
export declare class Student {
    id: string;
    enrollmentNumber: string;
    birthDate: Date;
    photoUrl: string;
    user: User;
    educationalLevel: EducationalLevel;
    course: Course;
    classGroups: ClassGroup[];
    evaluations: Evaluation[];
    createdAt: Date;
    updatedAt: Date;
}
