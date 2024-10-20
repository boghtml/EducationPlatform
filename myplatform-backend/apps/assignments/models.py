from django.conf import settings
from django.db import models
from apps.courses.models import Course
from apps.users.models import CustomUser

class Assignment(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='assignments')
    teacher = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='created_assignments')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    due_date = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

class AssignmentFile(models.Model):
    assignment = models.ForeignKey(Assignment, on_delete=models.CASCADE, related_name='files')
    file_url = models.URLField(max_length=500)
    file_type = models.CharField(max_length=10, choices=[
        ('pdf', 'PDF'),
        ('video', 'Video'),
        ('docx', 'Docx'),
        ('link', 'Link'),
    ])
    file_size = models.PositiveIntegerField()
    is_temp = models.BooleanField(default=True)

    def __str__(self):
        return f"File for {self.assignment.title}"

class AssignmentLink(models.Model):
    assignment = models.ForeignKey(Assignment, on_delete=models.CASCADE, related_name='links')
    link_url = models.URLField(max_length=500)
    description = models.CharField(max_length=255, blank=True)

    def __str__(self):
        return f"Link for {self.assignment.title}"

class Submission(models.Model):
    STATUS_CHOICES = [
        ('assigned', 'Assigned'),
        ('submitted', 'Submitted'),
        ('graded', 'Graded'),
        ('returned', 'Returned'),
    ]

    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='submissions')
    assignment = models.ForeignKey(Assignment, on_delete=models.CASCADE, related_name='submissions')
    comment = models.TextField(blank=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='assigned')
    grade = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    feedback = models.TextField(blank=True)
    submission_date = models.DateTimeField(auto_now_add=True)
    returned_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ('student', 'assignment')

    def __str__(self):
        return f"Submission by {self.student.username} for {self.assignment.title}"

class SubmissionFile(models.Model):
    submission = models.ForeignKey(Submission, on_delete=models.CASCADE, related_name='files')
    file_url = models.URLField(max_length=500)
    file_type = models.CharField(max_length=10, choices=[
        ('pdf', 'PDF'),
        ('video', 'Video'),
        ('docx', 'Docx'),
        ('link', 'Link'),
    ])
    file_size = models.PositiveIntegerField()

    def __str__(self):
        return f"File for submission {self.submission.id}"
