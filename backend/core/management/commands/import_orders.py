import json
from datetime import datetime, timezone
from pathlib import Path

import structlog
from apps.crm.models.orders_model import OrdersModel
from django.core.management import BaseCommand

logger = structlog.get_logger(__name__)

ORDERS_JSON_PATH = (
    Path(__file__).resolve().parent.parent.parent.parent
    / 'extra_data' / 'base_data_for_db' / 'orders.json'
)


def _parse_datetime(raw):
    """Parse datetime string from JSON; returns aware datetime or None."""
    if not raw:
        return None
    try:
        # Format: "2021-11-01 19:56:37.000000"
        dt = datetime.strptime(raw, '%Y-%m-%d %H:%M:%S.%f')
        return dt.replace(tzinfo=timezone.utc)
    except (ValueError, TypeError):
        try:
            dt = datetime.strptime(raw, '%Y-%m-%d %H:%M:%S')
            return dt.replace(tzinfo=timezone.utc)
        except (ValueError, TypeError):
            return None


class Command(BaseCommand):
    help = 'Import orders from extra_data/base_data_for_db/orders.json (idempotent)'

    def handle(self, *args, **options):
        if not ORDERS_JSON_PATH.exists():
            self.stdout.write(
                self.style.ERROR(f'orders.json not found: {ORDERS_JSON_PATH}')
            )
            return

        with open(ORDERS_JSON_PATH, encoding='utf-8') as fh:
            records = json.load(fh)

        self.stdout.write(f'Loaded {len(records)} records from JSON.')

        existing_ids = set(
            OrdersModel.objects.values_list('id', flat=True)
        )

        created_count = 0
        skipped_count = 0

        for record in records:
            order_id = record.get('id')

            if order_id in existing_ids:
                skipped_count += 1
                continue

            created_at = _parse_datetime(record.get('created_at'))

            order = OrdersModel(
                id=order_id,
                name=record.get('name'),
                surname=record.get('surname'),
                email=record.get('email'),
                phone=record.get('phone'),
                age=record.get('age'),
                course=record.get('course'),
                course_format=record.get('course_format'),
                course_type=record.get('course_type'),
                sum=record.get('sum'),
                already_paid=record.get('alreadyPaid'),  # JSON field name mapping
                utm=record.get('utm'),
                msg=record.get('msg'),
                status=record.get('status'),
                group=None,
                manager=None,
            )
            order.save()

            # auto_now_add ignores assignments on save(); patch created_at afterwards
            if created_at is not None:
                OrdersModel.objects.filter(pk=order.pk).update(created_at=created_at)

            created_count += 1
            existing_ids.add(order_id)

        self.stdout.write(
            self.style.SUCCESS(
                f'Done. Created: {created_count}, skipped (already exist): {skipped_count}.'
            )
        )
        logger.info(
            'import_orders.finished',
            created=created_count,
            skipped=skipped_count,
        )
