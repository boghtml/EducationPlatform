# apps/events/serializers.py

from rest_framework import serializers
from .models import Event, EventFile
from apps.users.serializers import CustomUserSerializer
from django.utils import timezone

class EventFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventFile
        fields = ['id', 'file_url', 'file_type', 'file_name', 'uploaded_at']

class EventSerializer(serializers.ModelSerializer):
    author = CustomUserSerializer(read_only=True)
    files = EventFileSerializer(many=True, read_only=True)
    
    class Meta:
        model = Event
        fields = [
            'id', 'title', 'description', 'content', 'event_type', 
            'status', 'start_date', 'end_date', 'location', 
            'image_url', 'author', 'created_at', 'updated_at',
            'files'
        ]
        read_only_fields = ('author', 'created_at', 'updated_at')

class EventCreateUpdateSerializer(serializers.ModelSerializer):
    
    start_date = serializers.DateTimeField(required=False, allow_null=True)
    end_date = serializers.DateTimeField(required=False, allow_null=True)
    
    class Meta:
        model = Event
        fields = [
            'title', 'description', 'content', 'event_type', 
            'status', 'start_date', 'end_date', 'location', 'image_url'
        ]
    
    def to_internal_value(self, data):
        
        if 'start_date' in data and data['start_date'] == '':
            data['start_date'] = None
        
        if 'end_date' in data and data['end_date'] == '':
            data['end_date'] = None
        
        return super().to_internal_value(data)
    
    def create(self, validated_data):
        request = self.context.get('request')
        validated_data['author'] = request.user
        return super().create(validated_data)
    
    def validate(self, data):
        
        start_date = data.get('start_date')
        end_date = data.get('end_date')
        event_type = data.get('event_type')
        
        if start_date and end_date and end_date < start_date:
            raise serializers.ValidationError({"end_date": "End date cannot be earlier than start date"})
        
        if event_type == 'event' and start_date and self.instance is None:
            now = timezone.now()
            if start_date < now:
                raise serializers.ValidationError({"start_date": "Event start date must be in the future"})
        
        return data