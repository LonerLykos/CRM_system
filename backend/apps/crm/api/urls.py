from django.urls import path
from apps.crm.api.views.read.get_all_orders import OrdersListAPIView
from apps.crm.api.views.read.get_order_by_id import GetOrderById

urlpatterns = [
    path('', OrdersListAPIView.as_view(), name='crm_orders_list'),
    path('/<int:pk>', GetOrderById.as_view(), name='crm_get_order_by_id'),
]