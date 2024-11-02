from rest_framework import serializers
from .models import Lesson, LessonFile, LessonLink
from apps.modules.models import Module
from django.core.validators import URLValidator
from django.core.exceptions import ValidationError
from .models import Lesson
from apps.progress_tracking.models import LessonProgress
import urllib.parse


class LessonSerializer(serializers.ModelSerializer):
    module_id = serializers.IntegerField(write_only=True, required=False)
    is_completed = serializers.SerializerMethodField()

    def update(self, instance, validated_data):
        
        validated_data.pop('module_id', None)
        return super().update(instance, validated_data)
    
    class Meta:
        model = Lesson
        fields = ['id', 'module_id', 'title', 'content', 'duration', 'created_at', 'updated_at', 'is_completed']

    def create(self, validated_data):
        module_id = validated_data.pop('module_id')
        module = Module.objects.get(id=module_id)
        lesson = Lesson.objects.create(module=module, **validated_data)
        return lesson
    
    def get_is_completed(self, obj):
        request = self.context.get('request', None)
        user = request.user if request else None
        if user and user.is_authenticated and user.role == 'student':
            return LessonProgress.objects.filter(student=user, lesson=obj).exists()
        return False
    

class LessonFileSerializer(serializers.ModelSerializer):
    file_name = serializers.SerializerMethodField() 

    class Meta:
        model = LessonFile
        fields = ['id', 'lesson_id', 'file_url', 'file_type', 'file_size', 'is_temp', 'created_at', 'file_name']

    def get_file_name(self, obj):
        
        parsed_url = urllib.parse.urlparse(obj.file_url)
        return urllib.parse.unquote(parsed_url.path.split('/')[-1])

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