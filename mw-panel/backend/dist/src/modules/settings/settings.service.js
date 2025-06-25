"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const system_setting_entity_1 = require("./entities/system-setting.entity");
let SettingsService = class SettingsService {
    constructor(settingsRepository) {
        this.settingsRepository = settingsRepository;
        this.cache = new Map();
        this.initializeCache();
    }
    async create(createDto) {
        const existing = await this.settingsRepository.findOne({
            where: { key: createDto.key },
        });
        if (existing) {
            throw new common_1.BadRequestException(`Setting with key '${createDto.key}' already exists`);
        }
        this.validateValue(createDto.value, createDto.type);
        const setting = this.settingsRepository.create(createDto);
        const saved = await this.settingsRepository.save(setting);
        this.cache.set(saved.key, saved.parsedValue);
        return saved;
    }
    async findAll(category) {
        const query = this.settingsRepository.createQueryBuilder('setting')
            .orderBy('setting.category', 'ASC')
            .addOrderBy('setting.sortOrder', 'ASC')
            .addOrderBy('setting.name', 'ASC');
        if (category) {
            query.where('setting.category = :category', { category });
        }
        return query.getMany();
    }
    async findByKey(key) {
        const setting = await this.settingsRepository.findOne({ where: { key } });
        if (!setting) {
            throw new common_1.NotFoundException(`Setting with key '${key}' not found`);
        }
        return setting;
    }
    async update(key, updateDto) {
        const setting = await this.findByKey(key);
        if (!setting.isEditable) {
            throw new common_1.BadRequestException(`Setting '${key}' is not editable`);
        }
        this.validateValue(updateDto.value, setting.type);
        Object.assign(setting, updateDto);
        const updated = await this.settingsRepository.save(setting);
        this.cache.set(updated.key, updated.parsedValue);
        return updated;
    }
    async delete(key) {
        const setting = await this.findByKey(key);
        await this.settingsRepository.remove(setting);
        this.cache.delete(key);
    }
    async getValue(key, defaultValue) {
        if (this.cache.has(key)) {
            return this.cache.get(key);
        }
        try {
            const setting = await this.findByKey(key);
            const value = setting.parsedValue;
            this.cache.set(key, value);
            return value;
        }
        catch {
            return defaultValue;
        }
    }
    async getBoolean(key, defaultValue = false) {
        return this.getValue(key, defaultValue);
    }
    async getString(key, defaultValue = '') {
        return this.getValue(key, defaultValue);
    }
    async getNumber(key, defaultValue = 0) {
        return this.getValue(key, defaultValue);
    }
    async getJSON(key, defaultValue = {}) {
        return this.getValue(key, defaultValue);
    }
    async setValue(key, value) {
        try {
            const setting = await this.findByKey(key);
            const stringValue = this.valueToString(value, setting.type);
            await this.update(key, { value: stringValue });
        }
        catch {
            throw new common_1.NotFoundException(`Setting '${key}' not found`);
        }
    }
    async setBoolean(key, value) {
        await this.setValue(key, value);
    }
    async setString(key, value) {
        await this.setValue(key, value);
    }
    async setNumber(key, value) {
        await this.setValue(key, value);
    }
    async setJSON(key, value) {
        await this.setValue(key, value);
    }
    async isModuleEnabled(moduleName) {
        const key = `module_${moduleName}_enabled`;
        return this.getBoolean(key, false);
    }
    async enableModule(moduleName) {
        const key = `module_${moduleName}_enabled`;
        await this.setBoolean(key, true);
    }
    async disableModule(moduleName) {
        const key = `module_${moduleName}_enabled`;
        await this.setBoolean(key, false);
    }
    async initializeDefaultSettings() {
        const defaults = [
            system_setting_entity_1.SystemSetting.createModuleSetting('module_expedientes_enabled', 'Módulo de Expedientes', 'Habilita el módulo de expedientes académicos y generación de boletines PDF', false),
            system_setting_entity_1.SystemSetting.createModuleSetting('module_calendario_enabled', 'Módulo de Calendario', 'Habilita el calendario académico integrado', false),
            system_setting_entity_1.SystemSetting.createModuleSetting('module_recursos_enabled', 'Módulo de Recursos', 'Habilita el portal de recursos educativos', false),
            system_setting_entity_1.SystemSetting.createModuleSetting('module_analytics_enabled', 'Módulo de Analytics', 'Habilita el dashboard de métricas y estadísticas avanzadas', false),
            system_setting_entity_1.SystemSetting.createModuleSetting('module_chat_enabled', 'Módulo de Chat', 'Habilita el chat en tiempo real', false),
        ];
        for (const settingData of defaults) {
            try {
                const exists = await this.settingsRepository.findOne({
                    where: { key: settingData.key },
                });
                if (!exists) {
                    const setting = this.settingsRepository.create(settingData);
                    await this.settingsRepository.save(setting);
                }
            }
            catch (error) {
                console.error(`Error creating default setting ${settingData.key}:`, error);
            }
        }
        await this.initializeCache();
    }
    async initializeCache() {
        try {
            const settings = await this.settingsRepository.find();
            this.cache.clear();
            settings.forEach(setting => {
                this.cache.set(setting.key, setting.parsedValue);
            });
        }
        catch (error) {
            console.error('Error initializing settings cache:', error);
        }
    }
    validateValue(value, type) {
        switch (type) {
            case system_setting_entity_1.SettingType.BOOLEAN:
                if (value !== 'true' && value !== 'false') {
                    throw new common_1.BadRequestException(`Boolean value must be 'true' or 'false', got: ${value}`);
                }
                break;
            case system_setting_entity_1.SettingType.NUMBER:
                if (isNaN(parseFloat(value))) {
                    throw new common_1.BadRequestException(`Number value is invalid: ${value}`);
                }
                break;
            case system_setting_entity_1.SettingType.JSON:
                try {
                    JSON.parse(value);
                }
                catch {
                    throw new common_1.BadRequestException(`JSON value is invalid: ${value}`);
                }
                break;
        }
    }
    valueToString(value, type) {
        switch (type) {
            case system_setting_entity_1.SettingType.BOOLEAN:
                return Boolean(value).toString();
            case system_setting_entity_1.SettingType.NUMBER:
                return Number(value).toString();
            case system_setting_entity_1.SettingType.JSON:
                return JSON.stringify(value);
            default:
                return String(value);
        }
    }
};
exports.SettingsService = SettingsService;
exports.SettingsService = SettingsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(system_setting_entity_1.SystemSetting)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], SettingsService);
//# sourceMappingURL=settings.service.js.map