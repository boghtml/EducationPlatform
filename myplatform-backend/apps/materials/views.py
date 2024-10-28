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
from apps.assignments.mixins import CsrfExemptSessionAuthentication
from rest_framework.permissions import IsAuthenticated

from rest_framework.generics import ListAPIView
from apps.enrollments.models import Enrollment
from rest_framework.generics import RetrieveAPIView

s3_client = boto3.client(
    's3',
    aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
    aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY
)

class MaterialCreateView(APIView):
    authentication_classes = [CsrfExemptSessionAuthentication]
    permission_classes = [IsAuthenticated]

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
            s3_file_path = f"materials/material_{material.id}/{file.name}"
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

class MaterialUpdateView(APIView):
    authentication_classes = [CsrfExemptSessionAuthentication]
    permission_classes = [IsAuthenticated]

    def put(self, request, material_id):
        user = request.user

        # Check if material exists and belongs to the teacher
        material = get_object_or_404(Material, id=material_id)

        if user.role != 'teacher' or material.course.teacher != user:
            return Response({'error': 'You are not authorized to edit this material.'}, status=status.HTTP_403_FORBIDDEN)

        title = request.data.get('title', material.title)
        description = request.data.get('description', material.description)

        material.title = title
        material.description = description
        material.save()

        serializer = MaterialSerializer(material)
        return Response(serializer.data, status=status.HTTP_200_OK)


class MaterialDeleteView(APIView):
    authentication_classes = [CsrfExemptSessionAuthentication]
    permission_classes = [IsAuthenticated]


    def delete(self, request, material_id):
        user = request.user

        material = get_object_or_404(Material, id=material_id)

        if user.role != 'teacher' or material.course.teacher != user:
            return Response({'error': 'You are not authorized to delete this material.'}, status=status.HTTP_403_FORBIDDEN)

        # Delete files from S3
        for file in material.files.all():
            self.delete_file_from_s3(file.file_url)
            file.delete()

        material.delete()
        return Response({'message': 'Material deleted successfully.'}, status=status.HTTP_200_OK)

    def delete_file_from_s3(self, file_url):
        parsed_url = urlparse(file_url)
        s3_file_path = unquote(parsed_url.path.lstrip('/'))

        try:
            s3_client.delete_object(Bucket=settings.AWS_STORAGE_BUCKET_NAME, Key=s3_file_path)
        except Exception as e:
            print(f"Error deleting file from S3: {e}")

class MaterialAddFilesView(APIView):
    authentication_classes = [CsrfExemptSessionAuthentication]
    permission_classes = [IsAuthenticated]


    def post(self, request, material_id):
        user = request.user

        material = get_object_or_404(Material, id=material_id)

        if user.role != 'teacher' or material.course.teacher != user:
            return Response({'error': 'You are not authorized to add files to this material.'}, status=status.HTTP_403_FORBIDDEN)

        files = request.FILES.getlist('files')

        if not files:
            return Response({'error': 'No files provided.'}, status=status.HTTP_400_BAD_REQUEST)

        for file in files:
            s3_file_path = f"materials/material_{material.id}/{file.name}"
            s3_client.upload_fileobj(file, settings.AWS_STORAGE_BUCKET_NAME, s3_file_path)

            # Encode the file path
            encoded_file_path = s3_file_path.replace(' ', '+')

            file_url = f"https://{settings.AWS_STORAGE_BUCKET_NAME}.s3.amazonaws.com/{encoded_file_path}"

            # Create MaterialFile record
            MaterialFile.objects.create(
                material=material,
                file_url=file_url,
                file_type=file.content_type,
                file_size=file.size,
            )

        serializer = MaterialSerializer(material)
        return Response(serializer.data, status=status.HTTP_200_OK)

class MaterialFileDeleteView(APIView):
    authentication_classes = [CsrfExemptSessionAuthentication]
    permission_classes = [IsAuthenticated]

    def delete(self, request, file_id):
        user = request.user

        material_file = get_object_or_404(MaterialFile, id=file_id)
        material = material_file.material

        if user.role != 'teacher' or material.course.teacher != user:
            return Response({'error': 'You are not authorized to delete this file.'}, status=status.HTTP_403_FORBIDDEN)

        self.delete_file_from_s3(material_file.file_url)

        material_file.delete()
        return Response({'message': 'File deleted successfully.'}, status=status.HTTP_200_OK)

    def delete_file_from_s3(self, file_url):
        parsed_url = urlparse(file_url)
        s3_file_path = unquote(parsed_url.path.lstrip('/'))

        try:
            s3_client.delete_object(Bucket=settings.AWS_STORAGE_BUCKET_NAME, Key=s3_file_path)
        except Exception as e:
            print(f"Error deleting file from S3: {e}")

class MaterialListView(ListAPIView):
    serializer_class = MaterialSerializer
    authentication_classes = [CsrfExemptSessionAuthentication]
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if user.role == 'teacher':
            # Teachers see materials for their courses
            return Material.objects.filter(course__teacher=user)
        elif user.role == 'student':
            # Students see materials for courses they're enrolled in
            enrolled_courses = Enrollment.objects.filter(student=user).values_list('course', flat=True)
            return Material.objects.filter(course__in=enrolled_courses)
        else:
            return Material.objects.none()
        

class MaterialDetailView(RetrieveAPIView):
    queryset = Material.objects.all()
    serializer_class = MaterialSerializer
    authentication_classes = [CsrfExemptSessionAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        material = self.get_object()

        if user.role == 'teacher' and material.course.teacher == user:
            return super().get(request, *args, **kwargs)
        elif user.role == 'student':
            # Check if student is enrolled in the course
            is_enrolled = Enrollment.objects.filter(course=material.course, student=user).exists()
            if is_enrolled:
                return super().get(request, *args, **kwargs)
            else:
                return Response({'error': 'You are not enrolled in this course.'}, status=status.HTTP_403_FORBIDDEN)
        else:
            return Response({'error': 'You are not authorized to view this material.'}, status=status.HTTP_403_FORBIDDEN)