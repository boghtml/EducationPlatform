# apps/courses/views.py
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework import status
from .models import Course
from .serializers import CourseSerializer
from .mixins import CsrfExemptSessionAuthentication
from rest_framework.permissions import AllowAny

import boto3
from django.conf import settings
from botocore.exceptions import ClientError

from rest_framework.views import APIView
from rest_framework.decorators import action

from apps.categories.models import CourseCategoryRelation, CourseCategory
from apps.enrollments.models import Enrollment
from apps.users.models import CustomUser
from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAuthenticated
from apps.courses.models import Course
from apps.assignments.models import Assignment
from apps.questions.models import Question
from .serializers import UserSerializer


s3_client = boto3.client(
    's3',
    aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
    aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
    region_name=settings.AWS_S3_REGION_NAME
)

def create_course_folders_in_s3(course_id):
    try:
        base_path = f'Courses/Course_{course_id}/'
        s3_client.put_object(Bucket=settings.AWS_STORAGE_BUCKET_NAME, Key=f'{base_path}assignments/')
        s3_client.put_object(Bucket=settings.AWS_STORAGE_BUCKET_NAME, Key=f'{base_path}course_files/')
        s3_client.put_object(Bucket=settings.AWS_STORAGE_BUCKET_NAME, Key=f'{base_path}lessons/')
        s3_client.put_object(Bucket=settings.AWS_STORAGE_BUCKET_NAME, Key=f'{base_path}submissions/')
    except ClientError as e:
        raise Exception(f"Failed to create folders in S3: {e}")

    
class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    
    authentication_classes = (CsrfExemptSessionAuthentication,)
    permission_classes = [AllowAny]

    @action(detail=True, methods=['post'], url_path='add-categories')
    def add_categories(self, request, pk=None):
        course = self.get_object()
        category_ids = request.data.get('category_ids', [])
        for category_id in category_ids:
            category = CourseCategory.objects.get(id=category_id)
            CourseCategoryRelation.objects.get_or_create(course=course, category=category)
        return Response({'message': 'Categories added successfully'}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='remove-categories')
    def remove_categories(self, request, pk=None):
        course = self.get_object()
        category_ids = request.data.get('category_ids', [])
        CourseCategoryRelation.objects.filter(course=course, category_id__in=category_ids).delete()
        return Response({'message': 'Categories removed successfully'}, status=status.HTTP_200_OK)
    
    def perform_create(self, serializer):
        return serializer.save()

    def create(self, request, *args, **kwargs):

        print("Request data:", request.data)
        print("User ID:", request.user.id)
        print("User role:", request.user.role)

        if request.user.role != 'teacher' and request.user.role != 'admin':
            return Response({"error": "Only teachers or admin can create courses"}, 
                        status=status.HTTP_403_FORBIDDEN)
    
        data = request.data.copy()
        data['teacher'] = request.user.id 
        
        serializer = self.get_serializer(data=data)  
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        course = serializer.save(teacher_id=request.user.id)
        
        try:
            create_course_folders_in_s3(course.id)
        except Exception as e:
            course.delete()
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response({'message': 'Course created successfully', 'course': serializer.data}, 
                    status=status.HTTP_201_CREATED)

    def perform_destroy(self, instance):
        instance.delete()

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        try:
            self.delete_course_files_from_s3(instance.id)
        except ClientError as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        self.perform_destroy(instance)
        return Response({'message': 'Course deleted successfully'}, status=status.HTTP_200_OK)

    def delete_course_files_from_s3(self, course_id):

        course_folder = f"Courses/Course_{course_id}/"

        response = s3_client.list_objects_v2(Bucket=settings.AWS_STORAGE_BUCKET_NAME, Prefix=course_folder)

        if 'Contents' in response:
            objects_to_delete = [{'Key': obj['Key']} for obj in response['Contents']]
            s3_client.delete_objects(Bucket=settings.AWS_STORAGE_BUCKET_NAME, Delete={'Objects': objects_to_delete})

    def perform_update(self, serializer):
        serializer.save()

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        return Response({'message': 'Course updated successfully', 'course': serializer.data}, status=status.HTTP_200_OK)

import urllib.parse


class CourseUpdateIntroVideoView(APIView):
    authentication_classes = (CsrfExemptSessionAuthentication,)
    permission_classes = [AllowAny]
    
    def post(self, request, pk=None):
        try:
            course = Course.objects.get(pk=pk)
        except Course.DoesNotExist:
            return Response({"error": "Course not found"}, status=status.HTTP_404_NOT_FOUND)

        file = request.FILES.get('intro_video')
        if not file:
            return Response({"error": "No file provided"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            
            if course.intro_video_url:
                parsed_url = urllib.parse.urlparse(course.intro_video_url)
                encoded_old_video_key = parsed_url.path.lstrip('/')
                old_video_key = urllib.parse.unquote(encoded_old_video_key)
                s3_client.delete_object(Bucket=settings.AWS_STORAGE_BUCKET_NAME, Key=old_video_key)


            s3_file_path = f"Courses/Course_{course.id}/course_files/{file.name}"
            s3_client.upload_fileobj(file, settings.AWS_STORAGE_BUCKET_NAME, s3_file_path)

            encoded_file_path = urllib.parse.quote(s3_file_path, safe='/')

            file_url = f"https://{settings.AWS_STORAGE_BUCKET_NAME}.s3.amazonaws.com/{encoded_file_path}"

            course.intro_video_url = file_url
            course.save()

            return Response({'message': 'Intro video uploaded successfully', 'course': CourseSerializer(course).data}, status=status.HTTP_200_OK)
        except ClientError as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class CourseUpdateImageView(APIView):
    authentication_classes = (CsrfExemptSessionAuthentication,)
    permission_classes = [AllowAny]

    def post(self, request, pk=None):
        try:
            course = Course.objects.get(pk=pk)
        except Course.DoesNotExist:
            return Response({"error": "Course not found"}, status=status.HTTP_404_NOT_FOUND)

        file = request.FILES.get('image')
        if not file:
            return Response({"error": "No file provided"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            if course.image_url:
                parsed_url = urllib.parse.urlparse(course.image_url)
                encoded_old_image_key = parsed_url.path.lstrip('/')
                old_image_key = urllib.parse.unquote(encoded_old_image_key)
                s3_client.delete_object(Bucket=settings.AWS_STORAGE_BUCKET_NAME, Key=old_image_key)

            s3_file_path = f"Courses/Course_{course.id}/course_files/{file.name}"
            s3_client.upload_fileobj(file, settings.AWS_STORAGE_BUCKET_NAME, s3_file_path)

            encoded_file_path = urllib.parse.quote(s3_file_path, safe='/')

            file_url = f"https://{settings.AWS_STORAGE_BUCKET_NAME}.s3.amazonaws.com/{encoded_file_path}"

            course.image_url = file_url
            course.save()

            return Response({'message': 'Image uploaded successfully', 'course': CourseSerializer(course).data}, status=status.HTTP_200_OK)
        except ClientError as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        

class CourseParticipantsView(APIView):
    authentication_classes = [CsrfExemptSessionAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, course_id):
        course = get_object_or_404(Course, id=course_id)

        students = CustomUser.objects.filter(
            id__in=Enrollment.objects.filter(course=course).values_list('student_id', flat=True)
        )

        teachers_ids = set()
        teachers_ids.add(course.teacher.id)
        teachers_ids.update(Assignment.objects.filter(course=course).values_list('teacher_id', flat=True))
        teachers_ids.update(Question.objects.filter(course=course).values_list('teacher_id', flat=True))

        teachers = CustomUser.objects.filter(id__in=teachers_ids)

        admins = CustomUser.objects.filter(role='admin')

        students_data = UserSerializer(students, many=True).data
        teachers_data = UserSerializer(teachers, many=True).data
        admins_data = UserSerializer(admins, many=True).data

        return Response({
            'students': students_data,
            'teachers': teachers_data,
            'admins': admins_data  
        }, status=status.HTTP_200_OK)


class TeacherCoursesView(APIView):
    authentication_classes = [CsrfExemptSessionAuthentication]
    permission_classes = [IsAuthenticated]
    
    def get(self, request, teacher_id):
        try:
            if request.user.id != teacher_id and request.user.role != 'admin':
                return Response({"error": "You don't have permission to view these courses"}, 
                               status=status.HTTP_403_FORBIDDEN)
            
            courses = Course.objects.filter(teacher_id=teacher_id)
            
            for course in courses:
                course.students_count = course.enrollment_set.count()
            
            serializer = CourseSerializer(courses, many=True, context={'request': request})
            return Response(serializer.data, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)