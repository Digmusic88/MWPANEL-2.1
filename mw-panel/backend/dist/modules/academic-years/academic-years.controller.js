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
exports.AcademicYearsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const user_entity_1 = require("../users/entities/user.entity");
const academic_year_entity_1 = require("../students/entities/academic-year.entity");
let AcademicYearsController = class AcademicYearsController {
    constructor(academicYearRepository) {
        this.academicYearRepository = academicYearRepository;
    }
    async findAll() {
        return this.academicYearRepository.find({
            order: { startDate: 'DESC' },
        });
    }
};
exports.AcademicYearsController = AcademicYearsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener todos los años académicos' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lista de años académicos obtenida exitosamente' }),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.TEACHER),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AcademicYearsController.prototype, "findAll", null);
exports.AcademicYearsController = AcademicYearsController = __decorate([
    (0, swagger_1.ApiTags)('academic-years'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('academic-years'),
    __param(0, (0, typeorm_1.InjectRepository)(academic_year_entity_1.AcademicYear)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], AcademicYearsController);
//# sourceMappingURL=academic-years.controller.js.map