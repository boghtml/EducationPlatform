# apps/enrollments/serializers.py

from rest_framework import serializers
from .models import Enrollment

class EnrollmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Enrollment
        fields = ['id', 'course', 'student', 'enrollment_date']
