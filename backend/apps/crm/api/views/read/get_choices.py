from rest_framework.views import APIView
from rest_framework.response import Response
from apps.crm.selectors.choices_selectors import ChoicesProvider


class ChoicesView(APIView):
    provider_class = ChoicesProvider

    def get(self, request):
        data = self.provider_class.get_all()

        return Response(data)