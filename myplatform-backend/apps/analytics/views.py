from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.contrib.auth import get_user_model
from django.db.models import Count, Q
from django.utils import timezone
from apps.courses.models import Course, Enrollment, CourseCategory
from apps.modules.models import Module
from apps.lessons.models import Lesson
from apps.assignments.models import Assignment, Submission
# Імпортуйте інші необхідні моделі

@login_required
def admin_analytics(request):
    if request.user.role != 'admin':
        return JsonResponse({'error': 'Only admins can access analytics.'}, status=403)

    # Загальна кількість курсів
    total_courses = Course.objects.count()

    # Загальна кількість категорій
    total_categories = CourseCategory.objects.count()

    # Кількість зареєстрованих студентів
    User = get_user_model()
    total_students = User.objects.filter(role='student').count()

    # Кількість активних студентів (використовуємо last_login за останні 30 днів)
    thirty_days_ago = timezone.now() - timezone.timedelta(days=30)
    active_students = User.objects.filter(role='student', last_login__gte=thirty_days_ago).count()

    # Кількість студентів, записаних на курси
    enrolled_students = Enrollment.objects.values('student_id').distinct().count()

    # Загальна кількість модулів
    total_modules = Module.objects.count()

    # Загальна кількість уроків
    total_lessons = Lesson.objects.count()

    # Кількість завершених уроків студентами
    from apps.lessons.models import LessonProgress
    completed_lessons = LessonProgress.objects.count()

    # Кількість завдань
    total_assignments = Assignment.objects.count()

    # Кількість поданих завдань
    total_submissions = Submission.objects.count()

    # Кількість оцінених завдань
    graded_submissions = Submission.objects.filter(status='graded').count()

    # Кількість повернутих завдань
    returned_submissions = Submission.objects.filter(status='returned').count()

    # Формування відповіді
    data = {
        'total_courses': total_courses,
        'total_categories': total_categories,
        'total_students': total_students,
        'active_students_last_30_days': active_students,
        'enrolled_students': enrolled_students,
        'total_modules': total_modules,
        'total_lessons': total_lessons,
        'completed_lessons': completed_lessons,
        'total_assignments': total_assignments,
        'total_submissions': total_submissions,
        'graded_submissions': graded_submissions,
        'returned_submissions': returned_submissions,
        # Додайте інші необхідні метрики
    }

    return JsonResponse(data)
