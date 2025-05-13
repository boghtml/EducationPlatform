# apps/events/models.py

from django.db import models
from django.conf import settings
from django.utils import timezone
from django.core.exceptions import ValidationError

class Event(models.Model):
    EVENT_TYPES = (
        ('event', 'Event'),
        ('news', 'News'),
        ('announcement', 'Announcement'),
    )
    
    STATUS_CHOICES = (
        ('draft', 'Draft'),
        ('published', 'Published'),
        ('archived', 'Archived'),
    )
    
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    content = models.TextField(blank=True)
    event_type = models.CharField(max_length=20, choices=EVENT_TYPES, default='event')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='published')
    start_date = models.DateTimeField(null=True, blank=True, default=timezone.now)
    end_date = models.DateTimeField(null=True, blank=True)
    location = models.CharField(max_length=255, blank=True, null=True)
    image_url = models.URLField(max_length=255, blank=True, null=True)
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['author']),
            models.Index(fields=['event_type']),
            models.Index(fields=['status']),
            models.Index(fields=['start_date']),
        ]
    
    def __str__(self):
        return self.title
    
    def clean(self):
        
        if self.end_date and self.start_date and self.end_date < self.start_date:
            raise ValidationError("End date cannot be earlier than start date")
        
        if self.event_type == 'event' and self.start_date and self.start_date < timezone.now() and not self.pk:
            
            raise ValidationError("Event start date must be in the future")

class EventFile(models.Model):
    FILE_TYPES = (
        ('pdf', 'PDF'),
        ('docx', 'Word Document'),
        ('image', 'Image'),
        ('video', 'Video'),
        ('link', 'Link'),
        ('other', 'Other')
    )
    
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='files')
    file_url = models.URLField(max_length=500)
    file_type = models.CharField(max_length=50, choices=FILE_TYPES, default='other')
    file_name = models.CharField(max_length=255, blank=True, null=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        indexes = [
            models.Index(fields=['event']),
        ]
    
    def __str__(self):
        return f"File for {self.event.title}: {self.file_name}"