# apps->assigments->serializers.py

from rest_framework import serializers
from .models import Assignment, AssignmentFile, AssignmentLink, Submission, SubmissionFile
from apps.users.serializers import CustomUserSerializer
from urllib.parse import unquote, urlparse
import urllib.parse

class AssignmentFileSerializer(serializers.ModelSerializer):

    file_name = serializers.SerializerMethodField() 

    class Meta:
        model = AssignmentFile
        fields = ['id', 'file_url', 'file_type', 'file_size', 'is_temp', 'assignment', 'file_name']

    def get_file_name(self, obj):
        
        parsed_url = urllib.parse.urlparse(obj.file_url)
        return urllib.parse.unquote(parsed_url.path.split('/')[-1])

class AssignmentLinkSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssignmentLink
        fields = '__all__'

class AssignmentSerializer(serializers.ModelSerializer):
    files = AssignmentFileSerializer(many=True, read_only=True)
    links = AssignmentLinkSerializer(many=True, read_only=True)
    submissions_count = serializers.IntegerField(read_only=True)
    class Meta:
        model = Assignment
        fields = '__all__'

class SubmissionFileSerializer(serializers.ModelSerializer):
    file_name = serializers.SerializerMethodField()

    class Meta:
        model = SubmissionFile
        fields = ['id', 'file_url', 'file_type', 'file_size', 'submission', 'file_name']

    def get_file_name(self, obj):
        
        parsed_url = urllib.parse.urlparse(obj.file_url)
        return urllib.parse.unquote(parsed_url.path.split('/')[-1])

class SubmissionSerializer(serializers.ModelSerializer):
    files = SubmissionFileSerializer(many=True, read_only=True)
    student = CustomUserSerializer(read_only=True)
    class Meta:
        model = Submission
        fields = '__all__'

    def get_file_name(self, obj):
        
        path = urlparse(obj.file_url).path
        
        return unquote(path.split('/')[-1])

class MultipleAssignmentLinksSerializer(serializers.Serializer):
    links = serializers.ListField(
        child=serializers.URLField(),
        allow_empty=False
    )