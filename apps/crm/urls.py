from django.urls import path
from .views import OrdersListAPIView, OrdersUpdateAPIView

urlpatterns = [
    path('', OrdersListAPIView.as_view(), name='crm_orders_list'),
    path('/<int:pk>', OrdersUpdateAPIView.as_view(), name='crm_orders_update'),
]