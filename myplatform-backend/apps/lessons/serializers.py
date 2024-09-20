from rest_framework import serializers
from .models import Lesson

class LessonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lesson
        fields = ['id', 'module_id', 'title', 'content', 'file_url', 'file_type', 'file_size', 'created_at', 'updated_at']
