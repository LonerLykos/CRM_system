from django.db import IntegrityError, transaction
from rest_framework.exceptions import ValidationError

from apps.crm.models.group_model import GroupModel
from apps.crm.serializers.groups_serializers import DUPLICATE_GROUP_MESSAGE


class GroupsService:

    def create_group(self, name):
        try:
            with transaction.atomic():
                return GroupModel.objects.create(name=name.strip())
        except IntegrityError:
            raise ValidationError({'name': [DUPLICATE_GROUP_MESSAGE]}) from None
