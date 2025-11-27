from django.db import models


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
