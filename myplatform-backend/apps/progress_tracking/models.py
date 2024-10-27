# apps/progress_tracking/models.py

from django.db import models
from apps.users.models import CustomUser  # Імпортуйте вашу модель користувача
from apps.modules.models import Module  # Імпортуйте модель модуля
from apps.lessons.models import Lesson  # Імпортуйте модель уроку

class ModuleProgress(models.Model):
    student = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    module = models.ForeignKey(Module, on_delete=models.CASCADE)
    completed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('student', 'module')
        indexes = [
            models.Index(fields=['student', 'module']),
        ]

    def __str__(self):
        return f"{self.student} - {self.module}"
        

class LessonProgress(models.Model):
    student = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE)
    completed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('student', 'lesson')
        indexes = [
            models.Index(fields=['student', 'lesson']),
        ]

    def __str__(self):
        return f"{self.student} - {self.lesson}"
