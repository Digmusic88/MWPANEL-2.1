import { ClassGroupsService } from './class-groups.service';
import { CreateClassGroupDto } from './dto/create-class-group.dto';
import { UpdateClassGroupDto } from './dto/update-class-group.dto';
import { AssignStudentsDto } from './dto/assign-students.dto';
export declare class ClassGroupsController {
    private readonly classGroupsService;
    constructor(classGroupsService: ClassGroupsService);
    findAll(academicYearId?: string, courseId?: string, tutorId?: string): Promise<import("../students/entities/class-group.entity").ClassGroup[]>;
    getAvailableStudents(courseId?: string): Promise<import("../students/entities/student.entity").Student[]>;
    getAvailableTeachers(): Promise<import("../teachers/entities/teacher.entity").Teacher[]>;
    getAvailableCourses(): Promise<import("../students/entities/course.entity").Course[]>;
    findOne(id: string): Promise<import("../students/entities/class-group.entity").ClassGroup>;
    create(createClassGroupDto: CreateClassGroupDto): Promise<import("../students/entities/class-group.entity").ClassGroup>;
    update(id: string, updateClassGroupDto: UpdateClassGroupDto): Promise<import("../students/entities/class-group.entity").ClassGroup>;
    assignStudents(id: string, assignStudentsDto: AssignStudentsDto): Promise<import("../students/entities/class-group.entity").ClassGroup>;
    removeStudent(id: string, studentId: string): Promise<import("../students/entities/class-group.entity").ClassGroup>;
    assignTutor(id: string, tutorId: string): Promise<import("../students/entities/class-group.entity").ClassGroup>;
    removeTutor(id: string): Promise<import("../students/entities/class-group.entity").ClassGroup>;
    remove(id: string): Promise<void>;
}
