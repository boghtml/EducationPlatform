# apps/analytics/urls.py
from django.urls import path, include

from .views import (
    AdminAnalyticsView, 
    CourseAnalyticsView,
    AnalyticsDataView,
    StudentGradeReportView,
)

urlpatterns = [

    path('dashboard/', AdminAnalyticsView.as_view(), name='analytics-dashboard'),
    path('courses/<int:course_id>/', CourseAnalyticsView.as_view(), name='course-analytics'),
    
    path('charts/', AnalyticsDataView.as_view(), name='analytics-charts'),
    path('student/grades/<int:course_id>/', StudentGradeReportView.as_view(), name='student-grade-report'),

]
