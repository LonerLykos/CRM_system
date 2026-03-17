import {IRequestsErrors} from "@/shared/api";

export type WrappedResponse<T> = {
    ok: true;
    status: number;
    result: T;
    error: null;
} | {
    ok: false;
    status: number;
    result: null;
    error: IRequestsErrors;
}
