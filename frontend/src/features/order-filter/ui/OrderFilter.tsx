'use client'

import {ISearchParams} from "@/shared/model";
import {usePathname, useRouter} from "next/navigation";
import {useDebouncedCallback} from "use-debounce";
import {filterSet} from "@/features/order-filter";
import {IChoicesResponse, IGroupResponse} from "@/entities/crm";

interface FilterProp {
    params: ISearchParams;
    choices: IChoicesResponse;
    groups: IGroupResponse[];
}

export const OrderFilter = ({params, choices, groups}: FilterProp) => {
    const pathname = usePathname();
    const {replace} = useRouter();

    const handleSearch = useDebouncedCallback(( key: string, filter: string) => {
        const newParams = new URLSearchParams();

        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined) {
                newParams.set(key, String(value));
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

    return (
        <div>
            {filterSet.map(({key, value}) => {
                if (key === 'group_name_contains') {
                    return (
                        <div key={`group-${key}`}>
                            <select
                                defaultValue={params[key] || ''}
                                onChange={(e) => handleSearch(key, e.target.value)}
                            >
                                <option value="">Groups</option>
                                {groups.map(({ id, name }) => (
                                    <option key={`group${id}`} value={name}>
                                        {name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    );
                }

                const choiceKey = key as keyof IChoicesResponse;
                if (choices && choiceKey in choices) {
                    const currentOptions = choices[choiceKey];
                    return (
                        <div key={`choice-${key}`}>
                            <select
                                defaultValue={params[key] || ''}
                                onChange={(e) => handleSearch(key, e.target.value)}
                            >
                                <option value="">{value}...</option>
                                {Object.entries(currentOptions).map(([dbValue, readableName]) => (
                                    <option key={dbValue} value={dbValue}>
                                        {readableName}
                                    </option>
                                ))}
                            </select>
                        </div>
                    );
                }

                if (key === 'my') {
                    return
                }
                if (key === 'created_at_lte') {
                    return
                }
                if (key === 'created_at_gte') {
                    return
                }
                return (
                    <input key={value}
                           placeholder={`${value}...`}
                           defaultValue={params[key] || ''}
                           onChange={(e) => handleSearch(key, e.target.value)}
                    />
                )
            })}
        </div>
    );
}