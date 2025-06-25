import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  ParseUUIDPipe,
} from '@nestjs/common';
import { CalendarService } from './calendar.service';
import {
  CreateCalendarEventDto,
  UpdateCalendarEventDto,
  CalendarEventQueryDto,
} from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { CalendarEventType } from './entities';

@Controller('calendar')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  async create(
    @Body() createEventDto: CreateCalendarEventDto,
    @Request() req: any,
  ) {
    return this.calendarService.create(createEventDto, req.user.id);
  }

  @Get()
  async findAll(@Query() query: CalendarEventQueryDto, @Request() req: any) {
    return this.calendarService.findAll(query, req.user.id);
  }

  @Get('upcoming')
  async getUpcomingEvents(
    @Query('days') days: string = '7',
    @Request() req: any,
  ) {
    return this.calendarService.getUpcomingEvents(req.user.id, parseInt(days));
  }

  @Get('by-type/:type')
  async getEventsByType(
    @Param('type') type: CalendarEventType,
    @Request() req: any,
  ) {
    return this.calendarService.getEventsByType(type, req.user.id);
  }

  @Get('by-student/:studentId')
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.FAMILY)
  async getEventsByStudent(
    @Param('studentId', ParseUUIDPipe) studentId: string,
    @Request() req: any,
  ) {
    return this.calendarService.getEventsByStudent(studentId, req.user.id);
  }

  @Get('date-range')
  async getEventsByDateRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Request() req: any,
  ) {
    return this.calendarService.getEventsByDateRange(
      startDate,
      endDate,
      req.user.id,
    );
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
    return this.calendarService.findOne(id, req.user.id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateEventDto: UpdateCalendarEventDto,
    @Request() req: any,
  ) {
    return this.calendarService.update(id, updateEventDto, req.user.id);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  async remove(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
    await this.calendarService.remove(id, req.user.id);
    return { message: 'Evento eliminado exitosamente' };
  }
}