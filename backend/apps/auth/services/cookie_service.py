class CookieService:
    @staticmethod
    def delete_auth_cookies(response):
        response.delete_cookie("access_token")
        response.delete_cookie("refresh_token")

    @staticmethod
    def set_auth_cookies(response, access_token, refresh_token, secure=False):
        cookie_settings = dict(
            httponly=True,
            secure=secure,
            samesite='Lax',
            path='/',
        )
        response.set_cookie(key='access_token', value=access_token, **cookie_settings)
        response.set_cookie(key='refresh_token', value=refresh_token, **cookie_settings)
