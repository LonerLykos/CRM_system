export function orderingToggle(param: string, field: string) {
    if (param === field || param === `-${field}`) {
        return param.startsWith("-") ? param.slice(1) : "-" + param;
    }
    return field;
}