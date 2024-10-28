from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .models import Material, MaterialFile
from .serializers import MaterialSerializer, MaterialFileSerializer
from django.shortcuts import get_object_or_404
from apps.courses.models import Course
from django.conf import settings
import boto3
from urllib.parse import urlparse, unquote

s3_client = boto3.client(
    's3',
    aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
    aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY
)

class MaterialCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user

        if user.role != 'teacher':
            return Response({'error': 'Only teachers can create materials.'}, status=status.HTTP_403_FORBIDDEN)

        title = request.data.get('title')
        description = request.data.get('description')
        course_id = request.data.get('course_id')
        files = request.FILES.getlist('files')

        if not all([title, course_id]):
            return Response({'error': 'Title and Course ID are required.'}, status=status.HTTP_400_BAD_REQUEST)

        course = get_object_or_404(Course, id=course_id)

        if course.teacher != user:
            return Response({'error': 'You are not the teacher of this course.'}, status=status.HTTP_403_FORBIDDEN)

        material = Material.objects.create(
            course=course,
            title=title,
            description=description,
        )

        for file in files:
            s3_file_path = f"Materials/Material_{material.id}/{file.name}"
            s3_client.upload_fileobj(file, settings.AWS_STORAGE_BUCKET_NAME, s3_file_path)

            encoded_file_path = s3_file_path.replace(' ', '+')

            file_url = f"https://{settings.AWS_STORAGE_BUCKET_NAME}.s3.amazonaws.com/{encoded_file_path}"

            MaterialFile.objects.create(
                material=material,
                file_url=file_url,
                file_type=file.content_type,
                file_size=file.size,
            )

        serializer = MaterialSerializer(material)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
