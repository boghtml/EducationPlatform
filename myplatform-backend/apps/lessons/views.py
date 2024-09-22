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
from rest_framework import status

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

        # Отримуємо шлях до файлу в S3
        s3_file_path = file.file_url.split(f"{settings.AWS_STORAGE_BUCKET_NAME}.s3.amazonaws.com/")[-1]

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
            s3_file_path = f"Course_{course_id}/lessons/lesson_{lesson_id}/{file.name}"
            s3_client.upload_fileobj(file, settings.AWS_STORAGE_BUCKET_NAME, s3_file_path)
            
            file_url = f"https://{settings.AWS_STORAGE_BUCKET_NAME}.s3.amazonaws.com/{s3_file_path}"
            
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
