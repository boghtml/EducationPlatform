

from rest_framework import serializers
from .models import Lesson
from apps.progress_tracking.models import LessonProgress, ModuleProgress

class LessonSerializer(serializers.ModelSerializer):
    is_completed = serializers.SerializerMethodField()

    class Meta:
        model = Lesson
        fields = ['id', 'title', 'content', 'duration', 'is_completed']

    def get_is_completed(self, obj):
        user = self.context.get('request').user
        if user.is_authenticated and user.role == 'student':
            return LessonProgress.objects.filter(student=user, lesson=obj).exists()
        return False

class ModuleProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model = ModuleProgress
        fields = ['id', 'student', 'module', 'completed_at']
        read_only_fields = ['completed_at']
