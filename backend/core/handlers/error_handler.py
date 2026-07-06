import structlog
from core.exceptions.mappers import EXCEPTION_MAP
from rest_framework.response import Response
from rest_framework.views import exception_handler

log = structlog.get_logger()


def error_handler(exc: Exception, context:dict):
    response = exception_handler(exc, context)

    if response:
        return response

    exc_class = exc.__class__.__name__
    mapping = EXCEPTION_MAP.get(exc_class)


    if mapping:
        return Response(
            {'detail': mapping['detail']},
            status=mapping['status']
        )
    log.error(f'Unhandled exception: {exc_class}', error=str(exc), context=context)
    return Response({'detail': 'Internal server error'}, status=500)
