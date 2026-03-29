from apps.crm.models.choices_models import StatusChoices, CoursesChoices, CoursesTypeChoices, CoursesFormatChoices


class ChoicesProvider:

    @staticmethod
    def _choices_to_dict(choices):
        return {value: label for value, label in choices}

    @classmethod
    def get_all(cls):
        return {
            'course': cls._choices_to_dict(CoursesChoices.choices),
            'course_type': cls._choices_to_dict(CoursesTypeChoices.choices),
            'course_format': cls._choices_to_dict(CoursesFormatChoices.choices),
            'status': cls._choices_to_dict(StatusChoices.choices),
        }
