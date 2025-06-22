import { EvaluationsService } from './evaluations.service';
export declare class EvaluationsController {
    private readonly evaluationsService;
    constructor(evaluationsService: EvaluationsService);
    findAll(): Promise<import("./entities/evaluation.entity").Evaluation[]>;
}
