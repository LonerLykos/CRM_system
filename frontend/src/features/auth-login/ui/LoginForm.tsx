'use server'

import Form from "next/form";
import {loginAction} from "@/features/auth-login";


export const LoginForm = async ({error}: { error?: string }) => {
    return (
        <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
            <Form action={loginAction} style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                <div>
                    <input name="email" type="email" placeholder="Email" required/>
                </div>

                <div>
                    <input name="password" type="password" placeholder="Пароль" required/>
                </div>

                <button type="submit">Увійти</button>
            </Form>
            {error && (
                <p style={{color: 'red', fontWeight: 'bold'}}>{error}</p>
            )}
        </div>
    )
}