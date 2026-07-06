import {zod} from "@/shared/libs";
import {parsePhoneNumberFromString} from "libphonenumber-js";

const emptyToNull = (val: unknown) => (
    typeof val === "string" && val.trim() === "" ? null : val
);

// Parse a phone that may be UA-national (leading 0), international with a "+",
// or international with the "+" omitted (bare country code). The "+" is optional
// on input ("+380…" and "380…" are both accepted); expects an already-cleaned
// (no spaces/separators) string.
const parsePhone = (val: string) => {
    if (!val) return undefined;
    if (val.startsWith('0')) return parsePhoneNumberFromString(val, 'UA');
    return parsePhoneNumberFromString(val.startsWith('+') ? val : `+${val}`);
};


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
            // Accept UA national (0991122345) or international, with or without a
            // leading "+" ("+380…" and "380…"); strip spaces & separators and
            // store one canonical E.164 form.
            .transform((val) => val.replace(/[\s()\-]/g, ''))
            .refine((val) => parsePhone(val)?.isValid() ?? false, {
                error: 'Invalid phone format'
            })
            .transform((val) => parsePhone(val)!.number)
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
        zod.string().transform((v) => v.toUpperCase()).nullish(),
    ),
    course_format: zod.preprocess(
        emptyToNull,
        zod.string().transform((v) => v.toLowerCase()).nullish(),
    ),
    course_type: zod.preprocess(
        emptyToNull,
        zod.string().transform((v) => v.toLowerCase()).nullish(),
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
        zod.string().transform((v) => v.toLowerCase()).nullish(),
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
