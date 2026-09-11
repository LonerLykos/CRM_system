from datetime import datetime, time, timedelta

from django.db.models.functions import Lower
from django.utils import timezone
from django_filters import rest_framework as filters

from apps.crm.models.group_model import GroupModel
from apps.crm.models.orders_model import CoursesChoices, CoursesFormatChoices, CoursesTypeChoices, StatusChoices
from apps.crm.selectors.order_selectors import new_status_q


def _start_of_day(day):
    return timezone.make_aware(datetime.combine(day, time.min))


class OrderFilter(filters.FilterSet):
    name_contains = filters.CharFilter(field_name='name', lookup_expr='icontains')
    surname_contains = filters.CharFilter(field_name='surname', lookup_expr='icontains')
    email_contains = filters.CharFilter(field_name='email', lookup_expr='icontains')
    phone_contains = filters.CharFilter(field_name='phone', lookup_expr='icontains')
    age_eq = filters.NumberFilter(field_name='age', lookup_expr='exact')
    course = filters.ChoiceFilter('course', choices=CoursesChoices.choices)
    course_type = filters.ChoiceFilter('course_type', choices=CoursesTypeChoices.choices)
    course_format = filters.ChoiceFilter('course_format', choices=CoursesFormatChoices.choices)
    sum_eq = filters.NumberFilter(field_name='sum', lookup_expr='exact')
    already_paid_eq = filters.NumberFilter(field_name='already_paid', lookup_expr='exact')
    status = filters.ChoiceFilter('status', choices=StatusChoices.choices, method='filter_status')
    group = filters.ModelChoiceFilter(field_name='group', queryset=GroupModel.objects.all())
    group_name_contains = filters.CharFilter(field_name='group__name', method='filter_group_name')
    created_at_lte = filters.DateFilter(field_name='created_at', method='filter_created_to')
    created_at_gte = filters.DateFilter(field_name='created_at', method='filter_created_from')
    my = filters.BooleanFilter(method='filter_my_orders')
    order = filters.OrderingFilter(
        fields=(
            ('id', 'id'),
            ('name', 'name'),
            ('surname', 'surname'),
            ('email', 'email'),
            ('phone', 'phone'),
            ('age', 'age'),
            ('course', 'course'),
            ('course_format', 'course_format'),
            ('course_type', 'course_type'),
            ('sum', 'sum'),
            ('already_paid', 'already_paid'),
            ('created_at', 'created_at'),
            ('status', 'status'),
            ('group__name', 'group'),
            ('manager__surname', 'manager'),
        )
    )

    def filter_status(self, queryset, name, value):
        if value == StatusChoices.NEW:
            return queryset.filter(new_status_q())
        return queryset.filter(status=value)

    def filter_group_name(self, queryset, name, value):
        return queryset.alias(group_name_lower=Lower('group__name')).filter(
            group_name_lower__contains=value.lower()
        )

    def filter_created_from(self, queryset, name, value):
        return queryset.filter(created_at__gte=_start_of_day(value))

    def filter_created_to(self, queryset, name, value):
        return queryset.filter(created_at__lt=_start_of_day(value + timedelta(days=1)))

    def filter_my_orders(self, queryset, name, value):
        request = self.request
        if value and request is not None and request.user.is_authenticated:
            return queryset.filter(manager=request.user)
        return queryset
