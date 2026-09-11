from core.selectors import BaseSelector
from django.db.models import Count, Q

from apps.crm.models.choices_models import StatusChoices
from apps.crm.models.orders_model import OrdersModel


def new_status_q(prefix: str = '') -> Q:
    field = f'{prefix}status'
    return (
        Q(**{field: StatusChoices.NEW})
        | Q(**{f'{field}__isnull': True})
        | Q(**{field: ''})
    )


class OrderSelector(BaseSelector[OrdersModel]):
    model = OrdersModel

    def get_queryset(self):
        return self.model.objects.for_list()

    def get_by_id(self, pk: int):
        return self.model.objects.for_detail().filter(pk=pk).first()

    def get_status_stats(self, manager_id: int | None = None) -> dict:
        """Aggregated order counts by status. An empty status is folded into 'new'
        (business rule: empty/'new' are equivalent, see new_status_q)."""

        qs = self.model.objects.all()

        if manager_id is not None:
            qs = qs.filter(manager_id=manager_id)

        aggregation = qs.aggregate(
            total=Count('id'),
            new=Count('id', filter=new_status_q()),
            in_work=Count('id', filter=Q(status=StatusChoices.IN_WORK)),
            agree=Count('id', filter=Q(status=StatusChoices.AGREE)),
            disagree=Count('id', filter=Q(status=StatusChoices.DISAGREE)),
            dubbing=Count('id', filter=Q(status=StatusChoices.DUBBING)),
        )

        return aggregation
