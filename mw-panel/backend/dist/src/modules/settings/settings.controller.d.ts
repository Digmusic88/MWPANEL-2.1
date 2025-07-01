import { SettingsService } from './settings.service';
import { CreateSystemSettingDto, UpdateSystemSettingDto } from './dto/system-setting.dto';
import { SystemSetting, SettingCategory } from './entities/system-setting.entity';
export declare class SettingsController {
    private readonly settingsService;
    constructor(settingsService: SettingsService);
    create(createDto: CreateSystemSettingDto): Promise<SystemSetting>;
    findAll(category?: SettingCategory): Promise<SystemSetting[]>;
    getModuleSettings(): Promise<SystemSetting[]>;
    findByKey(key: string): Promise<SystemSetting>;
    update(key: string, updateDto: UpdateSystemSettingDto): Promise<SystemSetting>;
    delete(key: string): Promise<{
        message: string;
    }>;
    enableModule(moduleName: string): Promise<{
        message: string;
    }>;
    disableModule(moduleName: string): Promise<{
        message: string;
    }>;
    getModuleStatus(moduleName: string): Promise<{
        enabled: boolean;
    }>;
    initializeSettings(): Promise<{
        message: string;
    }>;
}
