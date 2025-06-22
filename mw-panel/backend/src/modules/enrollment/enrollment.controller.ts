import { 
  Controller, 
  Post, 
  Body, 
  UseGuards,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { EnrollmentService } from './enrollment.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('Inscripción')
@Controller('enrollment')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EnrollmentController {
  constructor(private readonly enrollmentService: EnrollmentService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Procesar inscripción de estudiante y familia' })
  @ApiResponse({ status: 201, description: 'Inscripción completada exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 409, description: 'Email ya existe' })
  async createEnrollment(@Body() createEnrollmentDto: CreateEnrollmentDto) {
    console.log('Received enrollment data:', JSON.stringify(createEnrollmentDto, null, 2));
    try {
      return await this.enrollmentService.processEnrollment(createEnrollmentDto);
    } catch (error) {
      console.error('Enrollment processing error:', error);
      throw error;
    }
  }

  @Post('test')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'SOLO PARA TESTING - Crear inscripción con datos de prueba' })
  @ApiResponse({ status: 201, description: 'Inscripción de prueba creada exitosamente' })
  async createTestEnrollment() {
    console.log('Creating test enrollment with sample data...');
    
    const testData = {
      student: {
        firstName: 'Juan Carlos',
        lastName: 'Pérez González',
        email: 'juan.perez@test.com',
        password: 'password123',
        birthDate: '2010-05-15',
        documentNumber: '12345678A',
        phone: '666123456',
        enrollmentNumber: 'MW' + Date.now(),
        educationalLevelId: 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        courseId: null,
        classGroupIds: []
      },
      family: {
        primaryContact: {
          firstName: 'María',
          lastName: 'González López',
          email: 'maria.gonzalez@test.com',
          password: 'password123',
          phone: '666987654',
          documentNumber: '87654321B',
          dateOfBirth: '1985-03-20',
          address: 'Calle Mayor 123, Madrid',
          occupation: 'Enfermera',
        },
        secondaryContact: {
          firstName: 'Carlos',
          lastName: 'Pérez Martín',
          email: 'carlos.perez@test.com',
          password: 'password123',
          phone: '666555444',
          documentNumber: '11223344C',
          dateOfBirth: '1982-08-10',
          address: 'Calle Mayor 123, Madrid',
          occupation: 'Ingeniero',
        },
        relationship: 'mother'
      }
    };

    try {
      console.log('Test data being processed:', JSON.stringify(testData, null, 2));
      return await this.enrollmentService.processEnrollment(testData as any);
    } catch (error) {
      console.error('Test enrollment error:', error);
      throw error;
    }
  }
}