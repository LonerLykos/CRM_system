from django.db import models


class BaseModel(models.Model):
    class Meta:
        abstract = True

    id: int

    created_at = models.DateTimeField(auto_now_add=True, null=True)
    updated_at = models.DateTimeField(auto_now=True, null=True)
