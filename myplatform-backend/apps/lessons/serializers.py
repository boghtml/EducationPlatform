from rest_framework import serializers
from .models import Lesson, LessonFile, LessonLink
from apps.modules.models import Module
from django.core.validators import URLValidator
from django.core.exceptions import ValidationError

class LessonSerializer(serializers.ModelSerializer):
    module_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Lesson
        fields = ['id', 'module_id', 'title', 'content', 'duration', 'created_at', 'updated_at']

    def create(self, validated_data):
        module_id = validated_data.pop('module_id')
        module = Module.objects.get(id=module_id)
        lesson = Lesson.objects.create(module=module, **validated_data)
        return lesson

class LessonFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = LessonFile
        fields = ['id', 'lesson_id', 'file_url', 'file_type', 'file_size', 'is_temp', 'created_at']

class LessonLinkSerializer(serializers.ModelSerializer):
    class Meta:
        model = LessonLink
        fields = ['id', 'lesson_id', 'link_url', 'description', 'created_at']
        extra_kwargs = {'description': {'required': False}}

    def validate_link_url(self, value):
        validator = URLValidator()
        try:
            validator(value)
        except ValidationError:
            raise serializers.ValidationError("Invalid URL format")
        return value

class MultipleLessonLinksSerializer(serializers.Serializer):
    links = serializers.ListField(
        child=serializers.URLField(),
        allow_empty=False,
        min_length=1
    )