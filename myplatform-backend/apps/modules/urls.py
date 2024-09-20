from django.urls import path
from .views import ModulesByCourseView

urlpatterns = [
    path('get_modules/<int:course_id>/', ModulesByCourseView.as_view(), name='modules_by_course'),
]
