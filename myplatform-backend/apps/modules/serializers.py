# apps/modules/serializers.py
from rest_framework import serializers
from .models import Module
from apps.courses.models import Course  # Імпортуємо модель курсу

class ModuleSerializer(serializers.ModelSerializer):
    course_id = serializers.IntegerField(write_only=True,  required=False)

    class Meta:
        model = Module
        fields = ['id', 'course_id', 'title', 'description', 'created_at', 'updated_at']

    def create(self, validated_data):
        course_id = validated_data.pop('course_id')
        course = Course.objects.get(id=course_id)  # Отримуємо курс за його ID
        module = Module.objects.create(course=course, **validated_data)
        return module
