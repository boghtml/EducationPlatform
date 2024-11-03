from rest_framework import serializers
from .models import Question, Answer
from apps.users.models import CustomUser 

class AnswerSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    profile_image_url = serializers.SerializerMethodField() 

    class Meta:
        model = Answer
        fields = ['id', 'user', 'content', 'created_at', 'updated_at', 'profile_image_url']

    def get_profile_image_url(self, obj):
        return obj.user.profile_image_url

class QuestionSerializer(serializers.ModelSerializer):
    teacher = serializers.StringRelatedField(read_only=True)
    answers = AnswerSerializer(many=True, read_only=True)
    
    class Meta:
        model = Question
        fields = ['id', 'course', 'teacher', 'title', 'description', 'created_at', 'updated_at', 'answers']
