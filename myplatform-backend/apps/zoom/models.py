from django.db import models
from django.conf import settings
from django.utils import timezone
from apps.courses.models import Course
from datetime import timedelta
import uuid

class ZoomMeeting(models.Model):
    
    STATUS_CHOICES = [
        ('scheduled', 'Scheduled'),
        ('live', 'Live'),
        ('ended', 'Ended'),
        ('canceled', 'Canceled'),
    ]
    
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='zoom_meetings')
    
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='created_meetings')
    
    topic = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    
    meeting_id = models.CharField(max_length=255, blank=True, null=True)
    meeting_password = models.CharField(max_length=50, blank=True, null=True)
    join_url = models.URLField(max_length=500, blank=True, null=True)
    
    start_time = models.DateTimeField()
    duration = models.IntegerField(default=60) 
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='scheduled')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    host_video = models.BooleanField(default=True)
    participant_video = models.BooleanField(default=True)
    join_before_host = models.BooleanField(default=False)
    mute_upon_entry = models.BooleanField(default=True)
    auto_recording = models.CharField(max_length=10, default='none', choices=[
        ('none', 'None'), 
        ('local', 'Local'), 
        ('cloud', 'Cloud')
    ])
    
    settings_json = models.JSONField(blank=True, null=True)
    
    def __str__(self):
        return f"{self.topic} - {self.start_time.strftime('%Y-%m-%d %H:%M')}"
    
    @property
    def end_time(self):
        return self.start_time + timedelta(minutes=self.duration)
    
    @property
    def is_active(self):
        now = timezone.now()
        return self.start_time <= now <= self.end_time and self.status == 'live'
    
    @property
    def can_join(self):
        now = timezone.now()

        return (self.start_time - timedelta(minutes=15)) <= now <= self.end_time and self.status in ['scheduled', 'live']
    
    class Meta:
        ordering = ['-start_time']
        indexes = [
            models.Index(fields=['course']),
            models.Index(fields=['created_by']),
            models.Index(fields=['start_time']),
            models.Index(fields=['status']),
        ]

    def save(self, *args, **kwargs):
        """Перевизначаємо метод save для додаткового логування"""
        is_new = self.pk is None
        print(f"Saving ZoomMeeting: {'new instance' if is_new else f'existing instance {self.pk}'}")
        print(f"ZoomMeeting data: course_id={self.course_id}, meeting_id={self.meeting_id}, created_by_id={self.created_by_id}")
        
        try:
            result = super().save(*args, **kwargs)
            print(f"Successfully saved ZoomMeeting with ID: {self.pk}")
            return result
        except Exception as e:
            print(f"Error saving ZoomMeeting: {str(e)}", exc_info=True)
            raise

class ZoomMeetingParticipant(models.Model):
   
    meeting = models.ForeignKey(ZoomMeeting, on_delete=models.CASCADE, related_name='participants')
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='zoom_participations')
    
    joined_at = models.DateTimeField(null=True, blank=True)
    left_at = models.DateTimeField(null=True, blank=True)
    
    device_type = models.CharField(max_length=50, blank=True, null=True)
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    
    time_in_meeting = models.IntegerField(default=0)  
    
    class Meta:
        unique_together = ['meeting', 'user']
        indexes = [
            models.Index(fields=['meeting', 'user']),
            models.Index(fields=['joined_at']),
        ]