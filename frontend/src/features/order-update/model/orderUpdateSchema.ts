import {zod} from "@/shared/libs";
import {isValidPhoneNumber} from "libphonenumber-js";

const emptyToNull = (val: unknown) => (
    typeof val === "string" && val.trim() === "" ? null : val
);


export const orderUpdateSchema = zod.object({
    name: zod.preprocess(
        emptyToNull,
        zod.string()
            .max(25, {
                error: (iss) => {
                    return `The name must be at most ${iss.maximum} characters`
                }
            })
            .nullish()
    ),
    surname: zod.preprocess(
        emptyToNull,
        zod.string()
            .max(50, {
                error: (iss) => {
                    return `The surname must be at most ${iss.maximum} characters`
                }
            })
            .nullish()
    ),
    email: zod.preprocess(
        emptyToNull,
        zod.email()
            .nullish()
    ),
    phone: zod.preprocess(
        emptyToNull,
        zod.string()
            .refine((val) => !val || isValidPhoneNumber(val), {
                error: 'Invalid phone format'
            })
            .nullish()
    ),
    age: zod.preprocess(
        emptyToNull,
        zod.coerce.number()
            .int()
            .positive()
            .max(100, 'Age must be at most 100')
            .nullish(),
    ),
    course: zod.preprocess(
        emptyToNull,
        zod.string().nullish(),
    ),
    course_format: zod.preprocess(
        emptyToNull,
        zod.string().nullish(),
    ),
    course_type: zod.preprocess(
        emptyToNull,
        zod.string().nullish(),
    ),
    sum: zod.preprocess(
        emptyToNull,
        zod.coerce.number()
            .nonnegative()
            .nullish(),
    ),
    already_paid: zod.preprocess(
        emptyToNull,
        zod.coerce.number()
            .nonnegative()
            .nullish(),
    ),
    status: zod.preprocess(
        emptyToNull,
        zod.string().nullish(),
    ),
    group: zod.preprocess(
        emptyToNull,
        zod.string().nullish(),
    ),
})
    .refine((data) => {
        if (data.already_paid != null && data.sum != null) {
            return data.already_paid <= data.sum
        }
        return true
    }, {
        error: 'Already paid cannot be greater than sum',
        path: ['already_paid'],
    })

export type orderUpdateFormData = zod.infer<typeof orderUpdateSchema>
