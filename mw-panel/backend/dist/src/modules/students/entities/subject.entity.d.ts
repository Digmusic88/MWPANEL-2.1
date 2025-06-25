import { Course } from './course.entity';
export declare class Subject {
    id: string;
    name: string;
    code: string;
    weeklyHours: number;
    description: string;
    course: Course;
}
