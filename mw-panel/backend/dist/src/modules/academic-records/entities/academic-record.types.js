"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GradeType = exports.EntryType = exports.RecordStatus = exports.AcademicPeriod = exports.AcademicYear = void 0;
var AcademicYear;
(function (AcademicYear) {
    AcademicYear["YEAR_2023_2024"] = "2023-2024";
    AcademicYear["YEAR_2024_2025"] = "2024-2025";
    AcademicYear["YEAR_2025_2026"] = "2025-2026";
    AcademicYear["YEAR_2026_2027"] = "2026-2027";
    AcademicYear["YEAR_2027_2028"] = "2027-2028";
})(AcademicYear || (exports.AcademicYear = AcademicYear = {}));
var AcademicPeriod;
(function (AcademicPeriod) {
    AcademicPeriod["FIRST_TRIMESTER"] = "first_trimester";
    AcademicPeriod["SECOND_TRIMESTER"] = "second_trimester";
    AcademicPeriod["THIRD_TRIMESTER"] = "third_trimester";
    AcademicPeriod["FIRST_SEMESTER"] = "first_semester";
    AcademicPeriod["SECOND_SEMESTER"] = "second_semester";
    AcademicPeriod["ANNUAL"] = "annual";
})(AcademicPeriod || (exports.AcademicPeriod = AcademicPeriod = {}));
var RecordStatus;
(function (RecordStatus) {
    RecordStatus["ACTIVE"] = "active";
    RecordStatus["COMPLETED"] = "completed";
    RecordStatus["TRANSFERRED"] = "transferred";
    RecordStatus["ARCHIVED"] = "archived";
})(RecordStatus || (exports.RecordStatus = RecordStatus = {}));
var EntryType;
(function (EntryType) {
    EntryType["ACADEMIC"] = "academic";
    EntryType["ATTENDANCE"] = "attendance";
    EntryType["BEHAVIORAL"] = "behavioral";
    EntryType["ACHIEVEMENT"] = "achievement";
    EntryType["DISCIPLINARY"] = "disciplinary";
    EntryType["MEDICAL"] = "medical";
    EntryType["OTHER"] = "other";
})(EntryType || (exports.EntryType = EntryType = {}));
var GradeType;
(function (GradeType) {
    GradeType["EXAM"] = "exam";
    GradeType["QUIZ"] = "quiz";
    GradeType["HOMEWORK"] = "homework";
    GradeType["PROJECT"] = "project";
    GradeType["PARTICIPATION"] = "participation";
    GradeType["ATTENDANCE"] = "attendance";
    GradeType["FINAL"] = "final";
    GradeType["MIDTERM"] = "midterm";
    GradeType["ASSIGNMENT"] = "assignment";
    GradeType["OTHER"] = "other";
})(GradeType || (exports.GradeType = GradeType = {}));
//# sourceMappingURL=academic-record.types.js.map