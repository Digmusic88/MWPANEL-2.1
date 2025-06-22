import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Competency } from './entities/competency.entity';

@Injectable()
export class CompetenciesService {
  constructor(
    @InjectRepository(Competency)
    private competenciesRepository: Repository<Competency>,
  ) {}

  async findAll(): Promise<Competency[]> {
    return this.competenciesRepository.find({
      relations: ['educationalLevel', 'areas'],
    });
  }

  async findOne(id: string): Promise<Competency> {
    return this.competenciesRepository.findOne({
      where: { id },
      relations: ['educationalLevel', 'areas'],
    });
  }
}