import { EducationalLevel } from './educational-level.entity';
export declare enum ClassroomType {
    REGULAR = "regular",
    LABORATORY = "laboratory",
    COMPUTER = "computer",
    GYM = "gym",
    MUSIC = "music",
    ART = "art",
    LIBRARY = "library",
    AUDITORIUM = "auditorium"
}
export declare class Classroom {
    id: string;
    name: string;
    code: string;
    capacity: number;
    type: ClassroomType;
    equipment: string[];
    building: string;
    floor: number;
    description: string;
    isActive: boolean;
    preferredEducationalLevel: EducationalLevel;
    createdAt: Date;
    updatedAt: Date;
}
