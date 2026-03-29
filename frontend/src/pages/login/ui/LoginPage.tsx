import { LoginForm } from '@/features/auth-login/ui/LoginForm';

interface LoginPageProps {
    error?: string;
}

export const LoginPage = ({ error }: LoginPageProps) => {

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <section style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                <h1 style={{display: 'inline-block'}}>Вхід в CRM</h1>
                <LoginForm error={error}/>
            </section>
        </div>
    );
}