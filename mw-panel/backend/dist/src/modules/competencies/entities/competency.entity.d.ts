import { EducationalLevel } from '../../students/entities/educational-level.entity';
import { Area } from './area.entity';
export declare class Competency {
    id: string;
    code: string;
    name: string;
    description: string;
    educationalLevel: EducationalLevel;
    areas: Area[];
    createdAt: Date;
    updatedAt: Date;
}
