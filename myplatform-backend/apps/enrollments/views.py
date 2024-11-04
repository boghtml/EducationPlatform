# apps/enrollments/views.py

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Enrollment
from apps.courses.models import Course
from apps.users.models import CustomUser
from .serializers import EnrollmentSerializer
from apps.courses.serializers import CourseSerializer
from django.views.decorators.csrf import csrf_exempt
from .mixins import CsrfExemptSessionAuthentication
from rest_framework.permissions import AllowAny
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

class EnrollCourseView(APIView):

    authentication_classes = (CsrfExemptSessionAuthentication,)
    permission_classes = [AllowAny]
     
    @swagger_auto_schema(
        request_body=EnrollmentSerializer,
        responses={
            201: EnrollmentSerializer,
            400: 'Bad Request',
            404: 'Not Found',
        }
    )

    def post(self, request, *args, **kwargs):
        course_id = request.data.get('course_id')
        student_id = request.data.get('student_id')

        if not course_id or not student_id:
            return Response({'error': 'Course ID and Student ID are required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            course = Course.objects.get(id=course_id, status='free')
        except Course.DoesNotExist:
            return Response({'error': 'Course not found or not free'}, status=status.HTTP_404_NOT_FOUND)

        if course.status == 'premium':
            return Response({'error': 'Cannot enroll in premium course directly. Please purchase the course.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            student = CustomUser.objects.get(id=student_id, role='student')
        except CustomUser.DoesNotExist:
            return Response({'error': 'Student not found'}, status=status.HTTP_404_NOT_FOUND)

        enrollment, created = Enrollment.objects.get_or_create(course=course, student=student)

        if not created:
            return Response({'error': 'Student is already enrolled in this course'}, status=status.HTTP_400_BAD_REQUEST)

        serializer = EnrollmentSerializer(enrollment)
        return Response({'message': 'Enrollment successful', 'enrollment': serializer.data}, status=status.HTTP_201_CREATED)


from rest_framework.permissions import IsAuthenticated

class UserEnrolledCoursesView(APIView):
    authentication_classes = (CsrfExemptSessionAuthentication,)
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        manual_parameters=[
            openapi.Parameter('user_id', openapi.IN_PATH, description="ID of the user", type=openapi.TYPE_INTEGER),
        ],
        responses={
            200: CourseSerializer(many=True),
            400: 'Bad Request',
            404: 'Not Found',
        }
    )
    def get(self, request, user_id, *args, **kwargs):
        if request.user.id != user_id:
            return Response({'error': 'You are not authorized to view these courses'}, status=status.HTTP_403_FORBIDDEN)

        try:
            student = CustomUser.objects.get(id=user_id, role='student')
        except CustomUser.DoesNotExist:
            return Response({'error': 'Student not found'}, status=status.HTTP_404_NOT_FOUND)

        enrollments = Enrollment.objects.filter(student=student)
        courses = [enrollment.course for enrollment in enrollments]

        serializer = CourseSerializer(courses, many=True, context={'request': request})
        return Response({'courses': serializer.data}, status=status.HTTP_200_OK)
