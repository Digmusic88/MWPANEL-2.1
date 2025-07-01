"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateCalendarEventDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_calendar_event_dto_1 = require("./create-calendar-event.dto");
class UpdateCalendarEventDto extends (0, mapped_types_1.PartialType)(create_calendar_event_dto_1.CreateCalendarEventDto) {
}
exports.UpdateCalendarEventDto = UpdateCalendarEventDto;
//# sourceMappingURL=update-calendar-event.dto.js.map