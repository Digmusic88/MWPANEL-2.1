import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { AcademicYear } from '../students/entities/academic-year.entity';

@ApiTags('academic-years')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('academic-years')
export class AcademicYearsController {
  constructor(
    @InjectRepository(AcademicYear)
    private readonly academicYearRepository: Repository<AcademicYear>,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todos los años académicos' })
  @ApiResponse({ status: 200, description: 'Lista de años académicos obtenida exitosamente' })
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  async findAll(): Promise<AcademicYear[]> {
    return this.academicYearRepository.find({
      order: { startDate: 'DESC' },
    });
  }
}