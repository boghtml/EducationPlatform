# apps/chats/admin.py

from django.contrib import admin
from .models import CourseChat, ChatMessage, MessageAttachment, MessageReaction, PinnedMessage, MessageMention

@admin.register(CourseChat)
class CourseChatAdmin(admin.ModelAdmin):
    list_display = ('id', 'course', 'name', 'created_at')
    list_filter = ('course',)
    search_fields = ('name', 'description', 'course__title')
    date_hierarchy = 'created_at'

@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'chat', 'parent_message', 'is_edited', 'created_at')
    list_filter = ('chat', 'is_edited')
    search_fields = ('content', 'user__username')
    date_hierarchy = 'created_at'
    raw_id_fields = ('user', 'chat', 'parent_message')

@admin.register(MessageAttachment)
class MessageAttachmentAdmin(admin.ModelAdmin):
    list_display = ('id', 'message', 'file_name', 'file_type', 'file_size', 'created_at')
    list_filter = ('file_type', 'created_at')
    search_fields = ('file_name', 'message__content')
    date_hierarchy = 'created_at'
    raw_id_fields = ('message',)

@admin.register(MessageReaction)
class MessageReactionAdmin(admin.ModelAdmin):
    list_display = ('id', 'message', 'user', 'reaction_type', 'created_at')
    list_filter = ('reaction_type', 'created_at')
    search_fields = ('user__username', 'message__content')
    date_hierarchy = 'created_at'
    raw_id_fields = ('message', 'user')

@admin.register(PinnedMessage)
class PinnedMessageAdmin(admin.ModelAdmin):
    list_display = ('id', 'message', 'pinned_by', 'pinned_at')
    list_filter = ('pinned_at',)
    search_fields = ('message__content', 'pinned_by__username')
    date_hierarchy = 'pinned_at'
    raw_id_fields = ('message', 'pinned_by')

@admin.register(MessageMention)
class MessageMentionAdmin(admin.ModelAdmin):
    list_display = ('id', 'message', 'user', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('message__content', 'user__username')
    date_hierarchy = 'created_at'
    raw_id_fields = ('message', 'user')