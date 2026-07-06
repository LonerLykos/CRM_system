'use server'

import {revalidatePath} from "next/cache";
import {crmService, IGroupResponse} from "@/entities/crm";
import {groupCreateSchema} from "./groupCreateSchema";


export async function groupCreateAction(name: string): Promise<{ group?: IGroupResponse; error?: string }> {
    const validated = groupCreateSchema.safeParse({name});

    if (!validated.success) {
        return {error: validated.error.issues[0].message};
    }

    const {ok, status, error, result} = await crmService.createGroup({name: validated.data.name});

    if (ok) {
        revalidatePath('/crm');
        // Backend is get_or_create: `result` is the created OR pre-existing group.
        return {group: result ?? undefined};
    }

    if (status === 500) {
        return {error: 'The server is not responding'};
    }

    if (error && 'detail' in error) {
        return {error: error.detail as string};
    }

    if (error && 'statusText' in error) {
        return {error: error.statusText as string};
    }

    return {error: 'Failed to create group'};
}
