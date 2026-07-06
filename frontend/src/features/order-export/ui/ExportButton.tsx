'use client'

import Image from 'next/image';
import { ISearchParams } from '@/shared/model';

interface ExportButtonProps {
    params: ISearchParams;
    className?: string;
}

const EXPORT_FILTER_KEYS: ReadonlyArray<keyof ISearchParams> = [
    'name_contains',
    'surname_contains',
    'email_contains',
    'phone_contains',
    'age_eq',
    'course',
    'course_type',
    'course_format',
    'sum_eq',
    'already_paid_eq',
    'status',
    'group_name_contains',
    'created_at_lte',
    'created_at_gte',
    'my',
    'order',
];

export const ExportButton = ({ params, className }: ExportButtonProps) => {
    const qs = new URLSearchParams();

    EXPORT_FILTER_KEYS.forEach((key) => {
        const value = params[key];
        if (value !== undefined && value !== '') {
            qs.set(key, String(value));
        }
    });

    const href = `/api/orders/export${qs.size > 0 ? `?${qs.toString()}` : ''}`;

    return (
        <a href={href} download title="Export Excel" className={className}>
            <Image src="/icons/xlsx.png" alt="Export Excel" width={22} height={22} />
        </a>
    );
};
