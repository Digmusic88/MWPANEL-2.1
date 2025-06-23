import { Teacher } from '../../teachers/entities/teacher.entity';
import { Subject } from './subject.entity';
import { ClassGroup } from './class-group.entity';
import { AcademicYear } from './academic-year.entity';
export declare class SubjectAssignment {
    id: string;
    teacher: Teacher;
    subject: Subject;
    classGroup: ClassGroup;
    academicYear: AcademicYear;
    weeklyHours: number;
    notes: string;
    createdAt: Date;
    updatedAt: Date;
}
