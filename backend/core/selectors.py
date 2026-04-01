from django.db import models
from django.shortcuts import get_object_or_404

class BaseSelector:
    model: models.Model = None

    def get_queryset(self):
        return self.model.objects.all()

    def get_by_id(self, pk):
        return self.get_queryset().filter(pk=pk).first()

    def list(self):
        return self.get_queryset().all()
