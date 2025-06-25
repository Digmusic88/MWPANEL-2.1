import { StudentsService } from './students.service';
export declare class StudentsController {
    private readonly studentsService;
    constructor(studentsService: StudentsService);
    findAll(): Promise<import("./entities/student.entity").Student[]>;
    getMyProfile(req: any): Promise<import("./entities/student.entity").Student>;
    findOne(id: string): Promise<import("./entities/student.entity").Student>;
    create(createStudentDto: any): Promise<import("./entities/student.entity").Student>;
    changeMyPassword(req: any, changePasswordDto: any): Promise<{
        message: string;
    }>;
    update(id: string, updateStudentDto: any): Promise<import("./entities/student.entity").Student>;
    remove(id: string): Promise<void>;
}
