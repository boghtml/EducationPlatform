from django.urls import path
from .views import MarkLessonAsCompletedView, CourseProgressView

urlpatterns = [
    path('lessons/<int:lesson_id>/complete/', MarkLessonAsCompletedView.as_view(), name='mark_lesson_completed'),
    path('courses/<int:course_id>/progress/', CourseProgressView.as_view(), name='course_progress'),

]
