from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ZoomMeetingViewSet,
    ZoomSignatureView,
    CourseZoomMeetingsView
)

router = DefaultRouter()
router.register(r'meetings', ZoomMeetingViewSet, basename='zoom-meetings')

urlpatterns = [
    # URL для API з використанням маршрутизатора
    path('', include(router.urls)),
    
    # URL для отримання JWT підпису
    path('signature/', ZoomSignatureView.as_view(), name='zoom-signature'),
    
    # URL для отримання зустрічей для конкретного курсу
    path('course/<int:course_id>/meetings/', CourseZoomMeetingsView.as_view(), name='course-zoom-meetings'),
]