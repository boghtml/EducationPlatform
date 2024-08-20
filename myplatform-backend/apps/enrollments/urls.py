# apps/enrollments/urls.py

from django.urls import path
from .views import EnrollCourseView
from .views import EnrollCourseView, UserEnrolledCoursesView

urlpatterns = [
    path('enroll/', EnrollCourseView.as_view(), name='enroll_course'),
    path('user-courses/<int:user_id>/', UserEnrolledCoursesView.as_view(), name='user_enrolled_courses'),

]
