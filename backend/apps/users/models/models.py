import hashlib
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.db import models
from .managers import UserManager
from core.models import BaseModel


class UserModel(AbstractBaseUser, PermissionsMixin, BaseModel):
    class Meta:
        db_table = 'auth_user'
        ordering = ['-id']

    email = models.EmailField(unique=True)
    name = models.CharField(max_length=20)
    surname = models.CharField(max_length=50, blank=True)
    is_active = models.BooleanField(default=False)
    is_staff = models.BooleanField(default=False)
    is_banned = models.BooleanField(default=False)
    avatar_hash = models.CharField(max_length=64, blank=True, null=False, editable=False)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name', 'surname']

    objects = UserManager()

    def save(self, *args, **kwargs):
        if self.email:
            self.avatar_hash = hashlib.md5(self.email.lower().strip().encode()).hexdigest()
            
        super().save(*args, **kwargs)
