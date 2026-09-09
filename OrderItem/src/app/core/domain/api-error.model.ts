export interface FastApiValidationIssue {
    type?: string;
    loc?: Array<string | number>;
    msg: string;
}

export interface FastApiErrorBody {
    detail?: string | FastApiValidationIssue[];
}