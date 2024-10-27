# apps/courses/serializers.py
from rest_framework import serializers
from .models import Course
from apps.progress_tracking.models import LessonProgress
from apps.lessons.models import Lesson

class CourseSerializer(serializers.ModelSerializer):
    completed_lessons = serializers.SerializerMethodField()
    total_lessons = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = ['id', 'title', 'description', 'teacher', 'status', 'price', 'image_url', 'intro_video_url', 'start_date', 'end_date', 'duration', 'batch_number', 'created_at', 'updated_at', 'completed_lessons', 'total_lessons']

    def get_completed_lessons(self, obj):
        request = self.context.get('request', None)
        user = request.user if request else None

        if user and user.is_authenticated and user.role == 'student':
            return LessonProgress.objects.filter(
                student=user,
                lesson__module__course=obj
            ).count()
        return 0

    def get_total_lessons(self, obj):
        return Lesson.objects.filter(
            module__course=obj
        ).count()