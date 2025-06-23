import { EducationalLevel } from './educational-level.entity';
export declare class TimeSlot {
    id: string;
    name: string;
    startTime: string;
    endTime: string;
    order: number;
    isBreak: boolean;
    isActive: boolean;
    educationalLevel: EducationalLevel;
    createdAt: Date;
    updatedAt: Date;
}
