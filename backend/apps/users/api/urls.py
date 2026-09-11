from django.urls import path

from apps.users.api.views.read.user_detail import UserDetailsView
from apps.users.api.views.read.user_list import UserListView
from apps.users.api.views.read.user_statistic import (
    GlobalUserStatisticView,
    ManagerUserStatisticView,
)
from apps.users.api.views.write.user_active import UserActivateView, UserDeactivateView
from apps.users.api.views.write.user_ban import UserBanView, UserUnbanView
from apps.users.api.views.write.user_create_view import UserCreateView
from apps.users.api.views.write.user_restore_password_view import UserRestorePasswordView
from apps.users.api.views.write.user_set_password import UserSetPasswordView

urlpatterns = [
    path('', UserListView.as_view(), name='users_user_list'),
    path('/create_user', UserCreateView.as_view(), name='users_user_create'),
    path('/statistic', GlobalUserStatisticView.as_view(), name='users_statistic_global'),
    path('/<int:pk>', UserDetailsView.as_view(), name='users_user_details'),
    path('/<int:pk>/activate', UserActivateView.as_view(), name='users_user_activate'),
    path('/<int:pk>/deactivate', UserDeactivateView.as_view(), name='users_user_deactivate'),
    path('/<int:pk>/ban', UserBanView.as_view(), name='users_user_ban'),
    path('/<int:pk>/unban', UserUnbanView.as_view(), name='users_user_unban'),
    path('/<int:pk>/restore_password', UserRestorePasswordView.as_view(), name='users_user_restore_password'),
    path('/<int:pk>/statistic', ManagerUserStatisticView.as_view(), name='users_statistic_manager'),
    path('/set_password/<str:token>', UserSetPasswordView.as_view(), name='users_user_set_password'),
]