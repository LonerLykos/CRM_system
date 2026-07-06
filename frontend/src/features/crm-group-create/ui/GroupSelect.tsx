'use client'

import {useEffect, useMemo, useRef, useState, useTransition} from "react";
import {IGroupResponse} from "@/entities/crm";
import {groupCreateAction} from "../model/groupCreateAction";
import s from "./GroupSelect.module.sass";

interface GroupSelectProps {
    groups: IGroupResponse[];
    defaultGroupId?: number | '';
    defaultGroupName?: string;
    /** Form field name of the hidden input that carries the selected group id. */
    name?: string;
}

const normalize = (value: string) => value.trim().toLowerCase();

/**
 * Find-or-create group picker. Type to search existing groups; when the typed
 * name doesn't exist yet the "Add group" action becomes enabled and calls the
 * backend `get_or_create` — so two managers creating the same group race-safely
 * end up selecting the very same row (one creates it, the other receives it).
 */
export const GroupSelect = ({
    groups: initialGroups,
    defaultGroupId = '',
    defaultGroupName = '',
    name = 'group',
}: GroupSelectProps) => {
    const [groups, setGroups] = useState<IGroupResponse[]>(initialGroups);
    const [selectedId, setSelectedId] = useState<number | ''>(defaultGroupId);
    const [query, setQuery] = useState(defaultGroupName);
    const [open, setOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();
    const wrapRef = useRef<HTMLDivElement>(null);

    const q = normalize(query);

    const filtered = useMemo(
        () => (q ? groups.filter((g) => normalize(g.name).includes(q)) : groups),
        [groups, q],
    );

    const exactMatch = useMemo(
        () => groups.find((g) => normalize(g.name) === q),
        [groups, q],
    );

    // "Add group" is offered only for a non-empty name that doesn't exist yet.
    const canCreate = q.length > 0 && !exactMatch;

    // Close the dropdown when clicking outside the widget.
    useEffect(() => {
        const onDocMouseDown = (e: MouseEvent) => {
            if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', onDocMouseDown);
        return () => document.removeEventListener('mousedown', onDocMouseDown);
    }, []);

    const pick = (group: IGroupResponse) => {
        setSelectedId(group.id);
        setQuery(group.name);
        setOpen(false);
        setError(null);
    };

    const pickNone = () => {
        setSelectedId('');
        setQuery('');
        setOpen(false);
        setError(null);
    };

    const onType = (value: string) => {
        setQuery(value);
        setOpen(true);
        setError(null);
        // The hidden id stays valid only while the text exactly matches an
        // existing group; anything else means "nothing selected yet".
        const match = groups.find((g) => normalize(g.name) === normalize(value));
        setSelectedId(match ? match.id : '');
    };

    const create = () => {
        const raw = query.trim();
        if (!raw || isPending) return;
        setError(null);
        startTransition(async () => {
            const res = await groupCreateAction(raw);
            if (res.error || !res.group) {
                setError(res.error ?? 'Failed to create group');
                return;
            }
            const group = res.group;
            // Idempotent create: if it already existed (another manager won the
            // race) the backend returns that row — merge it in and select it.
            setGroups((prev) =>
                prev.some((g) => g.id === group.id) ? prev : [...prev, group],
            );
            setSelectedId(group.id);
            setQuery(group.name);
            setOpen(false);
        });
    };

    return (
        <div className={s.wrap} ref={wrapRef}>
            <input
                type="hidden"
                name={name}
                value={selectedId === '' ? '' : String(selectedId)}
            />

            <div className={s.row}>
                <input
                    type="text"
                    className={s.input}
                    placeholder="Search or create a group…"
                    value={query}
                    autoComplete="off"
                    maxLength={100}
                    onChange={(e) => onType(e.target.value)}
                    onFocus={() => setOpen(true)}
                />
                <button
                    type="button"
                    className={s.addBtn}
                    onClick={create}
                    disabled={!canCreate || isPending}
                    title={canCreate ? `Create “${query.trim()}”` : 'Type a new group name to enable'}
                >
                    {isPending ? '…' : '+ Add group'}
                </button>
            </div>

            {open && (
                <ul className={s.dropdown}>
                    <li className={s.option} onMouseDown={(e) => { e.preventDefault(); pickNone(); }}>
                        — none —
                    </li>
                    {filtered.map((g) => (
                        <li
                            key={g.id}
                            className={`${s.option} ${g.id === selectedId ? s.active : ''}`}
                            onMouseDown={(e) => { e.preventDefault(); pick(g); }}
                        >
                            {g.name}
                        </li>
                    ))}
                    {filtered.length === 0 && !canCreate && (
                        <li className={s.empty}>No groups found</li>
                    )}
                    {canCreate && (
                        <li className={s.create} onMouseDown={(e) => { e.preventDefault(); create(); }}>
                            + Create “{query.trim()}”
                        </li>
                    )}
                </ul>
            )}

            {error && <span className={s.error}>{error}</span>}
        </div>
    );
};
