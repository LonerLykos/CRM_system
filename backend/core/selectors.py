from typing import Generic, TypeVar

from django.db import models

M = TypeVar('M', bound=models.Model)


class BaseSelector(Generic[M]):
    model: type[M]

    def get_queryset(self) -> models.QuerySet[M]:
        return self.model.objects.all()

    def get_by_id(self, pk) -> M | None:
        return self.get_queryset().filter(pk=pk).first()
