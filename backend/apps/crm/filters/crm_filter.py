from django_filters import rest_framework as filters
from apps.crm.models.orders_model import CoursesChoices, CoursesTypeChoices, CoursesFormatChoices, StatusChoices
from apps.crm.serializers.orders_serializers import OrdersSerializer


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
    status = filters.ChoiceFilter('day', choices=StatusChoices.choices)
    group_name_contains = filters.CharFilter(field_name='group__name', lookup_expr='icontains')
    created_at_lte = filters.DateTimeFilter(field_name='created_at', lookup_expr='lte')
    created_at_gte = filters.DateTimeFilter(field_name='created_at', lookup_expr='gte')
    my = filters.BooleanFilter(method='filter_my_orders')
    order = filters.OrderingFilter(
        fields=OrdersSerializer.Meta.fields
    )

    def filter_my_orders(self, queryset, value):
        if value and self.request.user.is_authenticated:
            return queryset.filter(manager=self.request.user)
        return queryset
