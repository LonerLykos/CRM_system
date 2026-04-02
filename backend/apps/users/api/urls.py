from django.urls import path

from apps.users.api.views.write.user_active_toggle import UserActiveToggleView
from apps.users.api.views.write.user_ban_toggle import UserBanToggleView
from apps.users.api.views.write.user_create_view import UserCreateView
from apps.users.api.views.read.user_detail import UserDetailsView
from apps.users.api.views.write.user_restore_password_view import UserRestorePasswordView
from apps.users.api.views.read.user_list import UserListView
from apps.users.api.views.write.user_set_password import UserSetPasswordView

urlpatterns = [
    path('', UserListView.as_view(), name='users_user_list'),
    path('/create_user', UserCreateView.as_view(), name='users_user_create'),
    path('/<int:pk>', UserDetailsView.as_view(), name='users_user_details'),
    path('/<int:pk>/active_toggle', UserActiveToggleView.as_view(), name='users_user_active_toggle'),
    path('/set_password/<str:token>', UserSetPasswordView.as_view(), name='users_user_set_password'),
    path('/<int:pk>/ban_toggle', UserBanToggleView.as_view(), name='users_user_ban_toggle'),
    path('/<int:pk>/restore_password', UserRestorePasswordView.as_view(), name='users_user_restore_password'),
]