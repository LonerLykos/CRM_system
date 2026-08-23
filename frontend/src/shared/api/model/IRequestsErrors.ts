export interface IRequestsErrors {
    statusText?: string;
    detail?: string;
    [field: string]: string | string[] | undefined;
}
