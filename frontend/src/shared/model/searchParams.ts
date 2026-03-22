export interface ISearchParams {
    page?: string;
    order?: string;
    orderId?: string;
    name_contains?: string;
    surname_contains?: string;
    email_contains?: string;
    phone_contains?: string;
    age_eq?: string;
    course?: string;
    course_type?: string;
    course_format?: string;
    sum_eq?: string;
    already_paid_eq?: string;
    status?: string;
    group_name_contains?: string;
    created_at_lte?: string;
    created_at_gte?: string;
    my?: string;
}
