'use client'

import {useState, useTransition} from "react";
import {banToggleAction, restorePasswordAction} from "@/features/user-manage";
import s from "./UserManageButtons.module.sass";

interface UserManageButtonsProps {
    pk: number;
    isActive: boolean;
    isBanned: boolean;
    /** True when this row is the logged-in user — the Ban button is then locked. */
    isSelf?: boolean;
}

export const UserManageButtons = ({pk, isActive, isBanned, isSelf}: UserManageButtonsProps) => {
    const [isPending, startTransition] = useTransition();
    const [linkInfo, setLinkInfo] = useState<{ link: string; copied: boolean } | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const copyToClipboard = async (link: string) => {
        try {
            await navigator.clipboard.writeText(link);
            setLinkInfo({link, copied: true});
            setTimeout(() => setLinkInfo(prev => prev ? {...prev, copied: false} : null), 3000);
        } catch {
            setLinkInfo({link, copied: false});
        }
    };

    const handlePasswordAction = () => {
        setErrorMsg(null);
        setLinkInfo(null);
        startTransition(async () => {
            const result = await restorePasswordAction(pk);
            if (result.ok && result.link) {
                await copyToClipboard(result.link);
            } else if (!result.ok) {
                setErrorMsg(result.error);
            }
        });
    };

    const handleBanToggle = () => {
        setErrorMsg(null);
        startTransition(async () => {
            const result = await banToggleAction(pk);
            if (!result.ok) {
                setErrorMsg(result.error);
            }
        });
    };

    return (
        <div className={s.actions}>
            {/* Activate / Recovery password — both call restorePassword */}
            {!isActive ? (
                <button
                    className={`${s.btn} ${s.activate}`}
                    disabled={isPending}
                    onClick={handlePasswordAction}
                >
                    {isPending ? '…' : 'Activate'}
                </button>
            ) : (
                <button
                    className={`${s.btn} ${s.recovery}`}
                    disabled={isPending}
                    onClick={handlePasswordAction}
                >
                    {isPending ? '…' : 'Recovery password'}
                </button>
            )}

            {/* Ban / Unban — you can never ban your own account */}
            <button
                className={`${s.btn} ${isBanned ? s.unban : s.ban}`}
                disabled={isPending || isSelf}
                onClick={handleBanToggle}
                title={isSelf ? 'You cannot ban your own account' : undefined}
            >
                {isPending ? '…' : isBanned ? 'Unban' : 'Ban'}
            </button>

            {/* Link feedback */}
            {linkInfo && (
                <div className={s.linkFeedback}>
                    {linkInfo.copied ? (
                        <span className={s.copied}>Link copied!</span>
                    ) : (
                        <>
                            <span className={s.linkText}>{linkInfo.link}</span>
                            <button
                                className={s.copyBtn}
                                onClick={() => copyToClipboard(linkInfo.link)}
                            >
                                Copy
                            </button>
                        </>
                    )}
                </div>
            )}

            {errorMsg && <p className={s.error}>{errorMsg}</p>}
        </div>
    );
};
