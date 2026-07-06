'use client'

import {useEffect, useState} from 'react';
import s from './ThemeToggle.module.sass';

type Theme = 'light' | 'dark';

export const ThemeToggle = () => {
    // Rendered identically on the server and first client paint (Moon) to avoid
    // a hydration mismatch; the effect then reflects the real active theme.
    const [mounted, setMounted] = useState(false);
    const [theme, setTheme] = useState<Theme>('light');

    useEffect(() => {
        const attr = document.documentElement.dataset.theme as Theme | undefined;
        const initial: Theme =
            attr ?? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        setTheme(initial);
        setMounted(true);
    }, []);

    const toggle = () => {
        const next: Theme = theme === 'dark' ? 'light' : 'dark';
        document.documentElement.dataset.theme = next;
        try {
            localStorage.setItem('theme', next);
        } catch {
            /* storage unavailable — ignore, choice just won't persist */
        }
        setTheme(next);
    };

    const isDark = mounted && theme === 'dark';

    return (
        <button
            type="button"
            onClick={toggle}
            className={s.toggle}
            aria-label={isDark ? 'Увімкнути світлу тему' : 'Увімкнути темну тему'}
            title="Тема"
        >
            {isDark ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="12" cy="12" r="4"/>
                    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>
                </svg>
            ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"/>
                </svg>
            )}
        </button>
    );
};
