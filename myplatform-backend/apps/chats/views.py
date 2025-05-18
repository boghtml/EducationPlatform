# apps/chats/views.py

from rest_framework import viewsets, generics, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.db.models import Count, Q, Prefetch
from django.contrib.auth import get_user_model

from .models import CourseChat, ChatMessage, MessageAttachment, MessageReaction, PinnedMessage, MessageMention
from .serializers import (
    CourseChatSerializer, 
    ChatMessageSerializer,
    ChatMessageCreateSerializer,
    MessageAttachmentSerializer,
    MessageAttachmentCreateSerializer,
    MessageReactionSerializer,
    MessageReactionCreateSerializer,
    PinnedMessageSerializer
)
from apps.courses.models import Course
from apps.enrollments.models import Enrollment
from apps.assignments.mixins import CsrfExemptSessionAuthentication
import boto3
from django.conf import settings
from botocore.exceptions import ClientError
import urllib.parse
import os

User = get_user_model()

# Налаштування AWS S3
s3_client = boto3.client(
    's3',
    aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
    aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
    region_name=settings.AWS_S3_REGION_NAME
)

class CourseChatViewSet(viewsets.ModelViewSet):
    """Viewset для чатів курсу"""
    serializer_class = CourseChatSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [CsrfExemptSessionAuthentication]
    
    def get_queryset(self):
        return CourseChat.objects.annotate(
            messages_count=Count('messages', filter=Q(messages__parent_message=None))
        )
    
    def create(self, request, *args, **kwargs):
        # Додайте логіку для створення чату
        course_id = request.data.get('course')
        
        # Перевірка, чи користувач є викладачем або адміністратором
        if request.user.role not in ['teacher', 'admin']:
            return Response({'error': 'Only teachers or admins can create chats'},
                            status=status.HTTP_403_FORBIDDEN)
            
        # Перевірка, чи існує курс і чи є користувач викладачем цього курсу
        try:
            course = Course.objects.get(id=course_id)
            if course.teacher.id != request.user.id and request.user.role != 'admin':
                return Response({'error': 'You are not the teacher of this course'},
                                status=status.HTTP_403_FORBIDDEN)
        except Course.DoesNotExist:
            return Response({'error': 'Course not found'},
                            status=status.HTTP_404_NOT_FOUND)
            
        return super().create(request, *args, **kwargs)

class CourseChatByIdView(generics.RetrieveAPIView):
    """Отримання чату за ID курсу"""
    serializer_class = CourseChatSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [CsrfExemptSessionAuthentication]
    
    def get_object(self):
        course_id = self.kwargs.get('course_id')
        user = self.request.user
        
        # Перевірка, чи користувач має доступ до курсу
        if user.role == 'student':
            # Студент має бути зареєстрований на курс
            enrollment_exists = Enrollment.objects.filter(
                course_id=course_id, 
                student=user
            ).exists()
            
            if not enrollment_exists:
                return None
        elif user.role == 'teacher':
            # Викладач має бути вчителем цього курсу
            is_teacher = Course.objects.filter(
                id=course_id, 
                teacher=user
            ).exists()
            
            if not is_teacher:
                return None
        
        # Отримуємо або створюємо чат для курсу
        chat, created = CourseChat.objects.get_or_create(
            course_id=course_id,
            defaults={
                'name': f"Загальний чат курсу",
                'description': f"Чат для обговорення курсу всіма учасниками"
            }
        )
        
        # Додаємо анотацію для підрахунку повідомлень
        return CourseChat.objects.annotate(
            messages_count=Count('messages', filter=Q(messages__parent_message=None))
        ).get(id=chat.id)
    
    def get(self, request, *args, **kwargs):
        chat = self.get_object()
        if not chat:
            return Response({'error': 'You do not have access to this course chat'},
                            status=status.HTTP_403_FORBIDDEN)
        
        serializer = self.get_serializer(chat)
        return Response(serializer.data)

class ChatMessagesView(generics.ListAPIView):
    """Отримання повідомлень для чату"""
    serializer_class = ChatMessageSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [CsrfExemptSessionAuthentication]
    
    def get_queryset(self):
        chat_id = self.kwargs.get('chat_id')
        parent_id = self.request.query_params.get('parent_id', None)
        
        # Базовий запит для повідомлень чату
        queryset = ChatMessage.objects.filter(chat_id=chat_id)
        
        # Фільтрація за батьківським повідомленням (якщо вказане)
        if parent_id:
            queryset = queryset.filter(parent_message_id=parent_id)
        else:
            # Якщо не вказано батьківське повідомлення, показуємо тільки головні повідомлення
            queryset = queryset.filter(parent_message=None)
        
        # Додаємо підрахунок відповідей
        queryset = queryset.annotate(reply_count=Count('replies'))
        
        # Додаємо сортування
        queryset = queryset.order_by('-created_at')
        
        # Створюємо запит для відповідей ОКРЕМО, не використовуючи slice
        replies_queryset = ChatMessage.objects.select_related('user').order_by('-created_at')
        
        # Отримання реакцій та вкладень для кожного повідомлення (оптимізація запитів)
        queryset = queryset.select_related('user').prefetch_related(
            'attachments',
            Prefetch('reactions', queryset=MessageReaction.objects.select_related('user')),
            'mentions__user',
            # Використовуємо Prefetch з повним визначенням умов
            Prefetch(
                'replies', 
                queryset=replies_queryset,
                to_attr='recent_replies'
            )
        )
        
        return queryset
    
    def list(self, request, *args, **kwargs):
        # Перевірка доступу до чату
        chat_id = self.kwargs.get('chat_id')
        chat = get_object_or_404(CourseChat, id=chat_id)
        user = request.user
        
        # Перевірка, чи має користувач доступ до чату
        if user.role == 'student':
            enrollment_exists = Enrollment.objects.filter(
                course=chat.course, 
                student=user
            ).exists()
            
            if not enrollment_exists:
                return Response({'error': 'You do not have access to this chat'},
                                status=status.HTTP_403_FORBIDDEN)
        elif user.role == 'teacher' and chat.course.teacher.id != user.id:
            return Response({'error': 'You are not the teacher of this course'},
                            status=status.HTTP_403_FORBIDDEN)
        
        return super().list(request, *args, **kwargs)
    
class ChatMessageCreateView(generics.CreateAPIView):
    """Створення нового повідомлення в чаті"""
    serializer_class = ChatMessageCreateSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [CsrfExemptSessionAuthentication]
    
    def create(self, request, *args, **kwargs):
        chat_id = request.data.get('chat')
        user = request.user
        
        # Перевірка доступу до чату
        chat = get_object_or_404(CourseChat, id=chat_id)
        
        # Перевірка, чи має користувач доступ до чату
        if user.role == 'student':
            enrollment_exists = Enrollment.objects.filter(
                course=chat.course, 
                student=user
            ).exists()
            
            if not enrollment_exists:
                return Response({'error': 'You do not have access to this chat'},
                                status=status.HTTP_403_FORBIDDEN)
        elif user.role == 'teacher' and chat.course.teacher.id != user.id:
            return Response({'error': 'You are not the teacher of this course'},
                            status=status.HTTP_403_FORBIDDEN)
        
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Створення повідомлення
        message = serializer.save(user=user)
        
        # Обробка згадувань
        mentions = request.data.get('mentions', [])
        if mentions:
            for user_id in mentions:
                try:
                    mentioned_user = User.objects.get(id=user_id)
                    MessageMention.objects.create(message=message, user=mentioned_user)
                except User.DoesNotExist:
                    pass
        
        # Повертаємо створене повідомлення з більш детальною інформацією
        return Response(
            ChatMessageSerializer(message, context={'request': request}).data,
            status=status.HTTP_201_CREATED
        )

class ChatMessageDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Деталі, оновлення та видалення повідомлення"""
    serializer_class = ChatMessageSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [CsrfExemptSessionAuthentication]
    
    def get_queryset(self):
        return ChatMessage.objects.select_related('user', 'chat').prefetch_related(
            'attachments',
            'reactions__user',
            'mentions__user'
        )
    
    def update(self, request, *args, **kwargs):
        message = self.get_object()
        user = request.user
        
        # Перевірка прав на редагування повідомлення
        if message.user.id != user.id and user.role not in ['teacher', 'admin']:
            return Response({'error': 'You can only edit your own messages'},
                            status=status.HTTP_403_FORBIDDEN)
        
        # Часткове оновлення повідомлення
        serializer = self.get_serializer(message, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        
        # Позначаємо повідомлення як відредаговане
        serializer.save(is_edited=True)
        
        return Response(serializer.data)
    
    def destroy(self, request, *args, **kwargs):
        message = self.get_object()
        user = request.user
        
        # Перевірка прав на видалення повідомлення
        if message.user.id != user.id and user.role not in ['teacher', 'admin']:
            return Response({'error': 'You can only delete your own messages'},
                            status=status.HTTP_403_FORBIDDEN)
        
        # Видаляємо повідомлення
        self.perform_destroy(message)
        
        return Response(status=status.HTTP_204_NO_CONTENT)

class MessagePinView(generics.GenericAPIView):
    """Закріплення/відкріплення повідомлення"""
    permission_classes = [IsAuthenticated]
    authentication_classes = [CsrfExemptSessionAuthentication]
    
    def post(self, request, *args, **kwargs):
        message_id = kwargs.get('message_id')
        message = get_object_or_404(ChatMessage, id=message_id)
        user = request.user
        
        # Перевірка, чи користувач є викладачем курсу або адміністратором
        if user.role not in ['teacher', 'admin']:
            if user.role == 'teacher' and message.chat.course.teacher.id != user.id:
                return Response({'error': 'Only course teachers or admins can pin messages'},
                                status=status.HTTP_403_FORBIDDEN)
        
        # Перевірка, чи вже закріплене повідомлення
        pinned, created = PinnedMessage.objects.get_or_create(
            message=message,
            defaults={'pinned_by': user}
        )
        
        if created:
            return Response({'message': 'Message pinned successfully'},
                            status=status.HTTP_201_CREATED)
        else:
            return Response({'message': 'Message is already pinned'},
                            status=status.HTTP_200_OK)
    
    def delete(self, request, *args, **kwargs):
        message_id = kwargs.get('message_id')
        message = get_object_or_404(ChatMessage, id=message_id)
        user = request.user
        
        # Перевірка, чи користувач є викладачем курсу або адміністратором
        if user.role not in ['teacher', 'admin']:
            if user.role == 'teacher' and message.chat.course.teacher.id != user.id:
                return Response({'error': 'Only course teachers or admins can unpin messages'},
                                status=status.HTTP_403_FORBIDDEN)
        
        # Відкріплення повідомлення
        try:
            pinned_message = PinnedMessage.objects.get(message=message)
            pinned_message.delete()
            return Response({'message': 'Message unpinned successfully'},
                            status=status.HTTP_200_OK)
        except PinnedMessage.DoesNotExist:
            return Response({'message': 'Message is not pinned'},
                            status=status.HTTP_404_NOT_FOUND)

class MessageReactionView(generics.GenericAPIView):
    """Додавання/видалення реакції на повідомлення"""
    serializer_class = MessageReactionCreateSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [CsrfExemptSessionAuthentication]
    
    def post(self, request, *args, **kwargs):
        message_id = kwargs.get('message_id')
        reaction_type = request.data.get('reaction_type')
        user = request.user
        
        if not reaction_type:
            return Response({'error': 'Reaction type is required'},
                            status=status.HTTP_400_BAD_REQUEST)
        
        message = get_object_or_404(ChatMessage, id=message_id)
        
        # Перевірка, чи має користувач доступ до чату
        chat = message.chat
        if user.role == 'student':
            enrollment_exists = Enrollment.objects.filter(
                course=chat.course, 
                student=user
            ).exists()
            
            if not enrollment_exists:
                return Response({'error': 'You do not have access to this chat'},
                                status=status.HTTP_403_FORBIDDEN)
        elif user.role == 'teacher' and chat.course.teacher.id != user.id:
            return Response({'error': 'You are not the teacher of this course'},
                            status=status.HTTP_403_FORBIDDEN)
        
        # Перевірка, чи вже існує така реакція
        reaction, created = MessageReaction.objects.get_or_create(
            message=message,
            user=user,
            reaction_type=reaction_type
        )
        
        if created:
            return Response({'message': 'Reaction added successfully'},
                            status=status.HTTP_201_CREATED)
        else:
            return Response({'message': 'Reaction already exists'},
                            status=status.HTTP_200_OK)
    
    def delete(self, request, *args, **kwargs):
        message_id = kwargs.get('message_id')
        reaction_type = request.query_params.get('reaction_type')
        user = request.user
        
        if not reaction_type:
            return Response({'error': 'Reaction type is required'},
                            status=status.HTTP_400_BAD_REQUEST)
        
        # Видалення реакції
        try:
            reaction = MessageReaction.objects.get(
                message_id=message_id,
                user=user,
                reaction_type=reaction_type
            )
            reaction.delete()
            return Response({'message': 'Reaction removed successfully'},
                            status=status.HTTP_200_OK)
        except MessageReaction.DoesNotExist:
            return Response({'message': 'Reaction does not exist'},
                            status=status.HTTP_404_NOT_FOUND)

class MessageAttachmentUploadView(generics.GenericAPIView):
    """Завантаження файлів до повідомлення"""
    permission_classes = [IsAuthenticated]
    authentication_classes = [CsrfExemptSessionAuthentication]
    
    def post(self, request, *args, **kwargs):
        message_id = kwargs.get('message_id')
        message = get_object_or_404(ChatMessage, id=message_id)
        user = request.user
        
        # Перевірка, чи є користувач власником повідомлення
        if message.user.id != user.id and user.role not in ['teacher', 'admin']:
            return Response({'error': 'You can only attach files to your own messages'},
                            status=status.HTTP_403_FORBIDDEN)
        
        # Перевірка наявності файлу
        file = request.FILES.get('file')
        if not file:
            return Response({'error': 'No file provided'},
                            status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Визначаємо тип файлу
            file_name = file.name
            file_extension = os.path.splitext(file_name)[1].lower()
            
            # Завантаження на S3
            course_id = message.chat.course.id
            s3_file_path = f"Courses/Course_{course_id}/chat_files/{file_name}"
            
            # Завантаження файлу
            s3_client.upload_fileobj(file, settings.AWS_STORAGE_BUCKET_NAME, s3_file_path)
            
            # Кодуємо шлях файлу для URL
            encoded_file_path = urllib.parse.quote(s3_file_path, safe='/')
            
            # Формуємо URL файлу
            file_url = f"https://{settings.AWS_STORAGE_BUCKET_NAME}.s3.amazonaws.com/{encoded_file_path}"
            
            # Визначаємо тип файлу
            file_type = ""
            if file_extension in ['.jpg', '.jpeg', '.png', '.gif', '.bmp']:
                file_type = "image"
            elif file_extension in ['.pdf', '.doc', '.docx', '.txt', '.xls', '.xlsx', '.ppt', '.pptx']:
                file_type = "document"
            elif file_extension in ['.mp4', '.avi', '.mov', '.wmv']:
                file_type = "video"
            elif file_extension in ['.mp3', '.wav', '.ogg']:
                file_type = "audio"
            else:
                file_type = "other"
            
            # Створюємо вкладення
            attachment = MessageAttachment.objects.create(
                message=message,
                file_url=file_url,
                file_name=file_name,
                file_type=file_type,
                file_size=file.size
            )
            
            return Response(
                MessageAttachmentSerializer(attachment).data,
                status=status.HTTP_201_CREATED
            )
            
        except ClientError as e:
            return Response({'error': str(e)},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)