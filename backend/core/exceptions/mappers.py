from rest_framework import status

EXCEPTION_MAP = {
    'JWTException': {
        'status': status.HTTP_401_UNAUTHORIZED,
        'detail': 'JWT expired or invalid'
    },
    'OrderNotFound': {
        'status': status.HTTP_404_NOT_FOUND,
        'detail': 'Order not found'
    },
    'OrderPermissionDenied': {
        'status': status.HTTP_403_FORBIDDEN,
        'detail': 'You are not owner of this order'
    },
    'UserNotFound': {
        'status': status.HTTP_404_NOT_FOUND,
        'detail': 'User not found'
    },
    'UserPermissionDenied': {
        'status': status.HTTP_403_FORBIDDEN,
        'detail': 'Access denied'
    },
}