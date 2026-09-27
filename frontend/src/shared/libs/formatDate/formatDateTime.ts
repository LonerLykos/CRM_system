export const formatDateTime = (isoString: string, timeZone = 'UTC') => {
    if (!isoString) return '—';

    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '—';

    return new Intl.DateTimeFormat('en-US', {
        timeZone,
        month: 'long',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    }).format(date);
};
