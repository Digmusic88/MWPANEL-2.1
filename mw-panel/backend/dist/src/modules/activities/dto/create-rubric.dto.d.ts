export declare class CreateRubricCriterionDto {
    name: string;
    description?: string;
    order: number;
    weight: number;
}
export declare class CreateRubricLevelDto {
    name: string;
    description?: string;
    order: number;
    scoreValue: number;
    color: string;
}
export declare class CreateRubricCellDto {
    criterionId?: string;
    levelId?: string;
    content: string;
}
export declare class CreateRubricDto {
    name: string;
    description?: string;
    isTemplate?: boolean;
    isVisibleToFamilies?: boolean;
    subjectAssignmentId?: string;
    maxScore?: number;
    importSource?: string;
    originalImportData?: string;
    criteria: CreateRubricCriterionDto[];
    levels: CreateRubricLevelDto[];
    cells: CreateRubricCellDto[];
}
