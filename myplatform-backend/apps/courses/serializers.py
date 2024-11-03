# apps/courses/serializers.py
from rest_framework import serializers
from .models import Course
from apps.progress_tracking.models import LessonProgress
from apps.lessons.models import Lesson
from apps.categories.models import CourseCategoryRelation, CourseCategory
from apps.categories.serializers import CourseCategorySerializer

class CourseSerializer(serializers.ModelSerializer):
    completed_lessons = serializers.SerializerMethodField()
    total_lessons = serializers.SerializerMethodField()

    categories = serializers.SerializerMethodField()
    category_ids = serializers.ListField(write_only=True, required=False)


    class Meta:
        model = Course
        fields = ['id', 'title', 'description', 'teacher', 'status', 'price', 'image_url', 
                  'intro_video_url', 'start_date', 'end_date', 'duration', 'batch_number', 
                  'created_at', 'updated_at', 'completed_lessons', 'total_lessons', 'categories', 'category_ids']

    def get_categories(self, obj):
        relations = CourseCategoryRelation.objects.filter(course=obj).select_related('category')
        categories = [relation.category for relation in relations]
        return CourseCategorySerializer(categories, many=True).data

    def create(self, validated_data):
        category_ids = validated_data.pop('category_ids', [])
        course = Course.objects.create(**validated_data)

        for category_id in category_ids:
            category = CourseCategory.objects.get(id=category_id)
            CourseCategoryRelation.objects.create(course=course, category=category)
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