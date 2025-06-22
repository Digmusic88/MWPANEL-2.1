import { EducationalLevel } from './educational-level.entity';
import { Course } from './course.entity';
export declare class Cycle {
    id: string;
    name: string;
    order: number;
    educationalLevel: EducationalLevel;
    courses: Course[];
}
