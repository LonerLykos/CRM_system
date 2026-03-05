import {zod} from "@/shared/libs/zod/zod";


export const loginSchema = zod.object({
  email: zod.email('Некоректний формат email'),
  password: zod.string().min(4, 'Пароль має бути не менше 4 символів'),
});

export type LoginFormData = zod.infer<typeof loginSchema>;