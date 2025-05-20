from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ZoomMeetingViewSet,
    ZoomSDKAuthView,
    CourseZoomMeetingsView,
    test_zoom_token,
    test_zoom_api
)

router = DefaultRouter()
router.register(r'meetings', ZoomMeetingViewSet, basename='zoom-meetings')

urlpatterns = [
    
    path('', include(router.urls)),
    
    path('sdk-auth/', ZoomSDKAuthView.as_view(), name='zoom-sdk-auth'),
    
    path('course/<int:course_id>/meetings/', CourseZoomMeetingsView.as_view(), name='course-zoom-meetings'),

    path('test-token/', test_zoom_token, name='test-zoom-token'),
    path('test-api/', test_zoom_api, name='test-zoom-api'),  

]