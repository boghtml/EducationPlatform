# myplatform-backend/myplatform/middleware.py - Оновлений
class ZoomSecurityMiddleware:
    """Middleware для додавання необхідних HTTP заголовків для Zoom SDK."""
    
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        
        # Додаємо заголовки, необхідні для SharedArrayBuffer
        response["Cross-Origin-Opener-Policy"] = "same-origin"
        response["Cross-Origin-Embedder-Policy"] = "require-corp"
        response["Cross-Origin-Resource-Policy"] = "cross-origin"
        
        # Додаткові заголовки для CORS
        response["Access-Control-Allow-Origin"] = "http://localhost:3000"
        response["Access-Control-Allow-Credentials"] = "true"
        response["Access-Control-Allow-Headers"] = "Content-Type, X-CSRFToken"
        response["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
        
        # Додаємо заголовки для ZOOM SDK
        if '/zoom/' in request.path:
            response["Content-Security-Policy"] = "upgrade-insecure-requests"
        
        return response

import logging
import json
from django.utils.deprecation import MiddlewareMixin

logger = logging.getLogger('django.request')

class RequestLogMiddleware(MiddlewareMixin):
    """Middleware для логування HTTP запитів та відповідей"""
    
    def process_request(self, request):
        if 'zoom' in request.path:
            logger.info(f"Request: {request.method} {request.path}")
            
            # Log headers
            headers = {k: v for k, v in request.META.items() if k.startswith('HTTP_')}
            logger.debug(f"Headers: {headers}")
            
            # Log request body for POST/PUT/PATCH
            if request.method in ['POST', 'PUT', 'PATCH']:
                try:
                    if request.content_type and 'application/json' in request.content_type:
                        body = json.loads(request.body) if request.body else {}
                        logger.debug(f"Request body: {body}")
                    else:
                        logger.debug(f"Request body (not JSON): {request.POST}")
                except Exception as e:
                    logger.debug(f"Could not parse request body: {str(e)}")
        
    def process_response(self, request, response):
        if 'zoom' in request.path:
            logger.info(f"Response: {request.method} {request.path} - {response.status_code}")
            
            # Log response data
            if hasattr(response, 'data'):
                logger.debug(f"Response data: {response.data}")
            
        return response