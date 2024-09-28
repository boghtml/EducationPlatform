"""
URL configuration for myplatform project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
# myplatform/urls.py

from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.middleware.csrf import get_token
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from rest_framework import permissions


def get_csrf_token(request):
    response = JsonResponse({'csrftoken': get_token(request)})
    response['Access-Control-Allow-Origin'] = 'http://localhost:3000'
    response['Access-Control-Allow-Credentials'] = 'true'
    return response

schema_view = get_schema_view(
    openapi.Info(
        title="My API",
        default_version='v1',
        description="API documentation",
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/get-csrf-token/', get_csrf_token),  # Додайте цей маршрут
    path('api/', include('apps.courses.urls')),  
    path('api/users/', include('apps.users.urls')),
    path('api/enrollments/', include('apps.enrollments.urls')),
    
    path('api/modules/', include('apps.modules.urls')), 
    path('api/lessons/', include('apps.lessons.urls')), 

    path('api/notes/', include('apps.notes.urls')),  # Додаємо новий шлях для нотаток


    # Документація
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc-ui'),
]
