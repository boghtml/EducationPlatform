
from django.utils import timezone
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

from django.shortcuts import get_object_or_404
from apps.courses.models import Course
from apps.users.models import CustomUser

from django.db import transaction
from rest_framework import generics, viewsets, status
from rest_framework.response import Response
from .models import Assignment, AssignmentFile, AssignmentLink, Submission, SubmissionFile
from .serializers import AssignmentSerializer, AssignmentFileSerializer, AssignmentLinkSerializer, SubmissionSerializer, SubmissionFileSerializer, MultipleAssignmentLinksSerializer
from apps.enrollments.models import Enrollment  # Для отримання студентів, записаних на курс
from rest_framework.views import APIView
import boto3
from django.conf import settings
from botocore.exceptions import ClientError
from urllib.parse import urlparse
import uuid
from .mixins import CsrfExemptSessionAuthentication

from rest_framework.permissions import BasePermission
from rest_framework.permissions import AllowAny
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework.authentication import TokenAuthentication
import urllib.parse

# Ініціалізація клієнта S3
s3_client = boto3.client(
    's3',
    aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
    aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
    region_name=settings.AWS_S3_REGION_NAME
)

class AssignmentViewSet(viewsets.ModelViewSet):
    queryset = Assignment.objects.all()
    serializer_class = AssignmentSerializer
    authentication_classes = [CsrfExemptSessionAuthentication]
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        data = request.data.copy()
        data['teacher'] = request.user.id  # Встановлюємо вчителя, який створює завдання
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        assignment = serializer.save()

        # Створюємо записи у Submission для кожного учня курсу
        course_id = data.get('course')
        if course_id:
            enrollments = Enrollment.objects.filter(course_id=course_id)
            submissions = []
            for enrollment in enrollments:
                submission = Submission(
                    student=enrollment.student,
                    assignment=assignment,
                    status='assigned'
                )
                submissions.append(submission)
            Submission.objects.bulk_create(submissions)

        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def update(self, request, *args, **kwargs):
        assignment = self.get_object()

        self.check_object_permissions(request, assignment)

        serializer = self.get_serializer(assignment, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        assignment = self.get_object()

        self.check_object_permissions(request, assignment)

        self.perform_destroy(assignment)

        return Response(status=status.HTTP_204_NO_CONTENT)

    def perform_destroy(self, instance):
        self.delete_assignment_files(instance)
        instance.links.all().delete()

        submissions = instance.submissions.all()  # Використовуємо 'submissions' замість 'submission_set'
        for submission in submissions:
            self.delete_submission_files(submission)
            submission.delete()

        instance.delete()


    def delete_assignment_files(self, assignment):
        assignment_files = assignment.files.all()
        for file in assignment_files:
            self.delete_file_from_s3(file.file_url)
            file.delete()

    def delete_submission_files(self, submission):
        submission_files = submission.files.all()
        for file in submission_files:
            self.delete_file_from_s3(file.file_url)
            file.delete()

    def delete_file_from_s3(self, file_url):
        from urllib.parse import urlparse, unquote
        import botocore

        try:
            # Парсимо URL файлу
            parsed_url = urlparse(file_url)
            encoded_s3_file_path = parsed_url.path.lstrip('/')
            s3_file_path = unquote(encoded_s3_file_path)

            # Видаляємо файл з S3
            s3_client.delete_object(Bucket=settings.AWS_STORAGE_BUCKET_NAME, Key=s3_file_path)
        except botocore.exceptions.ClientError as e:
            # Логування помилки
            print(f"Error deleting file from S3: {e}")



class UploadAssignmentFileView(APIView):
    authentication_classes = [CsrfExemptSessionAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request, assignment_id):
        try:
            assignment = Assignment.objects.get(id=assignment_id)
        except Assignment.DoesNotExist:
            return Response({"error": "Assignment not found"}, status=status.HTTP_404_NOT_FOUND)

        file = request.FILES.get('file')
        if not file:
            return Response({"error": "No file provided"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            s3_file_path = f"Courses/Course_{assignment.course.id}/assignments/assignment_{assignment_id}/{file.name}"

            s3_client.upload_fileobj(file, settings.AWS_STORAGE_BUCKET_NAME, s3_file_path)

            encoded_file_path = urllib.parse.quote(s3_file_path, safe='/')

            file_url = f"https://{settings.AWS_STORAGE_BUCKET_NAME}.s3.amazonaws.com/{encoded_file_path}"

            assignment_file = AssignmentFile.objects.create(
                assignment=assignment,
                file_url=file_url,
                file_type=file.name.split('.')[-1].lower(),
                file_size=file.size,
                is_temp=True
            )

            return Response({'file_url': file_url}, status=status.HTTP_201_CREATED)
        except ClientError as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class DeleteTempAssignmentFileView(APIView):
    authentication_classes = [CsrfExemptSessionAuthentication]
    permission_classes = [IsAuthenticated]

    def delete(self, request, file_id):
        try:
            assignment_file = AssignmentFile.objects.get(id=file_id, is_temp=True)
        except AssignmentFile.DoesNotExist:
            return Response({"error": "Temporary file not found"}, status=status.HTTP_404_NOT_FOUND)

        try:
            # Отримуємо закодований шлях до файлу з URL
            encoded_s3_file_path = assignment_file.file_url.split(f"{settings.AWS_STORAGE_BUCKET_NAME}.s3.amazonaws.com/")[-1]

            # Декодуємо шлях до файлу
            s3_file_path = urllib.parse.unquote(encoded_s3_file_path)

            # Видаляємо файл з S3
            s3_client.delete_object(Bucket=settings.AWS_STORAGE_BUCKET_NAME, Key=s3_file_path)

            # Видаляємо запис з бази даних
            assignment_file.delete()

            return Response({"message": "Temporary file deleted successfully"}, status=status.HTTP_200_OK)
        except ClientError as e:
            return Response({'error': f"Error deleting file from S3: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    

class ConfirmAssignmentFilesView(APIView):
    authentication_classes = [CsrfExemptSessionAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request, assignment_id):
        try:
            assignment = Assignment.objects.get(id=assignment_id)
        except Assignment.DoesNotExist:
            return Response({"error": "Assignment not found"}, status=status.HTTP_404_NOT_FOUND)

        temp_files = AssignmentFile.objects.filter(assignment=assignment, is_temp=True)
        confirmed_count = temp_files.update(is_temp=False)

        return Response({
            "message": f"{confirmed_count} temporary files have been confirmed",
            "assignment_id": assignment_id
        }, status=status.HTTP_200_OK)

class AddAssignmentLinksView(APIView):
    authentication_classes = [CsrfExemptSessionAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request, assignment_id):
        try:
            assignment = Assignment.objects.get(id=assignment_id)
        except Assignment.DoesNotExist:
            return Response({"error": "Assignment not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = MultipleAssignmentLinksSerializer(data=request.data)
        if serializer.is_valid():
            links = serializer.validated_data['links']
            created_links = []
            for link_url in links:
                assignment_link = AssignmentLink.objects.create(
                    assignment=assignment,
                    link_url=link_url,
                    description=""  # Ви можете додати логіку для опису, якщо потрібно
                )
                created_links.append(AssignmentLinkSerializer(assignment_link).data)
            return Response(created_links, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AssignmentLinkDeleteView(generics.DestroyAPIView):
    authentication_classes = [CsrfExemptSessionAuthentication]
    permission_classes = [IsAuthenticated]

    queryset = AssignmentLink.objects.all()
    serializer_class = AssignmentLinkSerializer

    def delete(self, request, *args, **kwargs):
        try:
            link = self.get_object()
            link.delete()
            return Response({"message": "Assignment link deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
        except AssignmentLink.DoesNotExist:
            return Response({"error": "Assignment link not found"}, status=status.HTTP_404_NOT_FOUND)

class DeleteAssignmentFileView(APIView):
    authentication_classes = [CsrfExemptSessionAuthentication]
    permission_classes = [IsAuthenticated]

    def delete(self, request, file_id):
        try:
            assignment_file = AssignmentFile.objects.get(id=file_id)
        except AssignmentFile.DoesNotExist:
            return Response({"error": "File not found"}, status=status.HTTP_404_NOT_FOUND)

        try:
            # Отримуємо закодований шлях до файлу з URL
            encoded_s3_file_path = assignment_file.file_url.split(f"{settings.AWS_STORAGE_BUCKET_NAME}.s3.amazonaws.com/")[-1]

            # Декодуємо шлях до файлу
            s3_file_path = urllib.parse.unquote(encoded_s3_file_path)

            # Видаляємо файл з S3
            s3_client.delete_object(Bucket=settings.AWS_STORAGE_BUCKET_NAME, Key=s3_file_path)

            # Видаляємо файл з бази даних
            assignment_file.delete()

            return Response({"message": "File deleted successfully"}, status=status.HTTP_200_OK)
        except ClientError as e:
            return Response({'error': f"Error deleting file from S3: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class StudentAssignmentListView(APIView):
    authentication_classes = [CsrfExemptSessionAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, course_id):
        student = request.user

        if not Enrollment.objects.filter(course_id=course_id, student=student).exists():
            return Response({"error": "You are not enrolled in this course"}, status=status.HTTP_403_FORBIDDEN)

        # Отримуємо завдання та відповідні submission для студента
        submissions = Submission.objects.filter(student=student, assignment__course_id=course_id).select_related('assignment')

        assignment_list = []
        for submission in submissions:
            assignment = submission.assignment
            data = {
                "id": assignment.id,
                "title": assignment.title,
                "description": assignment.description,
                "due_date": assignment.due_date,
                "status": submission.status,
            }

            if submission.status == 'graded':
                data["grade"] = submission.grade
                data["feedback"] = submission.feedback
            elif submission.status == 'returned':
                data["feedback"] = submission.feedback

            assignment_list.append(data)

        return Response(assignment_list, status=status.HTTP_200_OK)


class AssignmentDetailView(APIView):
    authentication_classes = [CsrfExemptSessionAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, assignment_id):
        try:
            assignment = Assignment.objects.get(id=assignment_id)
        except Assignment.DoesNotExist:
            return Response({"error": "Assignment not found"}, status=status.HTTP_404_NOT_FOUND)

        user = request.user

        # Якщо студент
        if user.role == 'student':
            if not Enrollment.objects.filter(course=assignment.course, student=user).exists():
                return Response({"error": "You do not have access to this assignment"}, status=status.HTTP_403_FORBIDDEN)

            # Отримуємо файли та посилання, прикріплені до завдання
            files = AssignmentFile.objects.filter(assignment=assignment)
            links = AssignmentLink.objects.filter(assignment=assignment)

            files_data = AssignmentFileSerializer(files, many=True).data
            links_data = AssignmentLinkSerializer(links, many=True).data

            assignment_data = {
                'id': assignment.id,
                'title': assignment.title,
                'description': assignment.description,
                'due_date': assignment.due_date,
                'files': files_data,
                'links': links_data
            }

        # Якщо викладач
        elif user.role == 'teacher':
            if assignment.teacher != user:
                return Response({"error": "You do not have access to this assignment"}, status=status.HTTP_403_FORBIDDEN)

            # Підрахунок студентів для різних статусів
            total_students = Enrollment.objects.filter(course=assignment.course).count()  # Усі студенти на курсі
            submitted_students = Submission.objects.filter(assignment=assignment, status='submitted').count()
            returned_students = Submission.objects.filter(assignment=assignment, status='returned').count()
            graded_students = Submission.objects.filter(assignment=assignment, status='graded').count()
            assigned_students = total_students - submitted_students - returned_students - graded_students

            # Отримуємо файли та посилання
            files = AssignmentFile.objects.filter(assignment=assignment)
            links = AssignmentLink.objects.filter(assignment=assignment)

            files_data = AssignmentFileSerializer(files, many=True).data
            links_data = AssignmentLinkSerializer(links, many=True).data

            # Формуємо відповідь
            assignment_data = {
                'id': assignment.id,
                'title': assignment.title,
                'description': assignment.description,
                'due_date': assignment.due_date,
                'files': files_data,
                'links': links_data,
                'total_students': total_students,
                'submitted_students': submitted_students,
                'returned_students': returned_students,
                'graded_students': graded_students,
                'assigned_students': assigned_students
            }

        else:
            return Response({"error": "Invalid user role"}, status=status.HTTP_403_FORBIDDEN)

        return Response(assignment_data, status=status.HTTP_200_OK)


class SubmitAssignmentView(APIView):
    authentication_classes = [CsrfExemptSessionAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request, assignment_id):
        user = request.user

        # Перевірка, чи користувач є студентом
        if user.role != 'student':
            return Response({"error": "Only students can submit assignments."}, status=status.HTTP_403_FORBIDDEN)

        try:
            assignment = Assignment.objects.get(id=assignment_id)
            submission = Submission.objects.get(assignment=assignment, student=user)
        except Assignment.DoesNotExist:
            return Response({"error": "Assignment not found"}, status=status.HTTP_404_NOT_FOUND)
        except Submission.DoesNotExist:
            return Response({"error": "You do not have access to submit this assignment"}, status=status.HTTP_403_FORBIDDEN)

        # Оновлюємо статус і дату
        submission.comment = request.data.get('comment', '')
        submission.status = 'submitted'
        submission.submission_date = timezone.now()
        submission.save()

        # Завантажуємо файли на S3 та зберігаємо їх у базі
        files = request.FILES.getlist('files')
        saved_files = []
        for file in files:
            s3_file_path = f"Courses/Course_{assignment.course.id}/submissions/submission_{submission.id}/{file.name}"

            # Завантажуємо файл на S3
            s3_client.upload_fileobj(file, settings.AWS_STORAGE_BUCKET_NAME, s3_file_path)

            # Кодуємо шлях файлу для URL
            encoded_file_path = urllib.parse.quote(s3_file_path, safe='/')

            file_url = f"https://{settings.AWS_STORAGE_BUCKET_NAME}.s3.amazonaws.com/{encoded_file_path}"

            # Зберігаємо інформацію про файл у базу даних
            submission_file = SubmissionFile.objects.create(
                submission=submission,
                file_url=file_url,
                file_type=file.name.split('.')[-1].lower(),
                file_size=file.size
            )
            saved_files.append(SubmissionFileSerializer(submission_file).data)

        return Response({
            'message': 'Assignment submitted successfully',
            'files': saved_files
        }, status=status.HTTP_201_CREATED)
    

class CancelSubmissionView(APIView):
    authentication_classes = [CsrfExemptSessionAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request, submission_id):
        user = request.user
        try:
            submission = Submission.objects.get(id=submission_id, student=user)
        except Submission.DoesNotExist:
            return Response({"error": "Submission not found or access denied"}, status=status.HTTP_404_NOT_FOUND)

        # Видаляємо всі файли із S3
        for file in submission.files.all():
            # Отримуємо закодований шлях до файлу з URL
            encoded_s3_file_path = file.file_url.split(f"{settings.AWS_STORAGE_BUCKET_NAME}.s3.amazonaws.com/")[-1]

            # Декодуємо шлях до файлу
            s3_file_path = urllib.parse.unquote(encoded_s3_file_path)

            # Видаляємо файл з S3
            s3_client.delete_object(Bucket=settings.AWS_STORAGE_BUCKET_NAME, Key=s3_file_path)

            # Видаляємо запис з бази даних
            file.delete()

        # Очищаємо коментар і оновлюємо статус
        submission.comment = ""
        submission.status = 'assigned'
        submission.submission_date = None  # Очищаємо дату здачі
        submission.save()

        return Response({"message": "Submission canceled and files deleted"}, status=status.HTTP_200_OK)


class SubmittedAssignmentsView(APIView):
    authentication_classes = [CsrfExemptSessionAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, assignment_id):
        user = request.user
        if user.role != 'teacher':
            return Response({"error": "Access denied"}, status=status.HTTP_403_FORBIDDEN)

        try:
            assignment = Assignment.objects.get(id=assignment_id, teacher=user)
        except Assignment.DoesNotExist:
            return Response({"error": "Assignment not found"}, status=status.HTTP_404_NOT_FOUND)

        submissions = Submission.objects.filter(assignment=assignment, status='submitted')
        submission_data = []

        for submission in submissions:
            submission_info = {
                'username': submission.student.username,
                'email': submission.student.email,
                'submission_date': submission.submission_date,
                'on_time': 'вчасно' if submission.submission_date <= assignment.due_date else 'пізно'
            }
            submission_data.append(submission_info)

        return Response(submission_data, status=status.HTTP_200_OK)

class SubmissionDetailView(APIView):
    authentication_classes = [CsrfExemptSessionAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, submission_id):
        try:
            submission = Submission.objects.get(id=submission_id)
        except Submission.DoesNotExist:
            return Response({"error": "Submission not found"}, status=status.HTTP_404_NOT_FOUND)

        # Перевіряємо доступ для вчителя
        if request.user.role != 'teacher':
            return Response({"error": "Access denied"}, status=status.HTTP_403_FORBIDDEN)

        submission_data = {
            'username': submission.student.username,
            'email': submission.student.email,
            'submission_date': submission.submission_date,
            'on_time': 'вчасно' if submission.submission_date <= submission.assignment.due_date else 'пізно',
            'comment': submission.comment,
            'files': SubmissionFileSerializer(submission.files.all(), many=True).data
        }

        return Response(submission_data, status=status.HTTP_200_OK)
    


class ReturnSubmissionView(APIView):
    authentication_classes = [CsrfExemptSessionAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request, assignment_id, student_id):
        user = request.user

        # Перевірка прав доступу
        if user.role != 'teacher':
            return Response({"error": "Only teachers can return submissions."}, status=status.HTTP_403_FORBIDDEN)

        try:
            assignment = Assignment.objects.get(id=assignment_id, teacher=user)
            student = CustomUser.objects.get(id=student_id)
            submission = Submission.objects.get(assignment=assignment, student=student)
        except (Assignment.DoesNotExist, CustomUser.DoesNotExist, Submission.DoesNotExist):
            return Response({"error": "Submission not found or you do not have permission."}, status=status.HTTP_404_NOT_FOUND)

        feedback = request.data.get('feedback', '')
        submission.feedback = feedback
        submission.status = 'returned'
        submission.save()

        return Response({"message": "Submission returned to student."}, status=status.HTTP_200_OK)


class GradeSubmissionView(APIView):
    authentication_classes = [CsrfExemptSessionAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request, assignment_id, student_id):
        user = request.user

        # Перевірка прав доступу
        if user.role != 'teacher':
            return Response({"error": "Only teachers can grade submissions."}, status=status.HTTP_403_FORBIDDEN)

        try:
            assignment = Assignment.objects.get(id=assignment_id, teacher=user)
            student = CustomUser.objects.get(id=student_id)
            submission = Submission.objects.get(assignment=assignment, student=student)
        except (Assignment.DoesNotExist, CustomUser.DoesNotExist, Submission.DoesNotExist):
            return Response({"error": "Submission not found or you do not have permission."}, status=status.HTTP_404_NOT_FOUND)

        feedback = request.data.get('feedback', '')
        grade = request.data.get('grade', None)

        if grade is None:
            return Response({"error": "Grade is required."}, status=status.HTTP_400_BAD_REQUEST)

        submission.feedback = feedback
        submission.grade = grade
        submission.status = 'graded'
        submission.save()

        return Response({"message": "Submission graded successfully."}, status=status.HTTP_200_OK)
