from rest_framework.permissions import BasePermission


class IsActiveUser(BasePermission):
    message = 'Ask admin to activate your account'

    def has_permission(self, request, view) :
        return request.user and request.user.is_active