'use server'

import {revalidatePath} from "next/cache";
import {crmService, IGroupResponse} from "@/entities/crm";
import {extractApiError} from "@/shared/libs";
import {groupCreateSchema} from "./groupCreateSchema";

export interface GroupCreateResult {
    group?: IGroupResponse;
    existing?: boolean;
    error?: string;
}

export async function groupCreateAction(name: string): Promise<GroupCreateResult> {
    const validated = groupCreateSchema.safeParse({name});

    if (!validated.success) {
        return {error: validated.error.issues[0].message};
    }

    const {ok, status, error, result} = await crmService.createGroup({name: validated.data.name});

    if (ok) {
        revalidatePath('/crm');
        return {group: result ?? undefined};
    }

    if (status === 500) {
        return {error: 'The server is not responding'};
    }

    const {ok: listOk, result: groups} = await crmService.getGroups();
    const existing = listOk
        ? groups?.find((group) => group.name === validated.data.name.trim())
        : undefined;

    if (existing) {
        return {group: existing, existing: true};
    }

    return {error: extractApiError(error, 'Failed to create group')};
}
