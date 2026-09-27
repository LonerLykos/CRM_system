'use client'

import {useEffect, useState} from "react";
import {formatDateTime} from "@/shared/libs";

interface CommentTimeProps {
    iso: string
}

export const CommentTime = ({iso}: CommentTimeProps) => {
    const [text, setText] = useState(() => formatDateTime(iso))

    useEffect(() => {
        setText(formatDateTime(iso, Intl.DateTimeFormat().resolvedOptions().timeZone))
    }, [iso])

    return <time dateTime={iso}>{text}</time>
}
