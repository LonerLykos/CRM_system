import {zod} from "@/shared/libs";


export const loginSchema = zod.object({
  email: zod.email('Incorrect email format'),
  password: zod.string().min(4, 'The password must be at least 4 characters'),
});

export type LoginFormData = zod.infer<typeof loginSchema>;
