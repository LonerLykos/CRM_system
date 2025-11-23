from django.db import models
from apps.users.models import UserModel
from core.models import BaseModel


class GroupModel(BaseModel):
    class Meta:
        db_table = 'groups'
    name = models.CharField(max_length=100, unique=True, blank=True)


class StatusChoices(models.TextChoices):
    IN_WORK = 'In Work'
    NEW = 'New'
    AGREE = 'Agree'
    DISAGREE = 'Disagree'
    DUBBING = 'Dubbing'


class CoursesChoices(models.TextChoices):
    FS = 'FS'
    QACX = 'QACX'
    JCX = 'JCX'
    JSCX = 'JSCX'
    FE = 'FE'
    PCX = 'PCX'


class CoursesTypeChoices(models.TextChoices):
    PRO = 'Pro'
    MINIMAL = 'Minimal'
    PREMIUM = 'Premium'
    INCUBATOR = 'Incubator'
    VIP = 'VIP'


class CoursesFormatChoices(models.TextChoices):
    STATIC = 'Static'
    ONLINE = 'Online'


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


class CommentsModel(BaseModel):
    class Meta:
        db_table = 'comments'
        ordering = ['-id']

    order = models.ForeignKey(OrdersModel, related_name='comments', on_delete=models.CASCADE)
    user = models.ForeignKey(UserModel, related_name='comments', on_delete=models.CASCADE)
    comment = models.TextField(blank=False)
