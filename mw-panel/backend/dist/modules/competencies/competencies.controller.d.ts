import { CompetenciesService } from './competencies.service';
export declare class CompetenciesController {
    private readonly competenciesService;
    constructor(competenciesService: CompetenciesService);
    findAll(): Promise<import("./entities/competency.entity").Competency[]>;
}
