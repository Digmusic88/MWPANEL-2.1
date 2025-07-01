export declare class SubmitTaskDto {
    content?: string;
    submissionNotes?: string;
}
export declare class ResubmitTaskDto extends SubmitTaskDto {
    revisionComments?: string;
}
