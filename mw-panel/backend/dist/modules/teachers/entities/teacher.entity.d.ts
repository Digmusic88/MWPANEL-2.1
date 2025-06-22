import { User } from '../../users/entities/user.entity';
import { Subject } from '../../students/entities/subject.entity';
import { ClassGroup } from '../../students/entities/class-group.entity';
import { Evaluation } from '../../evaluations/entities/evaluation.entity';
export declare class Teacher {
    id: string;
    employeeNumber: string;
    specialties: string[];
    user: User;
    subjects: Subject[];
    tutoredClasses: ClassGroup[];
    evaluations: Evaluation[];
    createdAt: Date;
    updatedAt: Date;
}
