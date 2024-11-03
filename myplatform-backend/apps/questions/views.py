from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Question, Answer
from .serializers import QuestionSerializer, AnswerSerializer
from django.shortcuts import get_object_or_404
from apps.courses.models import Course
from apps.enrollments.models import Enrollment
from rest_framework.permissions import IsAuthenticated

from apps.assignments.mixins import CsrfExemptSessionAuthentication


class QuestionCreateView(APIView):
    authentication_classes = [CsrfExemptSessionAuthentication]
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        user = request.user
        if user.role != 'teacher':
            return Response({"error": "Only teachers can create questions."}, status=status.HTTP_403_FORBIDDEN)
        
        course_id = request.data.get('course_id')
        title = request.data.get('title')
        description = request.data.get('description')
        
        if not all([course_id, title, description]):
            return Response({"error": "All fields are required."}, status=status.HTTP_400_BAD_REQUEST)
        
        course = get_object_or_404(Course, id=course_id)
        
        question = Question.objects.create(
            course=course,
            teacher=user,
            title=title,
            description=description
        )
        
        serializer = QuestionSerializer(question)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class QuestionUpdateView(APIView):
    authentication_classes = [CsrfExemptSessionAuthentication]
    permission_classes = [IsAuthenticated]
    
    def put(self, request, question_id):
        user = request.user
        question = get_object_or_404(Question, id=question_id)
        
        if question.teacher != user:
            return Response({"error": "You are not authorized to edit this question."}, status=status.HTTP_403_FORBIDDEN)
        
        title = request.data.get('title', question.title)
        description = request.data.get('description', question.description)
        
        question.title = title
        question.description = description
        question.save()
        
        serializer = QuestionSerializer(question)
        return Response(serializer.data, status=status.HTTP_200_OK)

class QuestionDeleteView(APIView):
    authentication_classes = [CsrfExemptSessionAuthentication]
    permission_classes = [IsAuthenticated]
    
    def delete(self, request, question_id):
        user = request.user
        question = get_object_or_404(Question, id=question_id)
        
        if question.teacher != user:
            return Response({"error": "You are not authorized to delete this question."}, status=status.HTTP_403_FORBIDDEN)
        
        question.delete()
        return Response({"message": "Question deleted successfully."}, status=status.HTTP_200_OK)

class QuestionListView(APIView):
    authentication_classes = [CsrfExemptSessionAuthentication]
    permission_classes = [IsAuthenticated]
    
    def get(self, request, course_id):
        user = request.user
        
        if user.role not in ['student', 'teacher']:
            return Response({"error": "Access denied."}, status=status.HTTP_403_FORBIDDEN)
        
        course = get_object_or_404(Course, id=course_id)
        if user.role == 'student':
            if not Enrollment.objects.filter(course=course, student=user).exists():
                return Response({"error": "You are not enrolled in this course."}, status=status.HTTP_403_FORBIDDEN)
        elif user.role == 'teacher':
            pass
        
        questions = Question.objects.filter(course=course)
        serializer = QuestionSerializer(questions, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class QuestionDetailView(APIView):
    authentication_classes = [CsrfExemptSessionAuthentication]
    permission_classes = [IsAuthenticated]
    
    def get(self, request, question_id):
        user = request.user
        question = get_object_or_404(Question, id=question_id)
        
        course = question.course
        if user.role == 'student':
            if not Enrollment.objects.filter(course=course, student=user).exists():
                return Response({"error": "You are not enrolled in this course."}, status=status.HTTP_403_FORBIDDEN)
        elif user.role == 'teacher':
            pass

        else:
            return Response({"error": "Access denied."}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = QuestionSerializer(question)
        return Response(serializer.data, status=status.HTTP_200_OK)

class AnswerCreateView(APIView):
    authentication_classes = [CsrfExemptSessionAuthentication]
    permission_classes = [IsAuthenticated]
    
    def post(self, request, question_id):
        user = request.user
        question = get_object_or_404(Question, id=question_id)
        content = request.data.get('content')
        
        if not content:
            return Response({"error": "Content is required."}, status=status.HTTP_400_BAD_REQUEST)
        
        course = question.course
        if user.role == 'student':
            if not Enrollment.objects.filter(course=course, student=user).exists():
                return Response({"error": "You are not enrolled in this course."}, status=status.HTTP_403_FORBIDDEN)
        elif user.role == 'teacher':
            pass

        else:
            return Response({"error": "Access denied."}, status=status.HTTP_403_FORBIDDEN)
        
        answer = Answer.objects.create(
            question=question,
            user=user,
            content=content
        )
        
        serializer = AnswerSerializer(answer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class AnswerUpdateView(APIView):
    authentication_classes = [CsrfExemptSessionAuthentication]
    permission_classes = [IsAuthenticated]
    
    def put(self, request, answer_id):
        user = request.user
        answer = get_object_or_404(Answer, id=answer_id)
        
        if answer.user != user:
            return Response({"error": "You are not authorized to edit this answer."}, status=status.HTTP_403_FORBIDDEN)
        
        content = request.data.get('content', answer.content)
        answer.content = content
        answer.save()
        
        serializer = AnswerSerializer(answer)
        return Response(serializer.data, status=status.HTTP_200_OK)

class AnswerDeleteView(APIView):
    authentication_classes = [CsrfExemptSessionAuthentication]
    permission_classes = [IsAuthenticated]
    
    def delete(self, request, answer_id):
        user = request.user
        answer = get_object_or_404(Answer, id=answer_id)
        
        if answer.user != user:
            return Response({"error": "You are not authorized to delete this answer."}, status=status.HTTP_403_FORBIDDEN)
        
        answer.delete()
        return Response({"message": "Answer deleted successfully."}, status=status.HTTP_200_OK)
