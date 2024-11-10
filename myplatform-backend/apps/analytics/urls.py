from django.urls import path
from .views import admin_analytics

urlpatterns = [
    path('admin-analytics/', admin_analytics, name='admin_analytics'),
]
