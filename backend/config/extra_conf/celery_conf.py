import os

REDIS_URL = os.environ.get('REDIS_URL', 'redis://redis:6379/0')

CELERY_BROKER_URL = REDIS_URL
CELERY_RESULT_BACKEND = REDIS_URL

CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TIMEZONE = 'UTC'
CELERY_ENABLE_UTC = True

CELERY_RESULT_EXPIRES = 3600

CELERY_BEAT_SCHEDULE = {
    'cleanup-old-exports': {
        'task': 'apps.crm.tasks.cleanup_old_exports',
        'schedule': 3600.0,
    },
}
