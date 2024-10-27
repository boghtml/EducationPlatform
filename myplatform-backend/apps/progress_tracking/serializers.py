

from rest_framework import serializers
from .models import Lesson
from apps.progress_tracking.models import LessonProgress, ModuleProgress


class ModuleProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model = ModuleProgress
        fields = ['id', 'student', 'module', 'completed_at']
        read_only_fields = ['completed_at']
