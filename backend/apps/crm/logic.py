CHOICE_FIELDS = {
    "course": "upper",
    "course_format": "lower",
    "course_type": "lower",
    "status": "lower",
}


def normalize_order_choices(data):
    result = data.copy()

    for field, mode in CHOICE_FIELDS.items():
        value = result.get(field)

        if 'alreadyPaid' in result:
            result['already_paid'] = result.pop('alreadyPaid')

        if not value:
            continue

        if not isinstance(value, str):
            continue

        if mode == "upper":
            result[field] = value.strip().upper()
        else:
            result[field] = value.strip().lower()

    return result