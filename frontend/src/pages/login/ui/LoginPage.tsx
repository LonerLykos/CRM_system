import { LoginForm } from '@/features/auth-by-email/ui/LoginForm';

export function LoginPage() {
    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <section>
                <h1>Вхід в CRM</h1>
                <LoginForm />
            </section>
        </div>
    );
}