"use server";

import {authService} from "@/services/auth_service";
import {loginSchema} from "@/validator/login.validator";
import {redirect} from "next/navigation";

export const loginAction = async (formData: FormData) => {
    const parsed = loginSchema.safeParse(formData)

    if (!parsed.success) {
        throw new Error("Validation error");
    }

    const user = await authService.login(parsed.data.email, parsed.data.password);

    if (!user) {
        throw new Error("Invalid credentials");
    }
    redirect("/");
}