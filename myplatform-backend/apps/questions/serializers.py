from rest_framework import serializers
from .models import Question, Answer

class AnswerSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    
    class Meta:
        model = Answer
        fields = ['id', 'user', 'content', 'created_at', 'updated_at']

class QuestionSerializer(serializers.ModelSerializer):
    teacher = serializers.StringRelatedField(read_only=True)
    answers = AnswerSerializer(many=True, read_only=True)
    
    class Meta:
        model = Question
        fields = ['id', 'course', 'teacher', 'title', 'description', 'created_at', 'updated_at', 'answers']
