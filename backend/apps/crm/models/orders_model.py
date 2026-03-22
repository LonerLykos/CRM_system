from django.db import models
from apps.crm.models.choices_models import CoursesChoices, CoursesFormatChoices, CoursesTypeChoices, StatusChoices
from apps.crm.models.group_model import GroupModel
from apps.users.models import UserModel
from core.models import BaseModel


class OrderQuerySet(models.QuerySet):
    def for_list(self):
        return self.select_related('manager', 'group')

    def for_detail(self):
        return self.select_related('manager', 'group').prefetch_related('comments')


class OrdersModel(BaseModel):
    class Meta:
        db_table = 'orders'
        ordering = ['-id']

    name = models.CharField(max_length=25, blank=True, null=True)
    surname = models.CharField(max_length=25, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    phone = models.CharField(max_length=12, blank=True, null=True)
    age = models.IntegerField(blank=True, null=True)
    course = models.CharField(
        max_length=10,
        blank=True,
        null=True,
        choices=CoursesChoices.choices
    )
    course_format = models.CharField(
        max_length=15,
        blank=True,
        null=True,
        choices=CoursesFormatChoices.choices
    )
    course_type = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        choices=CoursesTypeChoices.choices
    )
    sum = models.FloatField(blank=True, null=True)
    already_paid = models.FloatField(blank=True, null=True)

    utm = models.CharField(max_length=100, blank=True, null=True)
    msg = models.CharField(max_length=100, blank=True, null=True)
    status = models.CharField(
        max_length=15,
        blank=True,
        null=True,
        choices=StatusChoices.choices
    )
    group = models.ForeignKey(GroupModel, related_name='orders', on_delete=models.SET_NULL, null=True)
    manager = models.ForeignKey(UserModel, related_name='orders', on_delete=models.SET_NULL, null=True)

    objects = OrderQuerySet.as_manager()
