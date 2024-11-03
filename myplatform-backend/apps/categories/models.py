from django.db import models
from apps.courses.models import Course

class CourseCategory(models.Model):
    name = models.CharField(max_length=255, unique=True)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name

class CourseCategoryRelation(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='course_categories')
    category = models.ForeignKey(CourseCategory, on_delete=models.CASCADE, related_name='category_courses')

    class Meta:
        unique_together = ('course', 'category')
