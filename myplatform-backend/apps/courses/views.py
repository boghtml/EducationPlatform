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

    def perform_create(self, serializer):
        return serializer.save()

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        course = self.perform_create(serializer)
        # Create folders in S3
        try:
            create_course_folders_in_s3(course.id)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response({'message': 'Course created successfully', 'course': serializer.data}, status=status.HTTP_201_CREATED)

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
            # Якщо є попереднє відео, видаляємо його з S3
            if course.intro_video_url:
                old_video_key = course.intro_video_url.split(f"{settings.AWS_STORAGE_BUCKET_NAME}.s3.amazonaws.com/")[-1]
                s3_client.delete_object(Bucket=settings.AWS_STORAGE_BUCKET_NAME, Key=old_video_key)

             # Завантажуємо нове відео
            s3_file_path = f"Courses/Course_{course.id}/course_files/{file.name}"
            s3_client.upload_fileobj(file, settings.AWS_STORAGE_BUCKET_NAME, s3_file_path)

            # Оновлення URL відео у базі даних
            course.intro_video_url = f"https://{settings.AWS_STORAGE_BUCKET_NAME}.s3.amazonaws.com/{s3_file_path}"
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
                old_image_key = course.image_url.split(f"{settings.AWS_STORAGE_BUCKET_NAME}.s3.amazonaws.com/")[-1]
                s3_client.delete_object(Bucket=settings.AWS_STORAGE_BUCKET_NAME, Key=old_image_key)

            # Завантаження нового зображення у S3
            s3_file_path = f"Courses/Course_{course.id}/course_files/{file.name}"
            s3_client.upload_fileobj(file, settings.AWS_STORAGE_BUCKET_NAME, s3_file_path)

            # Оновлення URL зображення у базі даних
            course.image_url = f"https://{settings.AWS_STORAGE_BUCKET_NAME}.s3.amazonaws.com/{s3_file_path}"
            course.save()

            return Response({'message': 'Image uploaded successfully', 'course': CourseSerializer(course).data}, status=status.HTTP_200_OK)
        except ClientError as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
