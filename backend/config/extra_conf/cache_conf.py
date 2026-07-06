import os

_REDIS_URL = os.environ.get('REDIS_URL', 'redis://redis:6379/0')

REDIS_CACHE_URL = os.environ.get('REDIS_CACHE_URL', _REDIS_URL.rsplit('/', 1)[0] + '/1')

CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.redis.RedisCache',
        'LOCATION': REDIS_CACHE_URL,
    }
}
