'use server'

import Link from 'next/link';
import styles from './Pagination.module.sass';
import {IPaginatedResponse} from "@/shared/api";
import {getDynamicSlots} from "@/shared/libs";

interface PaginationProps {
    currentPage: number;
    baseUrl: string;
    paginationInfo: Omit<IPaginatedResponse<unknown>, 'data'>
}

export const Pagination = async ({ currentPage, baseUrl, paginationInfo }: PaginationProps) => {
    const { total_pages, next, prev } = paginationInfo;
    const max_slots = 9;

    const slots = getDynamicSlots(total_pages, currentPage, max_slots);

    return (
        <nav className={styles.pagination}>
            <div className={`${styles.navSlot} ${!prev ? styles.invisible : ''}`}>
                <Link href={`${baseUrl}?page=${currentPage - 1}`} className={styles.navBtn}>&lt;</Link>
            </div>

            <div className={styles.pagesGrid}>
                {slots.map((page, index) => (
                    <div key={index} className={styles.slot}>
                        {page === '...' ? (
                            <span className={styles.dots}>...</span>
                        ) : (
                            <Link
                                href={`${baseUrl}?page=${page}`}
                                className={`${styles.btn} ${page === currentPage ? styles.active : ''}`}
                            >
                                {page}
                            </Link>
                        )}
                    </div>
                ))}
            </div>

            <div className={`${styles.navSlot} ${!next ? styles.invisible : ''}`}>
                <Link href={`${baseUrl}?page=${currentPage + 1}`} className={styles.navBtn}>&gt;</Link>
            </div>
        </nav>
    );
};