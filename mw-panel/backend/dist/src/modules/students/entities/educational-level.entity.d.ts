import { Cycle } from './cycle.entity';
export declare enum EducationalLevelCode {
    INFANTIL = "INFANTIL",
    PRIMARIA = "PRIMARIA",
    SECUNDARIA = "SECUNDARIA"
}
export declare class EducationalLevel {
    id: string;
    name: string;
    code: EducationalLevelCode;
    description: string;
    cycles: Cycle[];
}
