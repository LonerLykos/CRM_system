'use server'

import {revalidatePath} from "next/cache";
import {userCreateSchema} from "@/features/user-create";
import {userService} from "@/entities/user";
import {extractApiError} from "@/shared/libs";

export type UserCreateActionState = {
    ok: true;
    link: string;
    details: string;
} | {
    ok: false;
    error: string;
} | null;

export async function userCreateAction(
    _prevState: UserCreateActionState,
    formData: FormData,
): Promise<UserCreateActionState> {
    const rawData = Object.fromEntries(formData.entries());
    const validated = userCreateSchema.safeParse(rawData);

    if (!validated.success) {
        return {ok: false, error: validated.error.issues[0].message};
    }

    const {ok, result, error, status} = await userService.createUser(validated.data);

    if (ok) {
        revalidatePath('/users');
        return {ok: true, link: result.link, details: result.details};
    }

    if (status === 500) {
        return {ok: false, error: 'The server is not responding'};
    }

    return {ok: false, error: extractApiError(error, 'Failed to create user')};
}
