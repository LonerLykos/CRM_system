import os
import time
from datetime import datetime
from types import SimpleNamespace

import structlog
from celery import shared_task
from django.conf import settings
from django.http import QueryDict

from apps.crm.filters.crm_filter import OrderFilter
from apps.crm.selectors.order_selectors import OrderSelector
from apps.crm.services.export_service import OrderExportService
from apps.users.models import UserModel

log = structlog.get_logger()


@shared_task(bind=True)
def generate_orders_export(self, query_string: str, user_id: int):
    selector = OrderSelector()
    queryset = selector.get_queryset()

    user = UserModel.objects.filter(pk=user_id).first()
    request_shim = SimpleNamespace(user=user) if user else None

    params = QueryDict(query_string)
    filtered_qs = OrderFilter(params, queryset=queryset, request=request_shim).qs  # type: ignore[arg-type]

    total = filtered_qs.count()
    self.update_state(state='PROGRESS', meta={'processed': 0, 'total': total})

    def progress(processed, tot):
        self.update_state(state='PROGRESS', meta={'processed': processed, 'total': tot})

    workbook = OrderExportService.build_workbook(filtered_qs, total, progress_callback=progress)

    os.makedirs(settings.EXPORTS_DIR, exist_ok=True)
    filename = f'orders_{self.request.id}.xlsx'
    filepath = os.path.join(settings.EXPORTS_DIR, filename)
    workbook.save(filepath)

    download_name = f"orders_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
    log.info('Orders export generated', task_id=self.request.id, rows=total, file=filename)

    return {'filename': filename, 'download_name': download_name, 'total': total}


@shared_task
def cleanup_old_exports():
    exports_dir = settings.EXPORTS_DIR
    if not os.path.isdir(exports_dir):
        return {'removed': 0}

    ttl = settings.EXPORTS_TTL_SECONDS
    now = time.time()
    removed = 0

    for name in os.listdir(exports_dir):
        path = os.path.join(exports_dir, name)
        if os.path.isfile(path) and now - os.path.getmtime(path) > ttl:
            try:
                os.remove(path)
                removed += 1
            except OSError as e:
                log.warning('Failed to remove stale export', file=name, error=str(e))

    if removed:
        log.info('Stale exports purged', removed=removed)
    return {'removed': removed}
