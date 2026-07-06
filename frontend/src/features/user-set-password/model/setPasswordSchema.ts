import {zod} from "@/shared/libs";


export const setPasswordSchema = zod.object({
    password: zod
        .string()
        .min(8, 'Password must be at least 8 characters')
        .refine(
            (val) => !/^\d+$/.test(val),
            'Password cannot be entirely numeric'
        ),
    confirmPassword: zod.string(),
}).refine(
    (data) => data.password === data.confirmPassword,
    {
        message: 'Passwords do not match',
        path: ['confirmPassword'],
    }
);

export type SetPasswordFormData = zod.infer<typeof setPasswordSchema>;
