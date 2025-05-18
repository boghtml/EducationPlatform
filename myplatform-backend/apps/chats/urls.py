# apps/chats/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CourseChatViewSet,
    CourseChatByIdView,
    ChatMessagesView,
    ChatMessageCreateView,
    ChatMessageDetailView,
    MessagePinView,
    MessageReactionView,
    MessageAttachmentUploadView
)

router = DefaultRouter()
router.register(r'', CourseChatViewSet, basename='chats')

urlpatterns = [
    # Базові URL для чатів
    path('', include(router.urls)),
    
    # Отримання чату за ID курсу
    path('courses/<int:course_id>/', CourseChatByIdView.as_view(), name='course_chat'),
    
    # Повідомлення для конкретного чату
    path('<int:chat_id>/messages/', ChatMessagesView.as_view(), name='chat_messages'),
    
    # Створення нового повідомлення
    path('messages/create/', ChatMessageCreateView.as_view(), name='create_message'),
    
    # Деталі, оновлення та видалення повідомлення
    path('messages/<int:pk>/', ChatMessageDetailView.as_view(), name='message_detail'),
    
    # Закріплення/відкріплення повідомлення
    path('messages/<int:message_id>/pin/', MessagePinView.as_view(), name='pin_message'),
    
    # Додавання/видалення реакції
    path('messages/<int:message_id>/reaction/', MessageReactionView.as_view(), name='message_reaction'),
    
    # Завантаження вкладень
    path('messages/<int:message_id>/attachment/', MessageAttachmentUploadView.as_view(), name='message_attachment'),
]