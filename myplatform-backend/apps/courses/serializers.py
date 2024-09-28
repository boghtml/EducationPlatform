# apps/courses/serializers.py

from rest_framework import serializers
from .models import Course

class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = ['id', 'title', 'description', 'teacher', 'status', 'price', 'image_url', 'intro_video_url', 'start_date', 'end_date', 'duration', 'batch_number', 'created_at', 'updated_at']
