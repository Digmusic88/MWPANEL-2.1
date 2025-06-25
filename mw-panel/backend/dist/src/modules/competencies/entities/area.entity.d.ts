import { EducationalLevel } from '../../students/entities/educational-level.entity';
import { Competency } from './competency.entity';
export declare class Area {
    id: string;
    name: string;
    code: string;
    description: string;
    educationalLevel: EducationalLevel;
    competencies: Competency[];
    createdAt: Date;
    updatedAt: Date;
}
