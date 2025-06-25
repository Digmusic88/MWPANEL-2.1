import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';

export enum SettingType {
  BOOLEAN = 'boolean',
  STRING = 'string',
  NUMBER = 'number',
  JSON = 'json',
}

export enum SettingCategory {
  GENERAL = 'general',
  ACADEMIC = 'academic',
  REPORTS = 'reports',
  COMMUNICATIONS = 'communications',
  MODULES = 'modules',
}

@Entity('system_settings')
@Unique(['key'])
export class SystemSetting {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  key: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: SettingType,
    default: SettingType.STRING,
  })
  type: SettingType;

  @Column({
    type: 'enum',
    enum: SettingCategory,
    default: SettingCategory.GENERAL,
  })
  category: SettingCategory;

  @Column({ type: 'text' })
  value: string;

  @Column({ type: 'text', nullable: true })
  defaultValue: string;

  @Column({ type: 'boolean', default: true })
  isEditable: boolean;

  @Column({ type: 'boolean', default: false })
  requiresRestart: boolean;

  @Column({ type: 'text', nullable: true })
  validationRules: string; // JSON string with validation rules

  @Column({ type: 'int', default: 0 })
  sortOrder: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Helper methods
  get parsedValue(): any {
    switch (this.type) {
      case SettingType.BOOLEAN:
        return this.value === 'true';
      case SettingType.NUMBER:
        return parseFloat(this.value);
      case SettingType.JSON:
        try {
          return JSON.parse(this.value);
        } catch {
          return {};
        }
      default:
        return this.value;
    }
  }

  static createModuleSetting(
    key: string,
    name: string,
    description: string,
    defaultEnabled: boolean = false
  ): Partial<SystemSetting> {
    return {
      key,
      name,
      description,
      type: SettingType.BOOLEAN,
      category: SettingCategory.MODULES,
      value: defaultEnabled.toString(),
      defaultValue: defaultEnabled.toString(),
      isEditable: true,
      requiresRestart: false,
    };
  }
}