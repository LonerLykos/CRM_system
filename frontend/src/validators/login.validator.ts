import {zod} from "../../zodAlias.ts";


// const emailRegex = /^[a-zA-Z0-9_.]+@[a-z0-9]+\.[a-z]+$/;
// const passwordRegex = /^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[^\w\s:])(\S){8,16}$/;

const loginSchema = zod.object({
    email: zod
        .string()
        .min(1, 'Email is required'),
        // .regex(emailRegex, 'Invalid email format')

    password: zod
        .string()
        .min(1, 'Password is required'),
    // password: zod
    //     .string()
    //     .regex(passwordRegex, 'Password must be at least 8-16 characters long and contain one uppercase letter, one digit')
    //     .min(1, 'Password is required'),
});

export default loginSchema;