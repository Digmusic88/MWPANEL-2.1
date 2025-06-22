"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateClassroomDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_classroom_dto_1 = require("./create-classroom.dto");
class UpdateClassroomDto extends (0, swagger_1.PartialType)(create_classroom_dto_1.CreateClassroomDto) {
}
exports.UpdateClassroomDto = UpdateClassroomDto;
//# sourceMappingURL=update-classroom.dto.js.map