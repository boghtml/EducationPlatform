# middleware.py (додайте цей файл до myplatform-backend)
class ZoomSecurityMiddleware:
    """Middleware для додавання необхідних HTTP заголовків для Zoom SDK."""
    
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        
        # Додаємо необхідні заголовки для роботи SharedArrayBuffer
        response["Cross-Origin-Opener-Policy"] = "same-origin"
        response["Cross-Origin-Embedder-Policy"] = "require-corp"
        response["Cross-Origin-Resource-Policy"] = "cross-origin"
        
        return response