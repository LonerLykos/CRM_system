import {loginAction} from '../model/loginAction'

export const LoginForm = ({error}: { error?: string }) => {
    return (
        <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
            <form action={loginAction} style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                <div>
                    <input name="email" type="email" placeholder="Email" required/>
                </div>

                <div>
                    <input name="password" type="password" placeholder="Пароль" required/>
                </div>

                <button type="submit">Увійти</button>
            </form>
            {error && (
                <p style={{color: 'red', fontWeight: 'bold'}}>{error}</p>
            )}
        </div>
    )
}