from django.db.models.signals import post_delete, post_save
from django.dispatch import receiver
from apps.lessons.models import Lesson
from .models import LessonProgress, ModuleProgress

@receiver(post_delete, sender=Lesson)
def update_module_progress_on_lesson_delete(sender, instance, **kwargs):
    module = instance.module
    students = ModuleProgress.objects.filter(module=module).values_list('student', flat=True)

    for student_id in students:
        total_lessons = module.lesson_set.count()
        completed_lessons = LessonProgress.objects.filter(student_id=student_id, lesson__module=module).count()

        if total_lessons != completed_lessons:
            # Видаляємо запис про прогрес модуля
            ModuleProgress.objects.filter(student_id=student_id, module=module).delete()

@receiver(post_save, sender=Lesson)
def update_module_progress_on_lesson_add(sender, instance, created, **kwargs):
    if created:
        module = instance.module
        students = ModuleProgress.objects.filter(module=module).values_list('student', flat=True)

        for student_id in students:
            total_lessons = module.lesson_set.count()
            completed_lessons = LessonProgress.objects.filter(student_id=student_id, lesson__module=module).count()

            if total_lessons != completed_lessons:
                # Видаляємо запис про прогрес модуля
                ModuleProgress.objects.filter(student_id=student_id, module=module).delete()
