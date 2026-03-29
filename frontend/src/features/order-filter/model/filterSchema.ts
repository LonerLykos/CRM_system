import {zod} from "@/shared/libs/zod/zod";


export const filterSchema = zod.object({
  some_option: zod.string().min(4, 'Some має бути не менше 4 символів'),
  some_option2: zod.string().min(4, 'Some має бути не менше 4 символів'),
});

export type LoginFormData = zod.infer<typeof filterSchema>;