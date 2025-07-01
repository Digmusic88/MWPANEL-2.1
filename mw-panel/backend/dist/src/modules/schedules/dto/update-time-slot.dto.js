"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateTimeSlotDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_time_slot_dto_1 = require("./create-time-slot.dto");
class UpdateTimeSlotDto extends (0, swagger_1.PartialType)(create_time_slot_dto_1.CreateTimeSlotDto) {
}
exports.UpdateTimeSlotDto = UpdateTimeSlotDto;
//# sourceMappingURL=update-time-slot.dto.js.map