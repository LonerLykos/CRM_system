from core.selectors import BaseSelector
from apps.crm.models.group_model import GroupModel


class GroupsSelector(BaseSelector):
    model = GroupModel
