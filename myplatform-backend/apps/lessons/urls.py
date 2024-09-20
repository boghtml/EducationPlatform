# apps/lessons/urls.py

from django.urls import path
from .views import LessonsByModuleView, LessonDetailView

urlpatterns = [
    path('get_lessons/<int:module_id>/', LessonsByModuleView.as_view(), name='lessons_by_module'),
    path('<int:pk>/', LessonDetailView.as_view(), name='lesson_detail'),  # Новий маршрут для конкретного заняття
]
