from django.contrib.auth.models import UserManager as Manager


class UserManager(Manager):
    def create_user(self, email=None, password=None, name=None, **extra_fields):
        if not email:
            raise ValueError('Users must have an email address')

        if not password:
            raise ValueError('Users must have a password')

        if not name:
            raise ValueError('Users must have a name')

        email = self.normalize_email(email)
        user = self.model(email=email, name=name, **extra_fields)
        user.set_password(password)
        user.save()
        return user

    def create_superuser(self, email=None, password=None, name=None, **extra_fields):
        extra_fields.setdefault('is_active', True)
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields['is_staff'] is not True:
            raise ValueError('Superuser must be is_staff')
        if extra_fields['is_superuser'] is not True:
            raise ValueError('Superuser must be is_superuser')
        if extra_fields['is_active'] is not True:
            raise ValueError('Superuser must be active.')

        if not name:
            name = "Admin"

        user = self.create_user(email, password, name, **extra_fields)
        return user
