from rest_framework import serializers
from .models import ZoomMeeting, ZoomMeetingParticipant
from apps.courses.serializers import CourseSerializer
from apps.users.serializers import CustomUserSerializer
import time
import base64
import hmac
import hashlib
import json
from django.conf import settings

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

class ZoomSDKAuthSerializer(serializers.Serializer):
    """Серіалізатор для генерації Zoom SDK Auth та надання даних для приєднання до зустрічі"""
    
    # Input fields
    meeting_id = serializers.CharField(write_only=True)
    role = serializers.IntegerField(write_only=True, default=0)
    user_name = serializers.CharField(write_only=True, required=False, allow_blank=True)
    user_email = serializers.CharField(write_only=True, required=False, allow_blank=True)
    
    # Output fields
    sdkKey = serializers.CharField(read_only=True)
    signature = serializers.CharField(read_only=True)
    meetingNumber = serializers.CharField(read_only=True)
    passWord = serializers.CharField(read_only=True, allow_blank=True, allow_null=True)
    userName = serializers.CharField(read_only=True)
    userEmail = serializers.CharField(read_only=True, allow_blank=True)
    outputRole = serializers.IntegerField(read_only=True, source='role')

    def generate_signature(self, meeting_number, role):
        """
        Генерація підпису для SDK Auth
        
        Args:
            meeting_number (str): Номер зустрічі Zoom
            role (int): Роль користувача (0 - учасник, 1 - ведучий)
            
        Returns:
            dict: Підпис та дані для SDK
        """
        
        meeting_number = ''.join(filter(str.isdigit, str(meeting_number)))
        
        sdk_key = settings.ZOOM_SDK_KEY
        sdk_secret = settings.ZOOM_SDK_SECRET
        
        timestamp = int(round(time.time() * 1000)) - 30000
    
        msg = f"{sdk_key}{meeting_number}{timestamp}{role}"
        
        try:
            
            hmac_obj = hmac.new(
                sdk_secret.encode('utf-8'),
                msg.encode('utf-8'),
                hashlib.sha256
            )
            signature = base64.b64encode(hmac_obj.digest()).decode('utf-8')
            
            print(f"Generated signature with: meeting={meeting_number}, role={role}, timestamp={timestamp}")
            print(f"Signature length: {len(signature)}")
            
            return {
                'sdkKey': sdk_key,
                'signature': signature,
                'meetingNumber': meeting_number,
                'role': role,
                'timestamp': timestamp
            }
        except Exception as e:
            print(f"Error generating signature: {str(e)}")
            raise