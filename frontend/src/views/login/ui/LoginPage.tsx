import { LoginForm } from '@/features/auth-login/ui/LoginForm';
import s from './LoginPage.module.sass';

interface LoginPageProps {
    error?: string;
}

export const LoginPage = ({ error }: LoginPageProps) => {

    return (
        <div className={s.screen}>
            <LoginForm error={error}/>
        </div>
    );
}
