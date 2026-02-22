from apps.crm.models.choices_models import StatusChoices, CoursesChoices, CoursesTypeChoices, CoursesFormatChoices


class ChoicesProvider:

    @staticmethod
    def _choices_to_dict(choices):
        return {value: label for value, label in choices}

    @classmethod
    def get_all(cls):
        return {
            'statuses': cls._choices_to_dict(StatusChoices.choices),
            'courses': cls._choices_to_dict(CoursesChoices.choices),
            'types': cls._choices_to_dict(CoursesTypeChoices.choices),
            'formats': cls._choices_to_dict(CoursesFormatChoices.choices),
        }
