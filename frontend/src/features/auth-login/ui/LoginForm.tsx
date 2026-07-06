import Form from "next/form";
import {loginAction} from "@/features/auth-login";
import s from "./LoginForm.module.sass";


export const LoginForm = async ({error}: { error?: string }) => {
    return (
        <div className={s.card}>
            <div className={s.mark}>BB</div>
            <h1 className={s.title}>Вхід в CRM</h1>
            <p className={s.sub}>Система обробки заявок на курси</p>

            <Form action={loginAction} className={s.form}>
                <div className={s.field}>
                    <label className={s.label} htmlFor="email">Email</label>
                    <div className={s.control}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="5" width="18" height="14" rx="2"/>
                            <path d="m3 7 9 6 9-6"/>
                        </svg>
                        <input id="email" name="email" type="email" placeholder="you@company.com"
                               autoComplete="username" required className={s.input}/>
                    </div>
                </div>

                <div className={s.field}>
                    <label className={s.label} htmlFor="password">Пароль</label>
                    <div className={s.control}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="4" y="11" width="16" height="10" rx="2"/>
                            <path d="M8 11V7a4 4 0 0 1 8 0v4"/>
                        </svg>
                        <input id="password" name="password" type="password" placeholder="••••••••"
                               autoComplete="current-password" required className={s.input}/>
                    </div>
                </div>

                {error && (
                    <p className={s.error}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="9"/>
                            <path d="M12 8v5M12 16h.01"/>
                        </svg>
                        {error}
                    </p>
                )}

                <button type="submit" className={s.button}>Увійти</button>
            </Form>
        </div>
    )
}
