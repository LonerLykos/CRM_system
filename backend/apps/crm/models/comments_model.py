from django.db import models
from apps.crm.models.orders_model import OrdersModel
from apps.users.models import UserModel
from core.models import BaseModel


class CommentsModel(BaseModel):
    class Meta:
        db_table = 'comments'
        ordering = ['-id']

    order = models.ForeignKey(OrdersModel, related_name='comments', on_delete=models.CASCADE)
    user = models.ForeignKey(UserModel, related_name='comments', on_delete=models.CASCADE)
    comment = models.TextField(blank=False)