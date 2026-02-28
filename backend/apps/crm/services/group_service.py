from apps.crm.models.group_model import GroupModel


class GroupsService:

    def create_group(self, name):
        normalized_name = name.strip().lower()

        return GroupModel.objects.get_or_create(name=normalized_name)
