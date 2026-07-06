'use client'

import {ISearchParams} from "@/shared/model";
import Image from "next/image";
import {usePathname, useRouter} from "next/navigation";
import {useEffect, useState} from "react";
import {useDebouncedCallback} from "use-debounce";
import {filterSet} from "@/features/order-filter";
import {IChoicesResponse, IGroupResponse} from "@/entities/crm";
import {ExportButton} from "@/features/order-export";
import styles from "./OrderFilter.module.sass";

interface FilterProp {
    params: ISearchParams;
    choices: IChoicesResponse;
    groups: IGroupResponse[];
}

const NAV_KEYS: ReadonlySet<keyof ISearchParams> = new Set(['order', 'orderId']);

// Filter keys whose live value is mirrored in local state so the inputs stay
// controlled. Everything except `my` (tracked as a boolean via the checkbox).
const VALUE_KEYS: ReadonlyArray<string> = filterSet
    .map(({key}) => key)
    .filter((key) => key !== 'my');

type ValueMap = Record<string, string>;

const paramsToValues = (params: ISearchParams): ValueMap => {
    const record = params as Record<string, string | undefined>;
    const out: ValueMap = {};
    VALUE_KEYS.forEach((key) => {
        out[key] = record[key] ?? '';
    });
    return out;
};

export const OrderFilter = ({params, choices, groups}: FilterProp) => {
    const pathname = usePathname();
    const {replace} = useRouter();

    // Controlled state mirrors the URL params. With uncontrolled `defaultValue`
    // the inputs only read the params once (on mount), so Reset cleared the
    // query string but left stale text/selections in the fields. Driving
    // `value` from state — re-synced whenever the URL changes — fixes that.
    const [values, setValues] = useState<ValueMap>(() => paramsToValues(params));
    const myChecked = params.my === 'true';

    // Re-sync from the URL whenever it changes externally (reset, back/forward,
    // pagination that keeps filters). Keyed on the serialized params.
    const paramsKey = JSON.stringify(params);
    useEffect(() => {
        setValues(paramsToValues(params));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [paramsKey]);

    const handleSearch = useDebouncedCallback((key: string, filter: string) => {
        const newParams = new URLSearchParams();

        Object.entries(params).forEach(([k, value]) => {
            if (value !== undefined) {
                newParams.set(k, String(value));
            }
        });

        if (filter) {
            newParams.set(key, filter);
            newParams.set('page', '1');
        } else {
            const isValid = filterSet.some(item => item.key === key)
            if (!isValid || !filter) {
                newParams.delete(key);
            }
        }

        replace(`${pathname}?${newParams.toString()}`, {scroll: false});
    }, 300);

    // Update the visible value immediately (snappy typing), debounce the URL.
    const handleChange = (key: string, value: string) => {
        setValues((prev) => ({...prev, [key]: value}));
        handleSearch(key, value);
    };

    const handleMyToggle = (checked: boolean) => {
        const newParams = new URLSearchParams();

        Object.entries(params).forEach(([k, v]) => {
            if (v !== undefined) {
                newParams.set(k, String(v));
            }
        });

        if (checked) {
            newParams.set('my', 'true');
            newParams.set('page', '1');
        } else {
            newParams.delete('my');
            newParams.set('page', '1');
        }

        replace(`${pathname}?${newParams.toString()}`, {scroll: false});
    };

    /** M-2: reset all filter params, keep navigation keys, reset page to 1 */
    const handleResetFilters = () => {
        const newParams = new URLSearchParams();

        (Object.keys(params) as Array<keyof ISearchParams>).forEach((k) => {
            if (NAV_KEYS.has(k) && params[k] !== undefined) {
                newParams.set(k, String(params[k]));
            }
        });

        newParams.set('page', '1');

        setValues(paramsToValues({}));   // clear the fields immediately
        replace(`${pathname}?${newParams.toString()}`, {scroll: false});
    };

    const paramValue = (key: string): string => values[key] ?? '';

    return (
        <div className={styles.filterBar}>
            <div className={styles.fields}>
                {filterSet.map(({key, value}) => {
                    if (key === 'group') {
                        return (
                            <select
                                key={`group-${key}`}
                                className={styles.control}
                                value={paramValue(key)}
                                onChange={(e) => handleChange(key, e.target.value)}
                            >
                                <option value="">All groups</option>
                                {groups.map(({ id, name }) => (
                                    <option key={`group${id}`} value={String(id)}>
                                        {name}
                                    </option>
                                ))}
                            </select>
                        );
                    }

                    const choiceKey = key as keyof IChoicesResponse;
                    if (choices && choiceKey in choices) {
                        const currentOptions = choices[choiceKey];
                        return (
                            <select
                                key={`choice-${key}`}
                                className={styles.control}
                                value={paramValue(key)}
                                onChange={(e) => handleChange(key, e.target.value)}
                            >
                                <option value="">{value}...</option>
                                {Object.entries(currentOptions).map(([dbValue, readableName]) => (
                                    <option key={dbValue} value={dbValue}>
                                        {readableName}
                                    </option>
                                ))}
                            </select>
                        );
                    }

                    if (key === 'my') {
                        // Rendered in the actions bar next to the icons, not in the grid.
                        return null;
                    }

                    // Render both bounds together as a single "between" range so
                    // it's clear you can pick an interval. created_at_gte = From
                    // (>=), created_at_lte = To (<=). The gte slot is skipped
                    // because both inputs live in the lte block below.
                    if (key === 'created_at_gte') {
                        return null;
                    }
                    if (key === 'created_at_lte') {
                        return (
                            <div key="created-range" className={styles.dateRange}>
                                <div className={styles.dateRangeRow}>
                                    <input
                                        className={styles.control}
                                        type="date"
                                        title="Created after"
                                        value={paramValue('created_at_gte')}
                                        onChange={(e) => handleChange('created_at_gte', e.target.value)}
                                    />
                                    <span className={styles.dateSep}>–</span>
                                    <input
                                        className={styles.control}
                                        type="date"
                                        title="Created before"
                                        value={paramValue('created_at_lte')}
                                        onChange={(e) => handleChange('created_at_lte', e.target.value)}
                                    />
                                </div>
                            </div>
                        );
                    }

                    return (
                        <input
                            key={value}
                            className={styles.control}
                            placeholder={`${value}...`}
                            value={paramValue(key)}
                            onChange={(e) => handleChange(key, e.target.value)}
                        />
                    );
                })}
            </div>

            <div className={styles.actions}>
                <label className={styles.checkbox}>
                    <input
                        type="checkbox"
                        checked={myChecked}
                        onChange={(e) => handleMyToggle(e.target.checked)}
                    />
                    My orders
                </label>
                <div className={styles.iconRow}>
                    <button
                        type="button"
                        onClick={handleResetFilters}
                        title="Reset filters"
                        className={styles.iconBtn}
                    >
                        <Image src="/icons/restore.png" alt="Reset filters" width={22} height={22}/>
                    </button>
                    <ExportButton params={params} className={styles.iconBtn}/>
                </div>
            </div>
        </div>
    );
}
