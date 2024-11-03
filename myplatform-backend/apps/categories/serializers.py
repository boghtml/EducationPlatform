from rest_framework import serializers
from .models import CourseCategory, CourseCategoryRelation

class CourseCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = CourseCategory
        fields = ['id', 'name', 'description']

class CourseCategoryRelationSerializer(serializers.ModelSerializer):
    category = CourseCategorySerializer(read_only=True)

    class Meta:
        model = CourseCategoryRelation
        fields = ['course', 'category']
