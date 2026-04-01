from django.urls import path

from apps.users.api.views.write.user_restore_password_view import UserRestorePasswordView
from apps.users.api.views.read.user_list import UserListView
from apps.users.api.views.views import UserActivateView, SetPasswordView, ToggleBanUserView

urlpatterns = [
    path('', UserListView.as_view(), name='users_list'),
    path('/<int:pk>/activate', UserActivateView.as_view(), name='users_activate'),
    path('/<int:pk>/set_password', SetPasswordView.as_view(), name='users_set_password'),
    path('/<int:pk>/toggle_ban', ToggleBanUserView.as_view(), name='users_toggle_ban_status'),
    path('/int:pk/restore_password', UserRestorePasswordView.as_view(), name='users_restore_password'),
]