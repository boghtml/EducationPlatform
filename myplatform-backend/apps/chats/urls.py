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
    
    path('', include(router.urls)),
    
    path('courses/<int:course_id>/', CourseChatByIdView.as_view(), name='course_chat'),
    
    path('<int:chat_id>/messages/', ChatMessagesView.as_view(), name='chat_messages'),
    
    path('messages/create/', ChatMessageCreateView.as_view(), name='create_message'),
    
    path('messages/<int:pk>/', ChatMessageDetailView.as_view(), name='message_detail'),
    
    path('messages/<int:message_id>/pin/', MessagePinView.as_view(), name='pin_message'),
    
    path('messages/<int:message_id>/reaction/', MessageReactionView.as_view(), name='message_reaction'),
    
    path('messages/<int:message_id>/attachment/', MessageAttachmentUploadView.as_view(), name='message_attachment'),
]