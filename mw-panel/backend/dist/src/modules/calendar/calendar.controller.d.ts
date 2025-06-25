import { CalendarService } from './calendar.service';
import { CreateCalendarEventDto, UpdateCalendarEventDto, CalendarEventQueryDto } from './dto';
import { CalendarEventType } from './entities';
export declare class CalendarController {
    private readonly calendarService;
    constructor(calendarService: CalendarService);
    create(createEventDto: CreateCalendarEventDto, req: any): Promise<import("./entities").CalendarEvent>;
    findAll(query: CalendarEventQueryDto, req: any): Promise<import("./entities").CalendarEvent[]>;
    getUpcomingEvents(days: string, req: any): Promise<import("./entities").CalendarEvent[]>;
    getEventsByType(type: CalendarEventType, req: any): Promise<import("./entities").CalendarEvent[]>;
    getEventsByStudent(studentId: string, req: any): Promise<import("./entities").CalendarEvent[]>;
    getEventsByDateRange(startDate: string, endDate: string, req: any): Promise<import("./entities").CalendarEvent[]>;
    findOne(id: string, req: any): Promise<import("./entities").CalendarEvent>;
    update(id: string, updateEventDto: UpdateCalendarEventDto, req: any): Promise<import("./entities").CalendarEvent>;
    remove(id: string, req: any): Promise<{
        message: string;
    }>;
    getTeacherClassEvents(req: any): Promise<import("./entities").CalendarEvent[]>;
}
