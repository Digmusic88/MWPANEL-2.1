import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Evaluation } from '../evaluations/entities/evaluation.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Evaluation)
    private evaluationsRepository: Repository<Evaluation>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findAll(): Promise<any[]> {
    // Basic implementation for reports
    return this.evaluationsRepository.find({
      relations: ['student', 'teacher', 'subject', 'period'],
    });
  }

  async findOne(id: string): Promise<any> {
    return this.evaluationsRepository.findOne({
      where: { id },
      relations: ['student', 'teacher', 'subject', 'period', 'competencyEvaluations'],
    });
  }
}