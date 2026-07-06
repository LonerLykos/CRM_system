'use client'

import {useTransition, useRef, useState} from "react";
import {groupCreateAction} from "../model/groupCreateAction";
import s from './AddGroupForm.module.sass';


export const AddGroupForm = () => {
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = () => {
        const name = inputRef.current?.value?.trim() ?? '';

        if (!name) {
            setError('Group name cannot be empty');
            return;
        }

        setError(null);

        startTransition(async () => {
            const result = await groupCreateAction(name);
            if (result.error) {
                setError(result.error);
            } else {
                if (inputRef.current) {
                    inputRef.current.value = '';
                }
            }
        });
    };

    return (
        <div className={s.add_group}>
            <input
                ref={inputRef}
                type='text'
                placeholder='New group name'
                maxLength={100}
                disabled={isPending}
                className={s.add_group__input}
            />
            <button
                type='button'
                onClick={handleSubmit}
                disabled={isPending}
                className={s.add_group__btn}
            >
                {isPending ? '...' : '+ ADD GROUP'}
            </button>
            {error && <span className={s.add_group__error}>{error}</span>}
        </div>
    );
};
