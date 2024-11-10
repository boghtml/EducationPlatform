# apps/analytics/urls.py
from django.urls import path, include

from .views import (
    AdminAnalyticsView, 
    CourseAnalyticsView,
    AnalyticsDataView,
)

urlpatterns = [

    path('dashboard/', AdminAnalyticsView.as_view(), name='analytics-dashboard'),
    path('courses/<int:course_id>/', CourseAnalyticsView.as_view(), name='course-analytics'),
    
    path('charts/', AnalyticsDataView.as_view(), name='analytics-charts'),

]
