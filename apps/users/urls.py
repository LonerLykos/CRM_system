from django.urls import path
from .views import UserListView, UserActivateView, SetPasswordView, UserRetrieveView

urlpatterns = [
    path('', UserListView.as_view(), name='users_list'),
    path('/<int:pk>', UserRetrieveView.as_view(), name='users_retrieve'),
    path('/<int:pk>/activate', UserActivateView.as_view(), name='users_activate'),
    path('/<int:pk>/set_password', SetPasswordView.as_view(), name='users_set_password'),
]