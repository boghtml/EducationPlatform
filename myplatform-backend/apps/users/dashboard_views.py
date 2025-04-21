from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from apps.assignments.mixins import CsrfExemptSessionAuthentication
from apps.enrollments.models import Enrollment
from apps.assignments.models import Assignment, Submission
from apps.courses.models import Course
from django.utils import timezone
from django.db.models import Count, Q
from datetime import timedelta

class DashboardStatsView(APIView):
    authentication_classes = [CsrfExemptSessionAuthentication]
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        
        # Перевіряємо, що користувач має роль student
        if user.role != 'student':
            return Response({"error": "Цей ендпоінт доступний тільки для студентів"}, status=status.HTTP_403_FORBIDDEN)
        
        # Отримуємо всі курси, на які записаний користувач
        enrollments = Enrollment.objects.filter(student=user)
        enrolled_courses = [enrollment.course for enrollment in enrollments]
        
        # Статистика по завданням
        # 1. Кількість призначених та повернутих завдань
        pending_assignments = Submission.objects.filter(
            student=user, 
            status__in=['assigned', 'returned']
        ).count()
        
        # 2. Кількість виконаних завдань
        completed_assignments = Submission.objects.filter(
            student=user, 
            status__in=['submitted', 'graded']
        ).count()
        
        # 3. Список останніх призначених завдань (з дедлайнами)
        upcoming_deadlines = []
        submissions = Submission.objects.filter(
            student=user,
            status__in=['assigned', 'returned']
        ).select_related('assignment', 'assignment__course')
        
        for submission in submissions:
            assignment = submission.assignment
            if assignment.due_date and assignment.due_date > timezone.now():
                upcoming_deadlines.append({
                    'id': assignment.id,
                    'title': assignment.title,
                    'course_id': assignment.course.id,
                    'course_title': assignment.course.title,
                    'due_date': assignment.due_date,
                    'status': submission.status
                })
        
        # Сортування за найближчим дедлайном
        upcoming_deadlines = sorted(upcoming_deadlines, key=lambda x: x['due_date'])
        
        # Обмеження до 5 найближчих дедлайнів
        upcoming_deadlines = upcoming_deadlines[:5]
        
        # Дані по курсам
        courses_data = []
        for course in enrolled_courses:
            # Отримання прогресу для кожного курсу
            from apps.progress_tracking.models import LessonProgress
            from apps.lessons.models import Lesson
            
            total_lessons = Lesson.objects.filter(module__course=course).count()
            completed_lessons = LessonProgress.objects.filter(
                student=user,
                lesson__module__course=course
            ).exclude(completed_at=None).count()
            
            # Отримання дати останнього відвідування (припустимо, що це дата останнього завершеного уроку)
            last_progress = LessonProgress.objects.filter(
                student=user,
                lesson__module__course=course
            ).exclude(completed_at=None).order_by('-completed_at').first()
            
            last_access = last_progress.completed_at if last_progress else None
            
            # Отримання даних про викладача
            teacher_data = None
            if course.teacher:
                teacher_data = {
                    'id': course.teacher.id,
                    'first_name': course.teacher.first_name,
                    'last_name': course.teacher.last_name,
                    'full_name': f"{course.teacher.first_name} {course.teacher.last_name}".strip() or course.teacher.username
                }
            
            courses_data.append({
                'id': course.id,
                'title': course.title,
                'description': course.description,
                'image_url': course.image_url,
                'status': course.status,
                'duration': course.duration,
                'total_lessons': total_lessons,
                'completed_lessons': completed_lessons,
                'last_access': last_access,
                'teacher': teacher_data
            })
        
        # Отримання рекомендованих курсів (наприклад, 3 випадкових курси, на які користувач не записаний)
        enrolled_course_ids = [course.id for course in enrolled_courses]
        recommended_courses = Course.objects.exclude(id__in=enrolled_course_ids).order_by('?')[:3]
        
        recommended_data = []
        for course in recommended_courses:
            # Отримання рейтингу та кількості студентів (можна реалізувати у вашій системі)
            # Тут використовуємо заглушки
            
            # Обчислення приблизного рейтингу та кількості студентів
            students_count = Enrollment.objects.filter(course=course).count()
            
            # Рейтинг можна обчислювати на основі відгуків, якщо вони є у вашій системі
            # Тут використовуємо заглушку
            rating = round((course.id % 5) * 0.8 + 1.5, 1)  # Просто для прикладу
            if rating > 5:
                rating = 5.0
                
            teacher_data = None
            if course.teacher:
                teacher_data = {
                    'id': course.teacher.id,
                    'first_name': course.teacher.first_name,
                    'last_name': course.teacher.last_name,
                    'full_name': f"{course.teacher.first_name} {course.teacher.last_name}".strip() or course.teacher.username
                }
            
            recommended_data.append({
                'id': course.id,
                'title': course.title,
                'image_url': course.image_url,
                'rating': rating,
                'students_count': students_count,
                'status': course.status,
                'teacher': teacher_data
            })
        
        # Отримання останніх активностей користувача
        recent_activities = []
        
        # 1. Останні завершені уроки
        recent_lessons = LessonProgress.objects.filter(
            student=user
        ).exclude(completed_at=None).order_by('-completed_at')[:3]
        
        for progress in recent_lessons:
            lesson = progress.lesson
            recent_activities.append({
                'type': 'lesson_completed',
                'title': f'Завершено урок "{lesson.title}"',
                'course': lesson.module.course.title,
                'date': progress.completed_at
            })
        
        # 2. Останні відправлені завдання
        recent_submissions = Submission.objects.filter(
            student=user,
            status='submitted'
        ).order_by('-submission_date')[:3]
        
        for submission in recent_submissions:
            assignment = submission.assignment
            recent_activities.append({
                'type': 'assignment_submitted',
                'title': f'Здано завдання "{assignment.title}"',
                'course': assignment.course.title,
                'date': submission.submission_date
            })
        
        # 3. Останні записи на курси
        recent_enrollments = Enrollment.objects.filter(
            student=user
        ).order_by('-enrollment_date')[:3]
        
        for enrollment in recent_enrollments:
            recent_activities.append({
                'type': 'course_enrolled',
                'title': f'Записано на курс "{enrollment.course.title}"',
                'course': enrollment.course.title,
                'date': enrollment.enrollment_date
            })
        
        # Сортування за датою (від найновіших до найстаріших)
        recent_activities = sorted(
            recent_activities, 
            key=lambda x: x['date'] if x['date'] else timezone.now(),
            reverse=True
        )[:5]  # Обмеження до 5 активностей
        
        # Формуємо підсумковий результат
        result = {
            'stats': {
                'total_courses': len(enrolled_courses),
                'total_lessons': sum(course['total_lessons'] for course in courses_data),
                'completed_lessons': sum(course['completed_lessons'] for course in courses_data),
                'pending_assignments': pending_assignments,
                'completed_assignments': completed_assignments,
                'upcoming_deadlines_count': len(upcoming_deadlines)
            },
            'courses': courses_data,
            'upcoming_deadlines': upcoming_deadlines,
            'recommended_courses': recommended_data,
            'recent_activities': recent_activities
        }
        
        return Response(result, status=status.HTTP_200_OK)