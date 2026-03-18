type PaginationSlot = number | '...'

export const getDynamicSlots = (
    total_pages: number,
    currentPage: number,
    max_slots: number = 9): PaginationSlot[] => {
        if (total_pages <= max_slots) {
            return Array.from({ length: total_pages }, (_, i) => i + 1);
        }

        const pages: PaginationSlot[] = [];

        if (currentPage <= 5) {
            for (let i = 1; i <= 7; i++) pages.push(i);
            pages.push('...');
            pages.push(total_pages);
        }
        else if (currentPage > total_pages - 5) {
            pages.push(1);
            pages.push('...');
            for (let i = total_pages - 6; i <= total_pages; i++) pages.push(i);
        }
        else {
            pages.push(1);
            pages.push('...');
            pages.push(currentPage - 2);
            pages.push(currentPage - 1);
            pages.push(currentPage);
            pages.push(currentPage + 1);
            pages.push(currentPage + 2);
            pages.push('...');
            pages.push(total_pages);
        }

        return pages;
    };