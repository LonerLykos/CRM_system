from django.utils.deprecation import MiddlewareMixin

class JWTAuthCookieMiddleware(MiddlewareMixin):

    def process_request(self, request):
        access_token = request.COOKIES.get('access_token')
        if access_token and 'HTTP_AUTHORIZATION' not in request.META:
            request.META['HTTP_AUTHORIZATION'] = f'Bearer {access_token}'
