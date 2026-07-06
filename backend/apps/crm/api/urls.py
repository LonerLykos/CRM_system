from django.urls import path

from apps.crm.api.views.read.choices_list import ChoicesView
from apps.crm.api.views.read.export_download import ExportDownloadView
from apps.crm.api.views.read.export_status import ExportStatusView
from apps.crm.api.views.read.groups_list import GroupsListView
from apps.crm.api.views.read.order_details import OrderDetails
from apps.crm.api.views.read.orders_export import OrdersExportView
from apps.crm.api.views.read.orders_list import OrdersListView
from apps.crm.api.views.write.create_comment_view import CreateCommentView
from apps.crm.api.views.write.create_group import AddGroupView
from apps.crm.api.views.write.update_order import OrderUpdateView

urlpatterns = [
    path('', OrdersListView.as_view(), name='crm_orders_list'),
    path('/export', OrdersExportView.as_view(), name='crm_orders_export'),
    path('/export/<str:task_id>', ExportStatusView.as_view(), name='crm_orders_export_status'),
    path('/export/<str:task_id>/download', ExportDownloadView.as_view(), name='crm_orders_export_download'),
    path('/groups', GroupsListView.as_view(), name='crm_groups_list'),
    path('/groups/create', AddGroupView.as_view(), name='crm_groups_create'),
    path('/choices', ChoicesView.as_view(), name='crm_choice_view'),
    path('/<int:pk>', OrderDetails.as_view(), name='crm_get_order_by_id'),
    path('/<int:pk>/update', OrderUpdateView.as_view(), name='crm_orders_update'),
    path('/<int:pk>/comment', CreateCommentView.as_view(), name='crm_comment_create'),
]