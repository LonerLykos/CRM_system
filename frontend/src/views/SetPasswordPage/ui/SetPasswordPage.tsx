import {SetPasswordForm} from '@/features/user-set-password';


interface SetPasswordPageProps {
    token: string;
    error?: string;
}

export const SetPasswordPage = ({token, error}: SetPasswordPageProps) => {
    return (
        <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh'}}>
            <section style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                <h1 style={{display: 'inline-block'}}>Activate Account</h1>
                <SetPasswordForm token={token} error={error}/>
            </section>
        </div>
    );
}
