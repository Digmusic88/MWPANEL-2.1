export declare enum ImportFormat {
    MARKDOWN = "markdown",
    CSV = "csv"
}
export declare class ImportRubricDto {
    name: string;
    description?: string;
    format: ImportFormat;
    data: string;
    isTemplate?: boolean;
    isVisibleToFamilies?: boolean;
    subjectAssignmentId?: string;
}
