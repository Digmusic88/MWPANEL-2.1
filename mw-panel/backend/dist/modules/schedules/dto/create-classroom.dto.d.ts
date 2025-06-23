import { ClassroomType } from '../../students/entities/classroom.entity';
export declare class CreateClassroomDto {
    name: string;
    code: string;
    capacity: number;
    type: ClassroomType;
    equipment?: string[];
    building?: string;
    floor?: number;
    description?: string;
    isActive?: boolean;
    preferredEducationalLevelId?: string;
}
