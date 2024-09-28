# apps/courses/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CourseViewSet, CourseUpdateIntroVideoView, CourseUpdateImageView

router = DefaultRouter()
router.register(r'courses', CourseViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('courses/<int:pk>/upload-intro-video/', CourseUpdateIntroVideoView.as_view(), name='upload_intro_video'),
    path('courses/<int:pk>/upload-image/', CourseUpdateImageView.as_view(), name='upload_image'),

]