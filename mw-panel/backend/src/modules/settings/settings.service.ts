import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { SystemSetting, SettingType, SettingCategory } from './entities/system-setting.entity';
import { CreateSystemSettingDto, UpdateSystemSettingDto } from './dto/system-setting.dto';

@Injectable()
export class SettingsService {
  private cache = new Map<string, any>();

  constructor(
    @InjectRepository(SystemSetting)
    private settingsRepository: Repository<SystemSetting>,
  ) {
    this.initializeCache();
  }

  // ==================== CRUD SETTINGS ====================

  async create(createDto: CreateSystemSettingDto): Promise<SystemSetting> {
    // Verificar que no exista la clave
    const existing = await this.settingsRepository.findOne({
      where: { key: createDto.key },
    });

    if (existing) {
      throw new BadRequestException(`Setting with key '${createDto.key}' already exists`);
    }

    // Validar el valor según el tipo
    this.validateValue(createDto.value, createDto.type);

    const setting = this.settingsRepository.create(createDto);
    const saved = await this.settingsRepository.save(setting);

    // Actualizar cache
    this.cache.set(saved.key, saved.parsedValue);

    return saved;
  }

  async findAll(category?: SettingCategory): Promise<SystemSetting[]> {
    const query = this.settingsRepository.createQueryBuilder('setting')
      .orderBy('setting.category', 'ASC')
      .addOrderBy('setting.sortOrder', 'ASC')
      .addOrderBy('setting.name', 'ASC');

    if (category) {
      query.where('setting.category = :category', { category });
    }

    return query.getMany();
  }

  async findByKey(key: string): Promise<SystemSetting> {
    const setting = await this.settingsRepository.findOne({ where: { key } });
    if (!setting) {
      throw new NotFoundException(`Setting with key '${key}' not found`);
    }
    return setting;
  }

  async update(key: string, updateDto: UpdateSystemSettingDto): Promise<SystemSetting> {
    const setting = await this.findByKey(key);

    if (!setting.isEditable) {
      throw new BadRequestException(`Setting '${key}' is not editable`);
    }

    // Validar el nuevo valor
    this.validateValue(updateDto.value, setting.type);

    // Actualizar
    Object.assign(setting, updateDto);
    const updated = await this.settingsRepository.save(setting);

    // Actualizar cache
    this.cache.set(updated.key, updated.parsedValue);

    return updated;
  }

  async delete(key: string): Promise<void> {
    const setting = await this.findByKey(key);
    await this.settingsRepository.remove(setting);
    this.cache.delete(key);
  }

  // ==================== GETTERS RÁPIDOS ====================

  async getValue<T = any>(key: string, defaultValue?: T): Promise<T> {
    // Intentar desde cache primero
    if (this.cache.has(key)) {
      return this.cache.get(key) as T;
    }

    // Si no está en cache, buscar en BD
    try {
      const setting = await this.findByKey(key);
      const value = setting.parsedValue;
      this.cache.set(key, value);
      return value as T;
    } catch {
      return defaultValue as T;
    }
  }

  async getBoolean(key: string, defaultValue: boolean = false): Promise<boolean> {
    return this.getValue<boolean>(key, defaultValue);
  }

  async getString(key: string, defaultValue: string = ''): Promise<string> {
    return this.getValue<string>(key, defaultValue);
  }

  async getNumber(key: string, defaultValue: number = 0): Promise<number> {
    return this.getValue<number>(key, defaultValue);
  }

  async getJSON<T = any>(key: string, defaultValue: T = {} as T): Promise<T> {
    return this.getValue<T>(key, defaultValue);
  }

  // ==================== SETTERS RÁPIDOS ====================

  async setValue(key: string, value: any): Promise<void> {
    try {
      const setting = await this.findByKey(key);
      const stringValue = this.valueToString(value, setting.type);
      await this.update(key, { value: stringValue });
    } catch {
      // Si no existe, no hacer nada o crear según necesidad
      throw new NotFoundException(`Setting '${key}' not found`);
    }
  }

  async setBoolean(key: string, value: boolean): Promise<void> {
    await this.setValue(key, value);
  }

  async setString(key: string, value: string): Promise<void> {
    await this.setValue(key, value);
  }

  async setNumber(key: string, value: number): Promise<void> {
    await this.setValue(key, value);
  }

  async setJSON(key: string, value: any): Promise<void> {
    await this.setValue(key, value);
  }

  // ==================== MÓDULOS ====================

  async isModuleEnabled(moduleName: string): Promise<boolean> {
    const key = `module_${moduleName}_enabled`;
    return this.getBoolean(key, false);
  }

  async enableModule(moduleName: string): Promise<void> {
    const key = `module_${moduleName}_enabled`;
    await this.setBoolean(key, true);
  }

  async disableModule(moduleName: string): Promise<void> {
    const key = `module_${moduleName}_enabled`;
    await this.setBoolean(key, false);
  }

  // ==================== INICIALIZACIÓN ====================

  async initializeDefaultSettings(): Promise<void> {
    const defaults = [
      SystemSetting.createModuleSetting(
        'module_expedientes_enabled',
        'Módulo de Expedientes',
        'Habilita el módulo de expedientes académicos y generación de boletines PDF',
        false
      ),
      SystemSetting.createModuleSetting(
        'module_calendario_enabled',
        'Módulo de Calendario',
        'Habilita el calendario académico integrado',
        false
      ),
      SystemSetting.createModuleSetting(
        'module_recursos_enabled',
        'Módulo de Recursos',
        'Habilita el portal de recursos educativos',
        false
      ),
      SystemSetting.createModuleSetting(
        'module_analytics_enabled',
        'Módulo de Analytics',
        'Habilita el dashboard de métricas y estadísticas avanzadas',
        false
      ),
      SystemSetting.createModuleSetting(
        'module_chat_enabled',
        'Módulo de Chat',
        'Habilita el chat en tiempo real',
        false
      ),
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
      } catch (error) {
        console.error(`Error creating default setting ${settingData.key}:`, error);
      }
    }

    // Refrescar cache
    await this.initializeCache();
  }

  private async initializeCache(): Promise<void> {
    try {
      const settings = await this.settingsRepository.find();
      this.cache.clear();
      settings.forEach(setting => {
        this.cache.set(setting.key, setting.parsedValue);
      });
    } catch (error) {
      console.error('Error initializing settings cache:', error);
    }
  }

  // ==================== HELPERS PRIVADOS ====================

  private validateValue(value: string, type: SettingType): void {
    switch (type) {
      case SettingType.BOOLEAN:
        if (value !== 'true' && value !== 'false') {
          throw new BadRequestException(`Boolean value must be 'true' or 'false', got: ${value}`);
        }
        break;
      case SettingType.NUMBER:
        if (isNaN(parseFloat(value))) {
          throw new BadRequestException(`Number value is invalid: ${value}`);
        }
        break;
      case SettingType.JSON:
        try {
          JSON.parse(value);
        } catch {
          throw new BadRequestException(`JSON value is invalid: ${value}`);
        }
        break;
    }
  }

  private valueToString(value: any, type: SettingType): string {
    switch (type) {
      case SettingType.BOOLEAN:
        return Boolean(value).toString();
      case SettingType.NUMBER:
        return Number(value).toString();
      case SettingType.JSON:
        return JSON.stringify(value);
      default:
        return String(value);
    }
  }
}