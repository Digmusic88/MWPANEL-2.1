import { Repository } from 'typeorm';
import { Evaluation } from '../evaluations/entities/evaluation.entity';
import { User } from '../users/entities/user.entity';
export declare class ReportsService {
    private evaluationsRepository;
    private usersRepository;
    constructor(evaluationsRepository: Repository<Evaluation>, usersRepository: Repository<User>);
    findAll(): Promise<any[]>;
    findOne(id: string): Promise<any>;
}
