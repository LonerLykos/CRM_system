from django.urls import path
from apps.users.api.views.views import UserListView, UserActivateView, SetPasswordView, ToggleBanUserView

urlpatterns = [
    path('', UserListView.as_view(), name='users_list'),
    path('/<int:pk>/activate', UserActivateView.as_view(), name='users_activate'),
    path('/<int:pk>/set_password', SetPasswordView.as_view(), name='users_set_password'),
    path('/<int:pk>/toggle_ban', ToggleBanUserView.as_view(), name='users_toggle_ban_status'),
]