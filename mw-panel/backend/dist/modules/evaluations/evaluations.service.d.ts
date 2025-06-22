import { Repository } from 'typeorm';
import { Evaluation } from './entities/evaluation.entity';
export declare class EvaluationsService {
    private evaluationsRepository;
    constructor(evaluationsRepository: Repository<Evaluation>);
    findAll(): Promise<Evaluation[]>;
    findOne(id: string): Promise<Evaluation>;
}
