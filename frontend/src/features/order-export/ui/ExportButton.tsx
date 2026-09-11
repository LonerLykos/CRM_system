'use client'

import Image from 'next/image';
import { ISearchParams } from '@/shared/model';
import { filterSet } from '@/features/order-filter/config/filterSet';

interface ExportButtonProps {
    params: ISearchParams;
    className?: string;
}

const EXPORT_FILTER_KEYS: ReadonlyArray<keyof ISearchParams> = [
    ...filterSet.map(({ key }) => key),
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
