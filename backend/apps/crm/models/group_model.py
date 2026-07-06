from core.models import BaseModel
from django.db import models


class GroupModel(BaseModel):
    class Meta:
        db_table = 'groups'

    name = models.CharField(max_length=100, unique=True)
