import {zod} from "@/shared/libs";


export const commentSchema = zod.object({
    comment: zod.string()
        .min(1, 'The comment must have at least 1 characters')
});

export type CommentFormData = zod.infer<typeof commentSchema>;
