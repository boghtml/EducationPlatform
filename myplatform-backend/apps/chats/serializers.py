# apps/chats/serializers.py

from rest_framework import serializers
from .models import CourseChat, ChatMessage, MessageAttachment, MessageReaction, PinnedMessage, MessageMention
from apps.users.serializers import CustomUserSerializer

class MessageAttachmentSerializer(serializers.ModelSerializer):
    """Серіалізатор для вкладень повідомлень"""
    class Meta:
        model = MessageAttachment
        fields = ['id', 'file_url', 'file_name', 'file_type', 'file_size', 'created_at']

class MessageReactionSerializer(serializers.ModelSerializer):
    """Серіалізатор для реакцій на повідомлення"""
    user = CustomUserSerializer(read_only=True)
    
    class Meta:
        model = MessageReaction
        fields = ['id', 'user', 'reaction_type', 'created_at']

class MessageMentionSerializer(serializers.ModelSerializer):
    """Серіалізатор для згадувань користувачів у повідомленнях"""
    user = CustomUserSerializer(read_only=True)
    
    class Meta:
        model = MessageMention
        fields = ['id', 'user', 'created_at']

class ReplyMessageSerializer(serializers.ModelSerializer):
    """Серіалізатор для відповідей (спрощений)"""
    user = CustomUserSerializer(read_only=True)
    
    class Meta:
        model = ChatMessage
        fields = ['id', 'user', 'content', 'is_edited', 'created_at', 'updated_at']


class ChatMessageSerializer(serializers.ModelSerializer):
    """Серіалізатор для повідомлень чату"""
    user = CustomUserSerializer(read_only=True)
    attachments = MessageAttachmentSerializer(many=True, read_only=True)
    reactions = MessageReactionSerializer(many=True, read_only=True)
    mentions = MessageMentionSerializer(many=True, read_only=True)
    replies = serializers.SerializerMethodField()
    is_pinned = serializers.SerializerMethodField()
    reply_count = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = ChatMessage
        fields = [
            'id', 'chat', 'user', 'parent_message', 'content', 'is_edited',
            'created_at', 'updated_at', 'attachments', 'reactions', 'mentions',
            'is_pinned', 'replies', 'reply_count'
        ]
    
    def get_is_pinned(self, obj):
        """Перевірка, чи закріплене повідомлення"""
        return hasattr(obj, 'pinned')
    
    def get_replies(self, obj):
        """Отримання останніх відповідей на повідомлення"""
        # Перевіряємо, чи є атрибут recent_replies, доданий через Prefetch
        if hasattr(obj, 'recent_replies'):
            # Обмежуємо кількість відповідей до 3 для відображення
            replies = obj.recent_replies[:3]
            return ReplyMessageSerializer(replies, many=True).data
        # Якщо немає prefetch_related або батьківське повідомлення
        elif obj.parent_message is None:
            # Отримуємо останні 3 відповіді безпосередньо
            replies = obj.replies.select_related('user').order_by('-created_at')[:3]
            return ReplyMessageSerializer(replies, many=True).data
        return []
    
    def to_representation(self, instance):
        """Додаткові методи обробки перед відправкою даних"""
        representation = super().to_representation(instance)
        
        # Показувати відповіді лише для батьківських повідомлень
        if instance.parent_message is not None:
            representation.pop('replies', None)
        
        return representation
    
class PinnedMessageSerializer(serializers.ModelSerializer):
    """Серіалізатор для закріплених повідомлень"""
    message = ChatMessageSerializer(read_only=True)
    pinned_by = CustomUserSerializer(read_only=True)
    
    class Meta:
        model = PinnedMessage
        fields = ['id', 'message', 'pinned_by', 'pinned_at']

class ChatMessageCreateSerializer(serializers.ModelSerializer):
    """Серіалізатор для створення повідомлень"""
    mentions = serializers.ListField(
        child=serializers.IntegerField(), 
        required=False, 
        write_only=True
    )
    
    class Meta:
        model = ChatMessage
        fields = ['chat', 'content', 'parent_message', 'mentions']

class CourseChatSerializer(serializers.ModelSerializer):
    """Серіалізатор для чатів курсу"""
    messages_count = serializers.IntegerField(read_only=True)
    last_message = serializers.SerializerMethodField()
    pinned_messages = serializers.SerializerMethodField()
    
    class Meta:
        model = CourseChat
        fields = ['id', 'course', 'name', 'description', 'created_at', 'updated_at', 'messages_count', 'last_message', 'pinned_messages']
    
    def get_last_message(self, obj):
        """Отримати останнє повідомлення в чаті"""
        last_message = obj.messages.filter(parent_message=None).first()
        if last_message:
            return {
                'id': last_message.id,
                'content': last_message.content,
                'user': {
                    'id': last_message.user.id,
                    'username': last_message.user.username,
                    'profile_image_url': last_message.user.profile_image_url
                },
                'created_at': last_message.created_at
            }
        return None
    
    def get_pinned_messages(self, obj):
        """Отримати закріплені повідомлення в чаті"""
        pinned_messages = PinnedMessage.objects.filter(message__chat=obj).select_related('message', 'message__user')
        serializer = PinnedMessageSerializer(pinned_messages, many=True)
        return serializer.data

class MessageReactionCreateSerializer(serializers.ModelSerializer):
    """Серіалізатор для створення реакцій"""
    class Meta:
        model = MessageReaction
        fields = ['message', 'reaction_type']

class MessageAttachmentCreateSerializer(serializers.ModelSerializer):
    """Серіалізатор для створення вкладень"""
    class Meta:
        model = MessageAttachment
        fields = ['message', 'file_url', 'file_name', 'file_type', 'file_size']