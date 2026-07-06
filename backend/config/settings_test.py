import base64
import os
import tempfile
from pathlib import Path

_BASE = Path(__file__).resolve().parent.parent
_KEYS = _BASE / "extra_data" / "keys"

os.environ.setdefault("SECRET_KEY", "test-secret-key")
os.environ.setdefault("DEBUG", "False")
os.environ.setdefault(
    "JWT_PRIVATE_KEY_B64",
    base64.b64encode((_KEYS / "private.pem").read_bytes()).decode(),
)
os.environ.setdefault(
    "JWT_PUBLIC_KEY_B64",
    base64.b64encode((_KEYS / "public.pem").read_bytes()).decode(),
)

from .settings import *  # noqa: E402

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": ":memory:",
    }
}

ALLOWED_HOSTS = ["testserver", "localhost", "127.0.0.1"]

PASSWORD_HASHERS = ["django.contrib.auth.hashers.MD5PasswordHasher"]

CELERY_TASK_ALWAYS_EAGER = True
CELERY_TASK_EAGER_PROPAGATES = True
CELERY_TASK_STORE_EAGER_RESULT = True
CELERY_RESULT_BACKEND = "cache+memory://"

MEDIA_ROOT = Path(tempfile.mkdtemp(prefix="crm_test_media_"))
EXPORTS_DIR = MEDIA_ROOT / "exports"

REST_FRAMEWORK = {**REST_FRAMEWORK, "DEFAULT_THROTTLE_RATES": {"auth": None}}

CACHES = {"default": {"BACKEND": "django.core.cache.backends.locmem.LocMemCache"}}
