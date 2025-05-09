from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .models import LessonProgress, ModuleProgress
from apps.lessons.models import Lesson
from apps.modules.models import Module 
from apps.enrollments.models import Enrollment

from rest_framework import generics
from .models import Lesson
from apps.assignments.mixins import CsrfExemptSessionAuthentication
from rest_framework.permissions import IsAuthenticated
# apps/progress_tracking/views.py

class MarkLessonAsCompletedView(APIView):
    authentication_classes = [CsrfExemptSessionAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request, lesson_id):
        user = request.user

        if user.role != 'student':
            return Response({"error": "Only students can mark lessons as completed."}, status=status.HTTP_403_FORBIDDEN)

        try:
            lesson = Lesson.objects.select_related('module__course').get(id=lesson_id)
        except Lesson.DoesNotExist:
            return Response({"error": "Lesson not found"}, status=status.HTTP_404_NOT_FOUND)

        if not Enrollment.objects.filter(course=lesson.module.course, student=user).exists():
            return Response({"error": "You are not enrolled in this course"}, status=status.HTTP_403_FORBIDDEN)

        lesson_progress, created = LessonProgress.objects.get_or_create(student=user, lesson=lesson)

        if created:
            
            total_lessons = lesson.module.lessons.count()
            completed_lessons = LessonProgress.objects.filter(student=user, lesson__module=lesson.module).count()

            if total_lessons == completed_lessons:

                ModuleProgress.objects.get_or_create(student=user, module=lesson.module)

            return Response({"message": "Lesson marked as completed"}, status=status.HTTP_200_OK)
        else:
            return Response({"message": "Lesson was already marked as completed"}, status=status.HTTP_200_OK)


class CourseProgressView(APIView):
    authentication_classes = [CsrfExemptSessionAuthentication]
    permission_classes = [IsAuthenticated]
    
    def get(self, request, course_id):
        user = request.user

        if not Enrollment.objects.filter(course_id=course_id, student=user).exists():
            return Response({"error": "You are not enrolled in this course"}, status=status.HTTP_403_FORBIDDEN)

        total_modules = Module.objects.filter(course_id=course_id).count()

        completed_modules = ModuleProgress.objects.filter(student=user, module__course_id=course_id).count()

        total_lessons = Lesson.objects.filter(module__course_id=course_id).count()

        completed_lessons = LessonProgress.objects.filter(student=user, lesson__module__course_id=course_id).count()

        data = {
            "total_modules": total_modules,
            "completed_modules": completed_modules,
            "total_lessons": total_lessons,
            "completed_lessons": completed_lessons,
        }

        return Response(data, status=status.HTTP_200_OK)
