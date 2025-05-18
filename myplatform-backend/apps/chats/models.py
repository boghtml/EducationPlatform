# apps/chats/models.py

from django.db import models
from django.conf import settings
from apps.courses.models import Course

class CourseChat(models.Model):
    """Модель для представлення чат-каналу курсу"""
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='chats')
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} - {self.course.title}"

    class Meta:
        indexes = [
            models.Index(fields=['course']),
        ]

class ChatMessage(models.Model):
    """Модель для представлення повідомлень в чаті"""
    chat = models.ForeignKey(CourseChat, on_delete=models.CASCADE, related_name='messages')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='chat_messages')
    parent_message = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='replies')
    content = models.TextField()
    is_edited = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Message by {self.user.username} at {self.created_at}"

    class Meta:
        indexes = [
            models.Index(fields=['chat']),
            models.Index(fields=['user']),
            models.Index(fields=['parent_message']),
            models.Index(fields=['created_at']),
        ]
        ordering = ['-created_at']

class MessageAttachment(models.Model):
    """Модель для вкладень до повідомлень"""
    message = models.ForeignKey(ChatMessage, on_delete=models.CASCADE, related_name='attachments')
    file_url = models.URLField(max_length=500)
    file_name = models.CharField(max_length=255)
    file_type = models.CharField(max_length=50, blank=True)
    file_size = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Attachment: {self.file_name}"

    class Meta:
        indexes = [
            models.Index(fields=['message']),
        ]

class MessageReaction(models.Model):
    """Модель для реакцій на повідомлення"""
    message = models.ForeignKey(ChatMessage, on_delete=models.CASCADE, related_name='reactions')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='message_reactions')
    reaction_type = models.CharField(max_length=50) 
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.reaction_type}"

    class Meta:
        indexes = [
            models.Index(fields=['message']),
            models.Index(fields=['user']),
        ]
        
        unique_together = ('message', 'user', 'reaction_type')

class PinnedMessage(models.Model):
    """Модель для закріплених повідомлень"""
    message = models.OneToOneField(ChatMessage, on_delete=models.CASCADE, related_name='pinned')
    pinned_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='pinned_messages')
    pinned_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Pinned by {self.pinned_by.username} at {self.pinned_at}"

    class Meta:
        indexes = [
            models.Index(fields=['message']),
        ]

class MessageMention(models.Model):
    """Модель для згадувань користувачів у повідомленнях"""
    message = models.ForeignKey(ChatMessage, on_delete=models.CASCADE, related_name='mentions')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='message_mentions')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} mentioned in {self.message.id}"

    class Meta:
        indexes = [
            models.Index(fields=['message']),
            models.Index(fields=['user']),
        ]
        unique_together = ('message', 'user')