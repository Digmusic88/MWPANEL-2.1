import { RubricsService } from '../services/rubrics.service';
import { CreateRubricDto } from '../dto/create-rubric.dto';
import { UpdateRubricDto } from '../dto/update-rubric.dto';
import { ImportRubricDto } from '../dto/import-rubric.dto';
import { CreateRubricAssessmentDto } from '../dto/rubric-assessment.dto';
import { ShareRubricDto, UnshareRubricDto } from '../dto/share-rubric.dto';
import { Rubric } from '../entities/rubric.entity';
import { RubricAssessment } from '../entities/rubric-assessment.entity';
export declare class RubricsController {
    private readonly rubricsService;
    constructor(rubricsService: RubricsService);
    create(createRubricDto: CreateRubricDto, req: any): Promise<Rubric>;
    findAll(req: any, includeTemplates?: boolean): Promise<Rubric[]>;
    findOne(id: string): Promise<Rubric>;
    update(id: string, updateRubricDto: UpdateRubricDto, req: any): Promise<Rubric>;
    remove(id: string, req: any): Promise<{
        message: string;
    }>;
    publish(id: string, req: any): Promise<Rubric>;
    previewImportFromChatGPT(previewDto: {
        format: string;
        data: string;
    }): Promise<any>;
    importFromChatGPT(importDto: ImportRubricDto, req: any): Promise<Rubric>;
    createAssessment(createDto: CreateRubricAssessmentDto): Promise<RubricAssessment>;
    getAssessment(id: string): Promise<RubricAssessment>;
    testGenerateColors(count: number): Promise<{
        count: number;
        colors: any[];
    }>;
    testParseMarkdown(body: {
        data: string;
    }): Promise<{
        message: string;
        input: string;
    }>;
    testParseCSV(body: {
        data: string;
    }): Promise<{
        message: string;
        input: string;
    }>;
    shareRubric(id: string, shareDto: ShareRubricDto, req: any): Promise<Rubric>;
    unshareRubric(id: string, unshareDto: UnshareRubricDto, req: any): Promise<Rubric>;
    getSharedWithMe(req: any): Promise<Rubric[]>;
    getColleagues(req: any): Promise<any[]>;
}
