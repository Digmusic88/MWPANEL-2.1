import { Repository } from 'typeorm';
import { Competency } from './entities/competency.entity';
export declare class CompetenciesService {
    private competenciesRepository;
    constructor(competenciesRepository: Repository<Competency>);
    findAll(): Promise<Competency[]>;
    findOne(id: string): Promise<Competency>;
}
