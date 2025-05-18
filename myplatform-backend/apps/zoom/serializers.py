from rest_framework import serializers
from .models import ZoomMeeting, ZoomMeetingParticipant
from apps.courses.serializers import CourseSerializer
from apps.users.serializers import CustomUserSerializer

class ZoomMeetingSerializer(serializers.ModelSerializer):
    """Серіалізатор для Zoom зустрічей"""
    
    course_data = CourseSerializer(source='course', read_only=True)
    created_by_data = CustomUserSerializer(source='created_by', read_only=True)
    can_join = serializers.BooleanField(read_only=True)
    is_active = serializers.BooleanField(read_only=True)
    end_time = serializers.DateTimeField(read_only=True)
    
    class Meta:
        model = ZoomMeeting
        fields = [
            'id', 'uuid', 'course', 'course_data', 'created_by', 'created_by_data',
            'topic', 'description', 'meeting_id', 'meeting_password', 'join_url',
            'start_time', 'duration', 'status', 'created_at', 'updated_at',
            'host_video', 'participant_video', 'join_before_host', 'mute_upon_entry',
            'auto_recording', 'settings_json', 'can_join', 'is_active', 'end_time'
        ]
        read_only_fields = ['uuid', 'meeting_id', 'meeting_password', 'join_url', 
                           'created_at', 'updated_at']

class ZoomMeetingCreateSerializer(serializers.ModelSerializer):
    """Серіалізатор для створення Zoom зустрічей"""
    
    class Meta:
        model = ZoomMeeting
        fields = [
            'course', 'topic', 'description', 'start_time', 'duration',
            'host_video', 'participant_video', 'join_before_host', 'mute_upon_entry',
            'auto_recording', 'settings_json'
        ]

class ZoomMeetingUpdateSerializer(serializers.ModelSerializer):
    """Серіалізатор для оновлення Zoom зустрічей"""
    
    class Meta:
        model = ZoomMeeting
        fields = [
            'topic', 'description', 'start_time', 'duration', 'status',
            'host_video', 'participant_video', 'join_before_host', 'mute_upon_entry',
            'auto_recording', 'settings_json'
        ]

class ZoomMeetingParticipantSerializer(serializers.ModelSerializer):
    """Серіалізатор для учасників Zoom зустрічей"""
    
    user_data = CustomUserSerializer(source='user', read_only=True)
    
    class Meta:
        model = ZoomMeetingParticipant
        fields = [
            'id', 'meeting', 'user', 'user_data', 'joined_at', 'left_at',
            'device_type', 'ip_address', 'time_in_meeting'
        ]
        read_only_fields = ['time_in_meeting']

class ZoomSignatureSerializer(serializers.Serializer):
    """Серіалізатор для генерації Zoom JWT підпису"""
    
    meeting_id = serializers.CharField()
    role = serializers.IntegerField(default=0)
    
    # Поля результату
    signature = serializers.CharField(read_only=True)
    apiKey = serializers.CharField(read_only=True)
    meetingNumber = serializers.CharField(read_only=True)
    timestamp = serializers.IntegerField(read_only=True)