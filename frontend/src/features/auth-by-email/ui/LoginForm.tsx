'use client';

import { useState } from 'react';
import { authService, ILoginRequest } from '@/entities/auth'; // Імпорт через Public API

export const LoginForm = () => {
    const [formData, setFormData] = useState<ILoginRequest>({
        email: '',
        password: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        console.log('🚀 Відправка даних:', formData);

        const result = await authService.login(formData);

        if ('status' in result) {
            alert(`Помилка: ${result.statusText}`);
        } else {
            alert('Успішний вхід!');
            console.log('Дані відповіді:', result);
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '300px' }}>
            <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <input
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
            <button type="submit">Увійти</button>
        </form>
    );
};