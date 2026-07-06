import {zod} from "@/shared/libs/zod/zod";


export const filterSchema = zod.object({
  group: zod
    .string()
    .regex(/^\d*$/, 'Group must be a valid id')
    .optional(),
});

export type FilterSchema = zod.infer<typeof filterSchema>;
