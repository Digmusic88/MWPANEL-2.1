import { Course } from './course.entity';
import { Teacher } from '../../teachers/entities/teacher.entity';
import { Student } from './student.entity';
import { AcademicYear } from './academic-year.entity';
export declare class ClassGroup {
    id: string;
    name: string;
    section: string;
    academicYear: AcademicYear;
    courses: Course[];
    tutor: Teacher;
    students: Student[];
    createdAt: Date;
    updatedAt: Date;
}
