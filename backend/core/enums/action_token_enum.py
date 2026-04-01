from datetime import timedelta
from enum import Enum


class ActionTokenEnum(Enum):
    PASSWORD = ('password', timedelta(minutes=10))

    def __init__(self, token_type, lifetime):
        self.token_type = token_type
        self.lifetime = lifetime

