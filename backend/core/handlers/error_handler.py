from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import exception_handler


def error_handler(exc: Exception, context:dict):
    handlers = {
        "JWTException": _jwt_validation_exception_handler,
        "OrderPermissionDenied": _order_permission_exception_handler,
        "OrderNotFound": _order_not_found_exception_handler,
    }
    response = exception_handler(exc, context)
    exc_class = exc.__class__.__name__

    if exc_class in handlers:
        return handlers[exc_class](exc, context)

    return response


def _jwt_validation_exception_handler(exc, context):
    return Response(
        {'detail': 'JWT expired or invalid'},
        status.HTTP_401_UNAUTHORIZED
    )


def _order_permission_exception_handler(exc, context):
    return Response(
        {'detail': 'You are not owner of this order'},
        status.HTTP_403_FORBIDDEN
    )


def _order_not_found_exception_handler(exc, context):
    return Response(
        {'detail': 'Order not found'},
        status.HTTP_404_NOT_FOUND
    )
