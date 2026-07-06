from core.selectors import BaseSelector
from django.db.models import Count, Q

from apps.crm.models.choices_models import StatusChoices
from apps.users.models import UserModel


class UsersSelector(BaseSelector[UserModel]):
    model = UserModel

    def get_queryset_with_stats(self):
        return self.model.objects.annotate(
            stat_total=Count('orders'),
            stat_new=Count(
                'orders',
                filter=Q(orders__status=StatusChoices.NEW) | Q(orders__status__isnull=True),
            ),
            stat_in_work=Count('orders', filter=Q(orders__status=StatusChoices.IN_WORK)),
            stat_agree=Count('orders', filter=Q(orders__status=StatusChoices.AGREE)),
            stat_disagree=Count('orders', filter=Q(orders__status=StatusChoices.DISAGREE)),
            stat_dubbing=Count('orders', filter=Q(orders__status=StatusChoices.DUBBING)),
        ).order_by('-id')
