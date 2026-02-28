from django.urls import path
from apps.crm.api.views.read.get_all_groups import GroupsListView
from apps.crm.api.views.read.get_all_orders import OrdersListView
from apps.crm.api.views.read.get_choices import ChoicesView
from apps.crm.api.views.read.get_order_by_id import GetOrderById
from apps.crm.api.views.write.add_group import AddGroupView
from apps.crm.api.views.write.create_comment_view import CreateCommentView
from apps.crm.api.views.write.update_order import OrderUpdateView

urlpatterns = [
    path('', OrdersListView.as_view(), name='crm_orders_list'),
    path('/groups', GroupsListView.as_view(), name='crm_groups_list'),
    path('/groups/create', AddGroupView.as_view(), name='crm_groups_create'),
    path('/choices', ChoicesView.as_view(), name='crm_choice_view'),
    path('/<int:pk>', GetOrderById.as_view(), name='crm_get_order_by_id'),
    path('/<int:pk>/update', OrderUpdateView.as_view(), name='crm_orders_update'),
    path('/<int:pk>/comment', CreateCommentView.as_view(), name='crm_comment_create'),
]