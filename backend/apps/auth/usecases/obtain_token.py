from apps.auth.services.cookie_service import CookieService


class ObtainTokenUseCase:
    def __init__(self, cookie_service: CookieService):
        self.cookie_service = cookie_service

    def execute(self, response, access_token: str, refresh_token: str):
        self.cookie_service.set_auth_cookies(response, access_token, refresh_token)

        response.data = {"message": "Successful"}
        response.status_code = 200
        return response
