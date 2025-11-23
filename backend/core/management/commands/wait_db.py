from django.core.management import BaseCommand
from django.db import OperationalError, connection
import time


class Command(BaseCommand):
    def handle(self, *args, **options):
        self.stdout.write('Waiting database...')
        con_db = False

        while not con_db:
            try:
                connection.ensure_connection()
                con_db = True
            except OperationalError:
                self.stdout.write('Database unavailable, wait 3 seconds...')
                time.sleep(3)

        self.stdout.write(self.style.SUCCESS('Database available'))