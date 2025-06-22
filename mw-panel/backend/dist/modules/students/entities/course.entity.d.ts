import { Cycle } from './cycle.entity';
import { Subject } from './subject.entity';
export declare class Course {
    id: string;
    name: string;
    order: number;
    academicYear: string;
    cycle: Cycle;
    subjects: Subject[];
}
