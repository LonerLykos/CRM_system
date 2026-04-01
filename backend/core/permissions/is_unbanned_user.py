from rest_framework.permissions import BasePermission


class IsUnbannedUser(BasePermission):
    message = 'Your account is banned.'

    def has_permission(self, request, view):
        return request.user and request.user.is_banned