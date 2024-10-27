import boto3
from botocore.exceptions import ClientError
from django.conf import settings
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Lesson, LessonFile

from rest_framework import generics
from .models import Lesson, LessonFile, LessonLink
from .serializers import LessonSerializer, LessonFileSerializer, LessonLinkSerializer, MultipleLessonLinksSerializer
from rest_framework.generics import RetrieveAPIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from .mixins import CsrfExemptSessionAuthentication
from rest_framework.permissions import IsAuthenticated

from urllib.parse import urlparse, unquote

s3_client = boto3.client(
    's3',
    aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
    aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
    region_name=settings.AWS_S3_REGION_NAME
)

class AddLessonLinksView(APIView):
    def post(self, request, lesson_id):
        try:
            lesson = Lesson.objects.get(id=lesson_id)
        except Lesson.DoesNotExist:
            return Response({"error": "Lesson not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = MultipleLessonLinksSerializer(data=request.data)
        if serializer.is_valid():
            links = serializer.validated_data['links']
            created_links = []
            for link_url in links:
                lesson_link = LessonLink.objects.create(
                    lesson=lesson,
                    link_url=link_url,
                    description=""  # Явно вказуємо порожній рядок
                )
                created_links.append(LessonLinkSerializer(lesson_link).data)
            return Response(created_links, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

class ConfirmTempFilesView(APIView):
    def post(self, request, lesson_id):
        try:
            lesson = Lesson.objects.get(id=lesson_id)
        except Lesson.DoesNotExist:
            return Response({"error": "Lesson not found"}, status=status.HTTP_404_NOT_FOUND)

        temp_files = LessonFile.objects.filter(lesson=lesson, is_temp=True)
        confirmed_count = temp_files.update(is_temp=False)

        return Response({
            "message": f"{confirmed_count} temporary files have been confirmed",
            "lesson_id": lesson_id
        }, status=status.HTTP_200_OK)
    
class DeleteTempFileView(APIView):
    def delete(self, request, file_id):
        try:
            file = LessonFile.objects.get(id=file_id, is_temp=True)
        except LessonFile.DoesNotExist:
            return Response({"error": "Temporary file not found"}, status=status.HTTP_404_NOT_FOUND)

        # Парсимо URL файлу
        parsed_url = urlparse(file.file_url)
        encoded_s3_file_path = parsed_url.path.lstrip('/')
        s3_file_path = unquote(encoded_s3_file_path)

        try:
            # Видаляємо файл з S3
            s3_client.delete_object(Bucket=settings.AWS_STORAGE_BUCKET_NAME, Key=s3_file_path)
            
            # Видаляємо запис з бази даних
            file.delete()

            return Response({"message": "Temporary file successfully deleted"}, status=status.HTTP_200_OK)
        except ClientError as e:
            return Response({"error": f"Error deleting file from S3: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            return Response({"error": f"Error deleting file: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
import urllib.parse

class UploadLessonFileView(APIView):
    def post(self, request, lesson_id):
        try:
            lesson = Lesson.objects.select_related('module__course').get(id=lesson_id)
            course_id = lesson.module.course.id
        except Lesson.DoesNotExist:
            return Response({"error": "Lesson not found"}, status=status.HTTP_404_NOT_FOUND)

        file = request.FILES.get('file')
        if not file:
            return Response({"error": "No file provided"}, status=status.HTTP_400_BAD_REQUEST)

        file_type = file.name.split('.')[-1].lower()
        if file_type not in ['mp4', 'pdf', 'doc', 'docx']:
            return Response({"error": "Invalid file type"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            s3_file_path = f"Courses/Course_{course_id}/lessons/lesson_{lesson_id}/{file.name}"
            s3_client.upload_fileobj(file, settings.AWS_STORAGE_BUCKET_NAME, s3_file_path)
            
            # Кодуємо шлях файлу для URL
            encoded_file_path = urllib.parse.quote(s3_file_path, safe='/')

            file_url = f"https://{settings.AWS_STORAGE_BUCKET_NAME}.s3.amazonaws.com/{encoded_file_path}"
            
            lesson_file = LessonFile.objects.create(
                lesson=lesson,
                file_url=file_url,
                file_type=file_type,
                file_size=file.size,
                is_temp=True
            )

            serializer = LessonFileSerializer(lesson_file)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except ClientError as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class LessonCreateView(generics.CreateAPIView):
    queryset = Lesson.objects.all()
    serializer_class = LessonSerializer
    permission_classes = [AllowAny]  # Відкритий доступ для всіх
    authentication_classes = (CsrfExemptSessionAuthentication,)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def perform_create(self, serializer):
        serializer.save()


class LessonsByModuleView(generics.ListAPIView):
    serializer_class = LessonSerializer

    def get_queryset(self):
        module_id = self.kwargs['module_id']
        return Lesson.objects.filter(module_id=module_id)

class LessonDetailView(RetrieveAPIView):
    queryset = Lesson.objects.all()
    serializer_class = LessonSerializer
    authentication_classes = [CsrfExemptSessionAuthentication]
    permission_classes = [IsAuthenticated]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({"request": self.request})
        return context

class LessonFilesView(generics.ListAPIView):
    serializer_class = LessonFileSerializer

    def get_queryset(self):
        lesson_id = self.kwargs['lesson_id']
        return LessonFile.objects.filter(lesson_id=lesson_id)

class LessonLinksView(generics.ListAPIView):
    serializer_class = LessonLinkSerializer

    def get_queryset(self):
        lesson_id = self.kwargs['lesson_id']
        return LessonLink.objects.filter(lesson_id=lesson_id)

# Видалення уроку
class LessonDeleteView(generics.DestroyAPIView):
    queryset = Lesson.objects.all()
    serializer_class = LessonSerializer
    permission_classes = [AllowAny]  # Відкритий доступ для всіх
    authentication_classes = (CsrfExemptSessionAuthentication,)

    def delete(self, request, *args, **kwargs):
        try:
            lesson = self.get_object()
            lesson.delete()
            return Response({"message": "Lesson deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
        except Lesson.DoesNotExist:
            return Response({"error": "Lesson not found"}, status=status.HTTP_404_NOT_FOUND)

# Редагування уроку
class LessonUpdateView(generics.UpdateAPIView):
    queryset = Lesson.objects.all()
    serializer_class = LessonSerializer
    permission_classes = [AllowAny]  # Відкритий доступ для всіх
    authentication_classes = (CsrfExemptSessionAuthentication,)

class DeleteConfirmedFileView(APIView):
    def delete(self, request, file_id):
        try:
            file = LessonFile.objects.get(id=file_id, is_temp=False)
        except LessonFile.DoesNotExist:
            return Response({"error": "Confirmed file not found"}, status=status.HTTP_404_NOT_FOUND)

        parsed_url = urlparse(file.file_url)
        encoded_s3_file_path = parsed_url.path.lstrip('/')
        s3_file_path = unquote(encoded_s3_file_path)

        try:
            s3_client.delete_object(Bucket=settings.AWS_STORAGE_BUCKET_NAME, Key=s3_file_path)

            file.delete()

            return Response({"message": "Confirmed file successfully deleted"}, status=status.HTTP_200_OK)
        except ClientError as e:
            return Response({"error": f"Error deleting file from S3: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            return Response({"error": f"Error deleting file: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class LessonLinkUpdateView(generics.UpdateAPIView):
    queryset = LessonLink.objects.all()
    serializer_class = LessonLinkSerializer

class LessonLinkDeleteView(generics.DestroyAPIView):
    queryset = LessonLink.objects.all()
    serializer_class = LessonLinkSerializer

    def delete(self, request, *args, **kwargs):
        try:
            link = self.get_object()
            link.delete()
            return Response({"message": "Lesson link deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
        except LessonLink.DoesNotExist:
            return Response({"error": "Lesson link not found"}, status=status.HTTP_404_NOT_FOUND)
