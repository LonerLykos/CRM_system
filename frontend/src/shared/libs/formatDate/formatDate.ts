export const formatDate = (isoString: string) => {
    if (!isoString) return '—';

    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '—';

    return new Intl.DateTimeFormat('en-US', {
        timeZone: 'UTC',
        month: 'long',
        day: '2-digit',
        year: 'numeric',
    }).format(date);
};