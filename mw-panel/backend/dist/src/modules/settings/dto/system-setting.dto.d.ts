import { SettingType, SettingCategory } from '../entities/system-setting.entity';
export declare class CreateSystemSettingDto {
    key: string;
    name: string;
    description?: string;
    type: SettingType;
    category: SettingCategory;
    value: string;
    defaultValue?: string;
    isEditable?: boolean;
    requiresRestart?: boolean;
    validationRules?: string;
    sortOrder?: number;
}
export declare class UpdateSystemSettingDto {
    name?: string;
    description?: string;
    value: string;
    sortOrder?: number;
}
export declare class SystemSettingResponseDto {
    id: string;
    key: string;
    name: string;
    description?: string;
    type: SettingType;
    category: SettingCategory;
    value: string;
    parsedValue: any;
    defaultValue?: string;
    isEditable: boolean;
    requiresRestart: boolean;
    sortOrder: number;
    createdAt: Date;
    updatedAt: Date;
}
