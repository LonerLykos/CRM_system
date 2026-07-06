import {zod} from "@/shared/libs/zod/zod";


export const groupCreateSchema = zod.object({
    name: zod
        .string()
        .min(1, 'Group name cannot be empty')
        .max(100, 'Group name must be at most 100 characters'),
});

export type GroupCreateFormData = zod.infer<typeof groupCreateSchema>;
