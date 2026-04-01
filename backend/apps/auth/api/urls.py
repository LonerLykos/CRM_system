from django.urls import path
from .views.read.auth_user import AuthUserView
from .views.write.logout_view import LogoutView
from .views.write.token_obtain_view import CookieTokenObtainPairView
from .views.write.token_refresh_view import CookieTokenRefreshView

urlpatterns = [
    path('', CookieTokenObtainPairView.as_view(), name='auth_login'),
    path('/refresh', CookieTokenRefreshView.as_view(), name='auth_refresh'),
    path('/logout', LogoutView.as_view(), name='auth_logout'),
    path('/me', AuthUserView.as_view(), name='auth_user'),
]