'use server'

import {revalidatePath} from "next/cache";
import {userService} from "@/entities/user";
import {extractApiError} from "@/shared/libs";

export type UserManageActionResult = {
    ok: true;
    link?: string;
    message?: string;
} | {
    ok: false;
    error: string;
};

async function setBanned(pk: number, banned: boolean): Promise<UserManageActionResult> {
    const {ok, error, status} = banned
        ? await userService.ban(pk)
        : await userService.unban(pk);

    if (ok) {
        revalidatePath('/users');
        return {ok: true};
    }

    if (status === 500) return {ok: false, error: 'Server error'};
    return {ok: false, error: extractApiError(error, 'Action failed')};
}

export async function banUserAction(pk: number): Promise<UserManageActionResult> {
    return setBanned(pk, true);
}

export async function unbanUserAction(pk: number): Promise<UserManageActionResult> {
    return setBanned(pk, false);
}

export async function restorePasswordAction(pk: number): Promise<UserManageActionResult> {
    const {ok, result, error, status} = await userService.restorePassword(pk);

    if (ok) {
        revalidatePath('/users');
        return {ok: true, link: result.link, message: result.details};
    }

    if (status === 500) return {ok: false, error: 'Server error'};
    return {ok: false, error: extractApiError(error, 'Action failed')};
}
