export declare enum SettingType {
    BOOLEAN = "boolean",
    STRING = "string",
    NUMBER = "number",
    JSON = "json"
}
export declare enum SettingCategory {
    GENERAL = "general",
    ACADEMIC = "academic",
    REPORTS = "reports",
    COMMUNICATIONS = "communications",
    MODULES = "modules"
}
export declare class SystemSetting {
    id: string;
    key: string;
    name: string;
    description: string;
    type: SettingType;
    category: SettingCategory;
    value: string;
    defaultValue: string;
    isEditable: boolean;
    requiresRestart: boolean;
    validationRules: string;
    sortOrder: number;
    createdAt: Date;
    updatedAt: Date;
    get parsedValue(): any;
    static createModuleSetting(key: string, name: string, description: string, defaultEnabled?: boolean): Partial<SystemSetting>;
}
