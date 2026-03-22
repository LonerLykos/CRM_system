export const formatDate = (isoString: string) => {
    if (!isoString) return '—';

    return new Intl.DateTimeFormat('en-US', {
        month: 'long',
        day: '2-digit',
        year: 'numeric',
    }).format(new Date(isoString));
};