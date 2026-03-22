'use server'

import Link from 'next/link';
import s from './Pagination.module.sass';
import {IPaginatedResponse} from "@/shared/api";
import {getDynamicSlots} from "@/shared/libs";
import {ISearchParams} from "@/shared/model";


interface PaginationProps {
    currentPage: number;
    baseUrl: string;
    paginationInfo: Omit<IPaginatedResponse<unknown>, 'data'>;
    currentParams?: ISearchParams
}

export const Pagination = async ({ currentPage, baseUrl, paginationInfo, currentParams}: PaginationProps) => {
    const { total_pages, next, prev } = paginationInfo;
    const max_slots = 9;

    const slots = getDynamicSlots(total_pages, currentPage, max_slots);

    return (
        <nav className={s.pagination}>
            <div className={`${s.navSlot} ${!prev ? s.invisible : ''}`}>
                <Link href={`${baseUrl}?page=${currentPage - 1}`} className={s.navBtn}>&lt;</Link>
            </div>

            <div className={s.pagesGrid}>
                {slots.map((page, index) => (
                    <div key={index} className={s.slot}>
                        {page === '...' ? (
                            <span className={s.dots}>...</span>
                        ) : (
                            <Link
                                href={`${baseUrl}?page=${page}`}
                                className={`${s.btn} ${page === currentPage ? s.active : ''}`}
                            >
                                {page}
                            </Link>
                        )}
                    </div>
                ))}
            </div>

            <div className={`${s.navSlot} ${!next ? s.invisible : ''}`}>
                <Link href={`${baseUrl}?page=${currentPage + 1}`} className={s.navBtn}>&gt;</Link>
            </div>
        </nav>
    );
};