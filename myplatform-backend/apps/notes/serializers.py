# apps/notes/serializers.py

from rest_framework import serializers
from .models import UserNote, NoteFolder

class NoteFolderSerializer(serializers.ModelSerializer):
    class Meta:
        model = NoteFolder
        fields = ['id', 'user_id', 'name', 'created_at', 'updated_at']

class UserNoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserNote
        fields = ['id', 'user_id', 'folder_id', 'title', 'content', 'created_at', 'updated_at']
