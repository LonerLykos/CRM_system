'use client'

import {useActionState, useState} from "react";
import {userCreateAction} from "@/features/user-create";
import s from "./UserCreateModal.module.sass";

export const UserCreateModal = () => {
    const [open, setOpen] = useState(false);
    const [state, dispatch, isPending] = useActionState(userCreateAction, null);
    const [copied, setCopied] = useState(false);

    const handleCopy = async (link: string) => {
        try {
            await navigator.clipboard.writeText(link);
            setCopied(true);
            setTimeout(() => setCopied(false), 3000);
        } catch {
            // clipboard unavailable — show link as text fallback
        }
    };

    const handleClose = () => {
        setOpen(false);
        setCopied(false);
    };

    return (
        <>
            <button className={s.openBtn} onClick={() => setOpen(true)}>
                CREATE
            </button>

            {open && (
                <div className={s.overlay} onClick={handleClose}>
                    <div className={s.modal} onClick={e => e.stopPropagation()}>
                        <button className={s.closeBtn} onClick={handleClose}>✕</button>
                        <h2 className={s.title}>Create Manager</h2>

                        {state?.ok ? (
                            <div className={s.success}>
                                <p className={s.details}>{state.details}</p>
                                <p className={s.linkLabel}>Activation link (valid 30 min):</p>
                                <p className={s.linkText}>{state.link}</p>
                                <button
                                    className={s.copyBtn}
                                    onClick={() => handleCopy(state.link)}
                                >
                                    {copied ? 'Copied!' : 'Copy link'}
                                </button>
                                <button className={s.doneBtn} onClick={handleClose}>
                                    Done
                                </button>
                            </div>
                        ) : (
                            <form action={dispatch} className={s.form}>
                                <label className={s.label}>
                                    Email
                                    <input
                                        name="email"
                                        type="email"
                                        required
                                        className={s.input}
                                        placeholder="manager@example.com"
                                    />
                                </label>
                                <label className={s.label}>
                                    Name
                                    <input
                                        name="name"
                                        type="text"
                                        required
                                        maxLength={20}
                                        className={s.input}
                                        placeholder="First name"
                                    />
                                </label>
                                <label className={s.label}>
                                    Surname
                                    <input
                                        name="surname"
                                        type="text"
                                        required
                                        maxLength={50}
                                        className={s.input}
                                        placeholder="Last name"
                                    />
                                </label>

                                {state?.ok === false && (
                                    <p className={s.error}>{state.error}</p>
                                )}

                                <button
                                    type="submit"
                                    className={s.submitBtn}
                                    disabled={isPending}
                                >
                                    {isPending ? 'Creating…' : 'Create'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};
