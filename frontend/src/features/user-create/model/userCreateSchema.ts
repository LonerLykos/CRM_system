import {zod} from "@/shared/libs";

export const userCreateSchema = zod.object({
    email: zod.email('Incorrect email format'),
    name: zod.string().min(1, 'Name is required').max(20, 'Name max 20 chars'),
    surname: zod.string().min(1, 'Surname is required').max(50, 'Surname max 50 chars'),
});

export type UserCreateFormData = zod.infer<typeof userCreateSchema>;
