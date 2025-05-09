# apps/courses/serializers.py
from rest_framework import serializers
from .models import Course
from apps.progress_tracking.models import LessonProgress
from apps.lessons.models import Lesson
from apps.categories.models import CourseCategoryRelation, CourseCategory
from apps.categories.serializers import CourseCategorySerializer
from apps.users.models import CustomUser
from apps.enrollments.models import Enrollment 

class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = CustomUser
        fields = ['id', 'first_name', 'last_name', 'full_name', 'email', 'profile_image_url']

    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip()

class CourseSerializer(serializers.ModelSerializer):
    completed_lessons = serializers.SerializerMethodField()
    total_lessons = serializers.SerializerMethodField()
    categories = serializers.SerializerMethodField()
    category_ids = serializers.ListField(write_only=True, required=False)
    teacher = UserSerializer(read_only=True)
    students_count = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = [
            'id', 'title', 'description', 'teacher', 'status', 'price', 'image_url',
            'intro_video_url', 'start_date', 'end_date', 'duration', 'batch_number',
            'created_at', 'updated_at', 'completed_lessons', 'total_lessons', 'categories',
            'category_ids', 'students_count'
        ]

    def get_categories(self, obj):
        relations = CourseCategoryRelation.objects.filter(course=obj).select_related('category')
        categories = [relation.category for relation in relations]
        return CourseCategorySerializer(categories, many=True).data

    def create(self, validated_data):
        
        teacher = validated_data.get('teacher')
        if not teacher:
            request = self.context.get('request')
            if request and hasattr(request, 'user') and request.user.is_authenticated:
                validated_data['teacher'] = request.user
            else:
                raise serializers.ValidationError({"teacher": "Teacher is required."})
        
        category_ids = validated_data.pop('category_ids', [])
        course = Course.objects.create(**validated_data)
        
        for category_id in category_ids:
            try:
                category = CourseCategory.objects.get(id=category_id)
                CourseCategoryRelation.objects.create(course=course, category=category)
            except CourseCategory.DoesNotExist:
                pass  
                
        return course

    def update(self, instance, validated_data):
        category_ids = validated_data.pop('category_ids', None)
        if category_ids is not None:
            CourseCategoryRelation.objects.filter(course=instance).delete()
            for category_id in category_ids:
                category = CourseCategory.objects.get(id=category_id)
                CourseCategoryRelation.objects.create(course=instance, category=category)
        return super().update(instance, validated_data)

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

    def get_students_count(self, obj):
        return Enrollment.objects.filter(course=obj).count()