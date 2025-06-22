import { SubjectsService } from './subjects.service';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
import { CreateSubjectAssignmentDto } from './dto/create-subject-assignment.dto';
import { UpdateSubjectAssignmentDto } from './dto/update-subject-assignment.dto';
export declare class SubjectsController {
    private readonly subjectsService;
    constructor(subjectsService: SubjectsService);
    findAllSubjects(): Promise<import("../students/entities/subject.entity").Subject[]>;
    createSubject(createSubjectDto: CreateSubjectDto): Promise<import("../students/entities/subject.entity").Subject>;
    findSubjectsByCourse(courseId: string): Promise<import("../students/entities/subject.entity").Subject[]>;
    findOneSubject(id: string): Promise<import("../students/entities/subject.entity").Subject>;
    updateSubject(id: string, updateSubjectDto: UpdateSubjectDto): Promise<import("../students/entities/subject.entity").Subject>;
    removeSubject(id: string): Promise<void>;
    findAllAssignments(): Promise<import("../students/entities/subject-assignment.entity").SubjectAssignment[]>;
    createAssignment(createAssignmentDto: CreateSubjectAssignmentDto): Promise<import("../students/entities/subject-assignment.entity").SubjectAssignment>;
    findAssignmentsByTeacher(teacherId: string): Promise<import("../students/entities/subject-assignment.entity").SubjectAssignment[]>;
    findAssignmentsByClassGroup(classGroupId: string): Promise<import("../students/entities/subject-assignment.entity").SubjectAssignment[]>;
    findAssignmentsByAcademicYear(academicYearId: string): Promise<import("../students/entities/subject-assignment.entity").SubjectAssignment[]>;
    findOneAssignment(id: string): Promise<import("../students/entities/subject-assignment.entity").SubjectAssignment>;
    updateAssignment(id: string, updateAssignmentDto: UpdateSubjectAssignmentDto): Promise<import("../students/entities/subject-assignment.entity").SubjectAssignment>;
    removeAssignment(id: string): Promise<void>;
}
