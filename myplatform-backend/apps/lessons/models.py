from django.db import models
from apps.modules.models import Module

class Lesson(models.Model):
    module = models.ForeignKey(Module, on_delete=models.CASCADE, related_name='lessons')
    title = models.CharField(max_length=255)
    content = models.TextField()
    duration = models.IntegerField(default=60)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title


class LessonFile(models.Model):
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name='files')
    file_url = models.CharField(max_length=255)  # Посилання на файл
    file_type = models.CharField(max_length=50, choices=[('pdf', 'PDF'), ('video', 'Video'), ('docx', 'DOCX'), ('link', 'Link')])  # Тип файлу
    file_size = models.IntegerField()  # Розмір файлу
    is_temp = models.BooleanField(default=True)  # Позначення тимчасового файлу
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.file_type} - {self.file_url}'


class LessonLink(models.Model):
    lesson = models.ForeignKey('Lesson', on_delete=models.CASCADE, related_name='links')
    link_url = models.URLField()
    description = models.CharField(max_length=255, default="")  # Змінюємо на порожній рядок за замовчуванням
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.link_url
