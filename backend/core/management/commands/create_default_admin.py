import structlog
from apps.users.models import UserModel
from django.core.management import BaseCommand

logger = structlog.get_logger(__name__)

ADMIN_EMAIL = 'admin@gmail.com'
ADMIN_PASSWORD = 'admin'
ADMIN_NAME = 'Admin'
ADMIN_SURNAME = 'Admin'


class Command(BaseCommand):
    help = 'Create default superuser admin@gmail.com / admin (idempotent)'

    def handle(self, *args, **options):
        if UserModel.objects.filter(email=ADMIN_EMAIL).exists():
            self.stdout.write(
                self.style.WARNING(f'Default admin already exists: {ADMIN_EMAIL}')
            )
            logger.info('create_default_admin.skipped', email=ADMIN_EMAIL)
            return

        UserModel.objects.create_superuser(
            email=ADMIN_EMAIL,
            password=ADMIN_PASSWORD,
            name=ADMIN_NAME,
            surname=ADMIN_SURNAME,
        )
        self.stdout.write(
            self.style.SUCCESS(f'Default admin created: {ADMIN_EMAIL}')
        )
        logger.info('create_default_admin.created', email=ADMIN_EMAIL)
