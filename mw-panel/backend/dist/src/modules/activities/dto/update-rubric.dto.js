"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateRubricDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_rubric_dto_1 = require("./create-rubric.dto");
class UpdateRubricDto extends (0, swagger_1.PartialType)(create_rubric_dto_1.CreateRubricDto) {
}
exports.UpdateRubricDto = UpdateRubricDto;
//# sourceMappingURL=update-rubric.dto.js.map