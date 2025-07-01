import { CreateRubricCriterionDto, CreateRubricLevelDto, CreateRubricCellDto } from '../dto/create-rubric.dto';
export declare class RubricUtilsService {
    generateLevelColors(levelCount: number): string[];
    parseMarkdownTable(markdownData: string): {
        criteria: CreateRubricCriterionDto[];
        levels: CreateRubricLevelDto[];
        cells: CreateRubricCellDto[];
    };
    parseCSVTable(csvData: string): {
        criteria: CreateRubricCriterionDto[];
        levels: CreateRubricLevelDto[];
        cells: CreateRubricCellDto[];
    };
    private parseTableRow;
    private parseCSVRow;
    calculateRubricScore(criterionAssessments: Array<{
        criterion: {
            weight: number;
        };
        selectedLevel: {
            scoreValue: number;
        };
    }>, maxScore?: number): {
        totalScore: number;
        maxPossibleScore: number;
        percentage: number;
    };
    validateCriteriaWeights(criteria: CreateRubricCriterionDto[]): boolean;
    normalizeCriteriaWeights(criteria: CreateRubricCriterionDto[]): CreateRubricCriterionDto[];
}
