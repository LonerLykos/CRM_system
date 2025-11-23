import {zod} from "@/lib/zod";


export const loginSchema = zod.object({
    email: zod
        .string()
        .min(1, "Email can`t be empty")
        .refine((val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), { message: "Invalid email" }),
    password: zod.string().min(1, "Password can`t be empty"),
});