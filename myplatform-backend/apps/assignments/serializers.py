from rest_framework import serializers
from .models import Assignment, AssignmentFile, AssignmentLink, Submission, SubmissionFile
from apps.users.serializers import CustomUserSerializer

class AssignmentFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssignmentFile
        fields = '__all__'

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
    class Meta:
        model = SubmissionFile
        fields = '__all__'

class SubmissionSerializer(serializers.ModelSerializer):
    files = SubmissionFileSerializer(many=True, read_only=True)
    student = CustomUserSerializer(read_only=True)
    class Meta:
        model = Submission
        fields = '__all__'

class MultipleAssignmentLinksSerializer(serializers.Serializer):
    links = serializers.ListField(
        child=serializers.URLField(),
        allow_empty=False
    )