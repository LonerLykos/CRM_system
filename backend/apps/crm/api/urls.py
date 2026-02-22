from django.urls import path
from apps.crm.api.views.read.get_all_orders import OrdersListAPIView
from apps.crm.api.views.read.get_choices import ChoicesView
from apps.crm.api.views.read.get_order_by_id import GetOrderById
from apps.crm.api.views.write.create_comment_view import CreateCommentView

urlpatterns = [
    path('', OrdersListAPIView.as_view(), name='crm_orders_list'),
    path('/<int:pk>', GetOrderById.as_view(), name='crm_get_order_by_id'),
    path('/choices', ChoicesView.as_view(), name='crm_choice_view'),
    path('/<int:pk>/comment', CreateCommentView.as_view(), name='crm_comment_create'),
]