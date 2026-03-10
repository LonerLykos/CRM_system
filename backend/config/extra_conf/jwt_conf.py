import base64
from datetime import timedelta
import os

def decode_key(env_var: str) -> str:
    val = os.getenv(env_var)
    if not val:
        raise RuntimeError(f"Environment variable {env_var} not set")
    return base64.b64decode(val).decode("utf-8")

def read_file_or_env(file_path: str, env_var: str) -> str:
    try:
        return open(file_path, "r").read() if os.path.exists(file_path) else decode_key(env_var)
    except (OSError, IOError):
        return decode_key(env_var)

SIGNING_KEY = read_file_or_env("/app/extra_data/keys/private.pem", "JWT_PRIVATE_KEY_B64")
VERIFYING_KEY = read_file_or_env("/app/extra_data/keys/public.pem", "JWT_PUBLIC_KEY_B64")

SIMPLE_JWT = {
    "ALGORITHM": "RS256",
    "SIGNING_KEY": SIGNING_KEY,
    "VERIFYING_KEY": VERIFYING_KEY,
    "ACCESS_TOKEN_LIFETIME": timedelta(hours=1),
    "REFRESH_TOKEN_LIFETIME": timedelta(hours=8),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
    "UPDATE_LAST_LOGIN": True,
    "AUTH_HEADER_TYPES": ("Bearer",),
}
