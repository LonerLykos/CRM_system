import structlog
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import serializers

log = structlog.get_logger()

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        user = self.user

        reason = None
        if user.is_banned:
            reason = "banned"
        elif not user.is_active:
            reason = "inactive"

        if reason:
            log.warning(
                "Login attempt failed",
                id=user.id,
                username=user.name,
                email=user.email,
                reason=reason
            )
            raise serializers.AuthenticationFailed("Invalid credentials or account inactive.")

        return data
