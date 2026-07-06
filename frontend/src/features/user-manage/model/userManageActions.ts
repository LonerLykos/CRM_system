'use server'

import {revalidatePath} from "next/cache";
import {userService} from "@/entities/user";

export type UserManageActionResult = {
    ok: true;
    link?: string;
    message?: string;
} | {
    ok: false;
    error: string;
};

export async function banToggleAction(pk: number): Promise<UserManageActionResult> {
    const {ok, error, status} = await userService.banToggle(pk);

    if (ok) {
        revalidatePath('/users');
        return {ok: true};
    }

    if (status === 500) return {ok: false, error: 'Server error'};
    if (error && 'detail' in error && error.detail) return {ok: false, error: error.detail};
    return {ok: false, error: 'Action failed'};
}

export async function restorePasswordAction(pk: number): Promise<UserManageActionResult> {
    const {ok, result, error, status} = await userService.restorePassword(pk);

    if (ok) {
        revalidatePath('/users');
        return {ok: true, link: result.link, message: result.details};
    }

    if (status === 500) return {ok: false, error: 'Server error'};
    if (error && 'detail' in error && error.detail) return {ok: false, error: error.detail};
    return {ok: false, error: 'Action failed'};
}
