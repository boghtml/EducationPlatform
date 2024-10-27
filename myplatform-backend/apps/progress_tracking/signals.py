# apps/progress_tracking/signals.py

from django.db.models.signals import post_delete, post_save
from django.dispatch import receiver
from apps.lessons.models import Lesson
from .models import LessonProgress, ModuleProgress
from apps.enrollments.models import Enrollment

@receiver(post_delete, sender=Lesson)
def update_module_progress_on_lesson_delete(sender, instance, **kwargs):
    module = instance.module
    enrollments = Enrollment.objects.filter(course=module.course)
    students = enrollments.values_list('student', flat=True)

    for student_id in students:
        total_lessons = module.lessons.count()  # Updated line
        if total_lessons == 0:
            ModuleProgress.objects.filter(student_id=student_id, module=module).delete()
            continue

        completed_lessons = LessonProgress.objects.filter(student_id=student_id, lesson__module=module).count()

        if total_lessons == completed_lessons:
            ModuleProgress.objects.get_or_create(student_id=student_id, module=module)
        else:
            ModuleProgress.objects.filter(student_id=student_id, module=module).delete()

@receiver(post_save, sender=Lesson)
def update_module_progress_on_lesson_add(sender, instance, created, **kwargs):
    if created:
        module = instance.module
        enrollments = Enrollment.objects.filter(course=module.course)
        students = enrollments.values_list('student', flat=True)

        for student_id in students:
            total_lessons = module.lessons.count()  # Updated line
            completed_lessons = LessonProgress.objects.filter(student_id=student_id, lesson__module=module).count()

            if total_lessons == completed_lessons:
                ModuleProgress.objects.get_or_create(student_id=student_id, module=module)
            else:
                ModuleProgress.objects.filter(student_id=student_id, module=module).delete()
