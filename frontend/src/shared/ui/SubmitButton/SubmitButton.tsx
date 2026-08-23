'use client'

import {ReactNode} from "react";
import {useFormStatus} from "react-dom";

interface SubmitButtonProps {
    children: ReactNode;
    pendingLabel?: ReactNode;
    className?: string;
    disabled?: boolean;
    title?: string;
}

export const SubmitButton = ({
    children,
    pendingLabel,
    className,
    disabled,
    title,
}: SubmitButtonProps) => {
    const {pending} = useFormStatus();

    return (
        <button
            type="submit"
            className={className}
            disabled={disabled || pending}
            aria-busy={pending}
            title={title}
        >
            {pending ? (pendingLabel ?? children) : children}
        </button>
    );
};
