import Link from 'next/link';
import styles from './Pagination.module.sass';
import {IPaginatedResponse} from "@/shared/api";

interface PaginationProps {
    currentPage: number;
    baseUrl: string;
    paginationInfo: Omit<IPaginatedResponse<unknown>, 'data'>
}

export const Pagination = ({ currentPage, baseUrl, paginationInfo }: PaginationProps) => {
    const {next, prev, total_pages} = paginationInfo
    const prevPage = prev ? currentPage - 1 : null;
    const nextPage = next ? currentPage + 1 : null;

    return (
        <nav className={styles.pagination}>
            {prevPage ? (
                <Link href={`${baseUrl}?page=${prevPage}`} className={styles.btn}>
                    &larr; Назад
                </Link>
            ) : (
                <span className={`${styles.btn} ${styles.disabled}`}>&larr; Назад</span>
            )}

            <div className={styles.info}>
                Сторінка <strong>{currentPage}</strong> з {total_pages}
            </div>

            {nextPage ? (
                <Link href={`${baseUrl}?page=${nextPage}`} className={styles.btn}>
                    Вперед &rarr;
                </Link>
            ) : (
                <span className={`${styles.btn} ${styles.disabled}`}>Вперед &rarr;</span>
            )}
        </nav>
    );
};