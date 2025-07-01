import { 
  Controller, 
  Get, 
  Param, 
  UseGuards, 
  Request,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { GradesService } from './grades.service';
import { StudentGradesResponseDto, ClassGradesResponseDto } from './dto/student-grades.dto';

@ApiTags('grades')
@Controller('grades')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class GradesController {
  constructor(private readonly gradesService: GradesService) {}

  @Get('student/:studentId')
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT, UserRole.FAMILY)
  @ApiOperation({ summary: 'Get all grades for a specific student' })
  @ApiParam({ name: 'studentId', description: 'Student ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Student grades retrieved successfully',
    type: StudentGradesResponseDto,
  })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Student not found' })
  async getStudentGrades(
    @Param('studentId', ParseUUIDPipe) studentId: string,
    @Request() req,
  ): Promise<StudentGradesResponseDto> {
    return this.gradesService.getStudentGrades(
      studentId,
      req.user.id,
      req.user.role,
    );
  }

  @Get('my-grades')
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: 'Get current student\'s own grades' })
  @ApiResponse({ 
    status: 200, 
    description: 'Student grades retrieved successfully',
    type: StudentGradesResponseDto,
  })
  async getMyGrades(@Request() req): Promise<StudentGradesResponseDto> {
    // First get the student record from user ID
    const student = await this.gradesService.getStudentByUserId(req.user.id);
    
    return this.gradesService.getStudentGrades(
      student.id,
      req.user.id,
      UserRole.STUDENT,
    );
  }

  @Get('family/children')
  @Roles(UserRole.FAMILY)
  @ApiOperation({ summary: 'Get grades for all children of a family' })
  @ApiResponse({ 
    status: 200, 
    description: 'Children grades retrieved successfully',
    type: [StudentGradesResponseDto],
  })
  async getFamilyChildrenGrades(@Request() req): Promise<StudentGradesResponseDto[]> {
    return this.gradesService.getFamilyChildrenGrades(req.user.id);
  }

  @Get('family/child/:studentId')
  @Roles(UserRole.FAMILY)
  @ApiOperation({ summary: 'Get grades for a specific child' })
  @ApiParam({ name: 'studentId', description: 'Student ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Child grades retrieved successfully',
    type: StudentGradesResponseDto,
  })
  @ApiResponse({ status: 403, description: 'Not authorized to view this student' })
  async getFamilyChildGrades(
    @Param('studentId', ParseUUIDPipe) studentId: string,
    @Request() req,
  ): Promise<StudentGradesResponseDto> {
    return this.gradesService.getStudentGrades(
      studentId,
      req.user.id,
      UserRole.FAMILY,
    );
  }

  @Get('teacher/class/:classGroupId/subject/:subjectId')
  @Roles(UserRole.TEACHER)
  @ApiOperation({ summary: 'Get grades for all students in a class for a specific subject' })
  @ApiParam({ name: 'classGroupId', description: 'Class group ID' })
  @ApiParam({ name: 'subjectId', description: 'Subject ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Class grades retrieved successfully',
    type: ClassGradesResponseDto,
  })
  @ApiResponse({ status: 403, description: 'Not authorized for this class/subject' })
  async getClassGrades(
    @Param('classGroupId', ParseUUIDPipe) classGroupId: string,
    @Param('subjectId', ParseUUIDPipe) subjectId: string,
    @Request() req,
  ): Promise<ClassGradesResponseDto> {
    return this.gradesService.getClassGrades(
      classGroupId,
      subjectId,
      req.user.id,
    );
  }

  @Get('teacher/my-classes')
  @Roles(UserRole.TEACHER)
  @ApiOperation({ summary: 'Get summary of grades for all teacher\'s classes' })
  @ApiResponse({ 
    status: 200, 
    description: 'Teacher classes summary retrieved successfully',
  })
  async getTeacherClassesSummary(@Request() req) {
    return this.gradesService.getTeacherClassesSummary(req.user.id);
  }

  @Get('admin/overview')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get grades overview for the entire school' })
  @ApiQuery({ name: 'levelId', required: false, description: 'Filter by educational level' })
  @ApiQuery({ name: 'courseId', required: false, description: 'Filter by course' })
  @ApiQuery({ name: 'classGroupId', required: false, description: 'Filter by class group' })
  @ApiResponse({ 
    status: 200, 
    description: 'School grades overview retrieved successfully',
  })
  async getSchoolGradesOverview(
    @Query('levelId') levelId?: string,
    @Query('courseId') courseId?: string,
    @Query('classGroupId') classGroupId?: string,
  ) {
    return this.gradesService.getSchoolGradesOverview({
      levelId,
      courseId,
      classGroupId,
    });
  }

  @Get('export/student/:studentId')
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.FAMILY)
  @ApiOperation({ summary: 'Export student grades as PDF' })
  @ApiParam({ name: 'studentId', description: 'Student ID' })
  @ApiQuery({ name: 'period', required: false, description: 'Academic period' })
  @ApiResponse({ 
    status: 200, 
    description: 'PDF generated successfully',
    content: {
      'application/pdf': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async exportStudentGrades(
    @Param('studentId', ParseUUIDPipe) studentId: string,
    @Query('period') period: string,
    @Request() req,
  ) {
    return this.gradesService.exportStudentGrades(
      studentId,
      req.user.id,
      req.user.role,
      period,
    );
  }
}