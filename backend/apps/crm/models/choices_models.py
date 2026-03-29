from django.db import models


class StatusChoices(models.TextChoices):
    NEW = 'new', 'New'
    IN_WORK = 'in_work', 'In Work'
    AGREE = 'agree', 'Agree'
    DISAGREE = 'disagree', 'Disagree'
    DUBBING = 'dubbing', 'Dubbing'


class CoursesChoices(models.TextChoices):
    FS = 'FS', 'Fullstack'
    QACX = 'QACX', 'QA Complex'
    JCX = 'JCX', 'Java Complex'
    JSCX = 'JSCX', 'JavaScript Complex'
    FE = 'FE', 'Frontend'
    PCX = 'PCX', 'Python Complex'


class CoursesTypeChoices(models.TextChoices):
    PRO = 'pro', 'Pro'
    MINIMAL = 'minimal', 'Minimal'
    PREMIUM = 'premium', 'Premium'
    INCUBATOR = 'incubator', 'Incubator'
    VIP = 'vip', 'VIP'


class CoursesFormatChoices(models.TextChoices):
    STATIC = 'static', 'Static'
    ONLINE = 'online', 'Online'