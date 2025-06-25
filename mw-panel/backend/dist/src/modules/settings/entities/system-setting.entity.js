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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemSetting = exports.SettingCategory = exports.SettingType = void 0;
const typeorm_1 = require("typeorm");
var SettingType;
(function (SettingType) {
    SettingType["BOOLEAN"] = "boolean";
    SettingType["STRING"] = "string";
    SettingType["NUMBER"] = "number";
    SettingType["JSON"] = "json";
})(SettingType || (exports.SettingType = SettingType = {}));
var SettingCategory;
(function (SettingCategory) {
    SettingCategory["GENERAL"] = "general";
    SettingCategory["ACADEMIC"] = "academic";
    SettingCategory["REPORTS"] = "reports";
    SettingCategory["COMMUNICATIONS"] = "communications";
    SettingCategory["MODULES"] = "modules";
})(SettingCategory || (exports.SettingCategory = SettingCategory = {}));
let SystemSetting = class SystemSetting {
    get parsedValue() {
        switch (this.type) {
            case SettingType.BOOLEAN:
                return this.value === 'true';
            case SettingType.NUMBER:
                return parseFloat(this.value);
            case SettingType.JSON:
                try {
                    return JSON.parse(this.value);
                }
                catch {
                    return {};
                }
            default:
                return this.value;
        }
    }
    static createModuleSetting(key, name, description, defaultEnabled = false) {
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
};
exports.SystemSetting = SystemSetting;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], SystemSetting.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100 }),
    __metadata("design:type", String)
], SystemSetting.prototype, "key", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], SystemSetting.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], SystemSetting.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: SettingType,
        default: SettingType.STRING,
    }),
    __metadata("design:type", String)
], SystemSetting.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: SettingCategory,
        default: SettingCategory.GENERAL,
    }),
    __metadata("design:type", String)
], SystemSetting.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], SystemSetting.prototype, "value", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], SystemSetting.prototype, "defaultValue", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], SystemSetting.prototype, "isEditable", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], SystemSetting.prototype, "requiresRestart", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], SystemSetting.prototype, "validationRules", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], SystemSetting.prototype, "sortOrder", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], SystemSetting.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], SystemSetting.prototype, "updatedAt", void 0);
exports.SystemSetting = SystemSetting = __decorate([
    (0, typeorm_1.Entity)('system_settings'),
    (0, typeorm_1.Unique)(['key'])
], SystemSetting);
//# sourceMappingURL=system-setting.entity.js.map