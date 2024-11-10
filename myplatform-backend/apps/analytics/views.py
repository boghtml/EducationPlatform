from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.contrib.auth import get_user_model
from django.db.models import Count, Q
from django.utils import timezone
from apps.courses.models import Course
from apps.enrollments.models import Enrollment
from apps.categories.models import CourseCategory
from apps.modules.models import Module
from apps.lessons.models import Lesson
from apps.assignments.models import Assignment, Submission
from apps.progress_tracking.models import LessonProgress, ModuleProgress
from apps.users.models import CustomUser 


from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.core.cache import cache
from django.db.models import Count, Avg, Sum
from django.utils import timezone
from datetime import timedelta

from apps.assignments.mixins import CsrfExemptSessionAuthentication


class AdminAnalyticsView(APIView):
    authentication_classes = [CsrfExemptSessionAuthentication]
    permission_classes = [IsAuthenticated]

    def get_cached_data(self, key, callback, timeout=300):
        """Отримання кешованих даних або їх обчислення"""
        data = cache.get(key)
        if data is None:
            data = callback()
            cache.set(key, data, timeout)
        return data

    def get_user_statistics(self):
        """Статистика користувачів"""
        now = timezone.now()
        thirty_days_ago = now - timedelta(days=30)
        seven_days_ago = now - timedelta(days=7)

        return {
            'total_students': CustomUser.objects.filter(role='student').count(),
            'total_teachers': CustomUser.objects.filter(role='teacher').count(),
            'active_students': {
                'last_7_days': CustomUser.objects.filter(
                    role='student', 
                    last_login__gte=seven_days_ago
                ).count(),
                'last_30_days': CustomUser.objects.filter(
                    role='student', 
                    last_login__gte=thirty_days_ago
                ).count(),
            },
            'new_registrations': {
                'last_7_days': CustomUser.objects.filter(
                    date_joined__gte=seven_days_ago
                ).count(),
                'last_30_days': CustomUser.objects.filter(
                    date_joined__gte=thirty_days_ago
                ).count(),
            }
        }

    def get_course_statistics(self):
        """Статистика курсів"""
        try:
            total_courses = Course.objects.count()
            total_modules = Module.objects.count()
            total_lessons = Lesson.objects.count()

            categories_stats = []
            for category in CourseCategory.objects.all():
                course_count = category.category_courses.count()  
                if course_count > 0:  
                    categories_stats.append({
                        'name': category.name,
                        'course_count': course_count
                    })
                    
            popular_courses = []
            for course in Course.objects.all():
                enrollment_count = Enrollment.objects.filter(course=course).count()
                popular_courses.append({
                    'title': course.title,
                    'student_count': enrollment_count,
                    'teacher': course.teacher.get_full_name() if course.teacher else 'No teacher'
                })
            
            popular_courses.sort(key=lambda x: x['student_count'], reverse=True)
            popular_courses = popular_courses[:5]

            teachers_stats = []
            for teacher in CustomUser.objects.filter(role='teacher'):
                course_count = Course.objects.filter(teacher=teacher).count()
                if course_count > 0:
                    teachers_stats.append({
                        'name': teacher.get_full_name(),
                        'username': teacher.username,
                        'course_count': course_count,
                        'student_count': Enrollment.objects.filter(course__teacher=teacher).count()
                    })

            return {
                'total_courses': total_courses,
                'categories': categories_stats,
                'average_modules_per_course': (
                    round(total_modules / total_courses, 2) if total_courses > 0 else 0
                ),
                'average_lessons_per_module': (
                    round(total_lessons / total_modules, 2) if total_modules > 0 else 0
                ),
                'most_popular_courses': popular_courses,
                'courses_with_modules': Course.objects.filter(modules__isnull=False).distinct().count(),
                'courses_with_assignments': Course.objects.filter(assignments__isnull=False).distinct().count(),
                'courses_by_status': {
                    'free': Course.objects.filter(status='free').count(),
                    'premium': Course.objects.filter(status='premium').count()
                },
                'courses_by_teacher': teachers_stats,
                'total_enrollments': Enrollment.objects.count(),
                'average_enrollments_per_course': (
                    round(Enrollment.objects.count() / total_courses, 2) if total_courses > 0 else 0
                ),
                'recent_courses': [{
                    'title': course.title,
                    'created_at': course.created_at,
                    'teacher_name': course.teacher.get_full_name() if course.teacher else 'No teacher',
                    'status': course.status,
                    'enrollment_count': Enrollment.objects.filter(course=course).count()
                } for course in Course.objects.order_by('-created_at')[:5]],
      
                'price_statistics': {
                    'average_price': Course.objects.filter(status='premium').aggregate(Avg('price'))['price__avg'],
                    'total_premium_courses': Course.objects.filter(status='premium').count(),
                    'total_free_courses': Course.objects.filter(status='free').count()
                }
            }
        except Exception as e:
            print(f"Error in course statistics: {str(e)}")
            return {
                'total_courses': Course.objects.count(),
                'categories': [],
                'average_modules_per_course': 0,
                'average_lessons_per_module': 0,
                'most_popular_courses': [],
                'courses_with_modules': 0,
                'courses_with_assignments': 0,
                'courses_by_status': {'free': 0, 'premium': 0},
                'courses_by_teacher': [],
                'total_enrollments': 0,
                'average_enrollments_per_course': 0,
                'recent_courses': [],
                'price_statistics': {
                    'average_price': 0,
                    'total_premium_courses': 0,
                    'total_free_courses': 0
                }
            }
    
    def get_progress_statistics(self):
        """Статистика прогресу"""
        try:
            total_lessons = Lesson.objects.count()
            total_modules = Module.objects.count()

            completed_lessons = LessonProgress.objects.exclude(completed_at=None).count()
            completed_modules = ModuleProgress.objects.exclude(completed_at=None).count()

            return {
                'total_lessons_completed': completed_lessons,
                'total_modules_completed': completed_modules,
                'average_completion_rate': {
                    'lessons': (
                        round((completed_lessons / total_lessons * 100), 2)
                        if total_lessons > 0 else 0
                    ),
                    'modules': (
                        round((completed_modules / total_modules * 100), 2)
                        if total_modules > 0 else 0
                    )
                },

                'progress_details': {
                    'total_lessons': total_lessons,
                    'total_modules': total_modules,
                    'completion_by_student': self.get_student_completion_stats()
                }
            }
            
        except Exception as e:
            print(f"Error in progress statistics: {str(e)}")
            return {
                'total_lessons_completed': 0,
                'total_modules_completed': 0,
                'average_completion_rate': {
                    'lessons': 0,
                    'modules': 0
                },
                'progress_details': {
                    'total_lessons': 0,
                    'total_modules': 0,
                    'completion_by_student': []
                }
            }

    def get_student_completion_stats(self):
        """Отримання статистики завершення по студентах"""
        try:
            students = CustomUser.objects.filter(role='student')
            student_stats = []

            for student in students:
                completed_lessons = LessonProgress.objects.filter(
                    student=student
                ).exclude(completed_at=None).count()
                
                completed_modules = ModuleProgress.objects.filter(
                    student=student
                ).exclude(completed_at=None).count()

                if completed_lessons > 0 or completed_modules > 0:
                    student_stats.append({
                        'student_name': student.get_full_name(),
                        'username': student.username,
                        'completed_lessons': completed_lessons,
                        'completed_modules': completed_modules
                    })

            return student_stats
        except Exception as e:
            print(f"Error in student completion stats: {str(e)}")
            return []
    
        
    def get_assignment_statistics(self):
        """Статистика завдань"""
        try:
            total_assignments = Assignment.objects.count()
            total_submissions = Submission.objects.count()
            
            submissions_by_status = Submission.objects.values('status').annotate(
                count=Count('id')
            )
            
            status_counts = {
                submission['status']: submission['count']
                for submission in submissions_by_status
            }

            return {
                'total_assignments': total_assignments,
                'submissions': {
                    'total': total_submissions,
                    'graded': status_counts.get('graded', 0),
                    'returned': status_counts.get('returned', 0),
                    'submitted': status_counts.get('submitted', 0),
                    'assigned': status_counts.get('assigned', 0)
                },
                'average_grade': Submission.objects.filter(
                    status='graded'
                ).exclude(grade=None).aggregate(Avg('grade'))['grade__avg'] or 0,
                'submission_rate': (
                    round((total_submissions / total_assignments * 100), 2)
                    if total_assignments > 0 else 0
                ),
                'assignment_details': self.get_assignment_details()
            }
        except Exception as e:
            print(f"Error in assignment statistics: {str(e)}")
            return {
                'total_assignments': 0,
                'submissions': {
                    'total': 0,
                    'graded': 0,
                    'returned': 0,
                    'submitted': 0,
                    'assigned': 0
                },
                'average_grade': 0,
                'submission_rate': 0,
                'assignment_details': []
            }


    def get_assignment_details(self):
        """Детальна статистика по завданням"""
        try:
            assignments = Assignment.objects.all()
            assignment_stats = []

            for assignment in assignments:
                submissions = Submission.objects.filter(assignment=assignment)
                
                stats = {
                    'title': assignment.title,
                    'course': assignment.course.title,
                    'total_submissions': submissions.count(),
                    'status_breakdown': {
                        status: submissions.filter(status=status).count()
                        for status in ['submitted', 'graded', 'returned', 'assigned']
                    },
                    'average_grade': submissions.filter(
                        status='graded'
                    ).exclude(grade=None).aggregate(Avg('grade'))['grade__avg'] or 0
                }
                
                assignment_stats.append(stats)

            return assignment_stats
        except Exception as e:
            print(f"Error in assignment details: {str(e)}")
            return []

    def get(self, request):
        if request.user.role != 'admin':
            return Response({"error": "Only admin can access analytics"}, status=403)

        analytics_data = {
            'timestamp': timezone.now(),
            'users': self.get_cached_data('user_stats', self.get_user_statistics),
            'courses': self.get_cached_data('course_stats', self.get_course_statistics),
            'progress': self.get_cached_data('progress_stats', self.get_progress_statistics),
            'assignments': self.get_cached_data('assignment_stats', self.get_assignment_statistics)
        }

        return Response(analytics_data)
    

class CourseAnalyticsView(APIView):
    authentication_classes = [CsrfExemptSessionAuthentication]
    permission_classes = [IsAuthenticated]

    def get_enrollment_statistics(self, course):
        """Статистика зарахувань на курс"""
        enrollments = Enrollment.objects.filter(course=course)
        thirty_days_ago = timezone.now() - timedelta(days=30)
        
        return {
            'total_enrollments': enrollments.count(),
            'new_enrollments_30_days': enrollments.filter(
                enrollment_date__gte=thirty_days_ago
            ).count(),
            'active_students': enrollments.filter(
                student__last_login__gte=thirty_days_ago
            ).count()
        }

    def get_progress_statistics(self, course):
        """Статистика прогресу по курсу"""
        modules = course.modules.all()
        lessons = Lesson.objects.filter(module__course=course)
        
        module_completion = {}
        for module in modules:
            completed_count = ModuleProgress.objects.filter(
                module=module
            ).exclude(completed_at=None).count()
            module_completion[module.title] = completed_count

        lesson_completion = {
            'total_completed': LessonProgress.objects.filter(
                lesson__module__course=course
            ).exclude(completed_at=None).count(),
            'total_lessons': lessons.count(),
            'completion_percentage': 0  
        }

        if lessons.count() > 0:
            lesson_completion['completion_percentage'] = round(
                (lesson_completion['total_completed'] / lesson_completion['total_lessons']) * 100,
                2
            )

        return {
            'module_completion': module_completion,
            'lesson_completion': lesson_completion,
            'detailed_module_progress': self.get_detailed_module_progress(course),
            'student_progress': self.get_student_progress(course)
        }

    def get_detailed_module_progress(self, course):
        """Детальна статистика по модулях"""
        modules = course.modules.all()
        detailed_progress = []

        for module in modules:
            module_stats = {
                'title': module.title,
                'total_lessons': module.lessons.count(),
                'completed_lessons': LessonProgress.objects.filter(
                    lesson__module=module
                ).exclude(completed_at=None).count(),
                'students_completed': ModuleProgress.objects.filter(
                    module=module
                ).exclude(completed_at=None).count()
            }
            detailed_progress.append(module_stats)

        return detailed_progress

    def get_student_progress(self, course):
        """Статистика прогресу по студентах"""
        enrollments = Enrollment.objects.filter(course=course)
        student_progress = []

        for enrollment in enrollments:
            student = enrollment.student
            completed_lessons = LessonProgress.objects.filter(
                student=student,
                lesson__module__course=course
            ).exclude(completed_at=None).count()

            completed_modules = ModuleProgress.objects.filter(
                student=student,
                module__course=course
            ).exclude(completed_at=None).count()

            student_progress.append({
                'student_name': f"{student.first_name} {student.last_name}",
                'username': student.username,
                'completed_lessons': completed_lessons,
                'completed_modules': completed_modules,
                'last_activity': student.last_login
            })

        return student_progress

    def get_assignment_statistics(self, course):
        """Статистика завдань курсу"""
        assignments = Assignment.objects.filter(course=course)
        submissions = Submission.objects.filter(assignment__course=course)
        
        submission_stats = {
            'total': submissions.count(),
            'graded': submissions.filter(status='graded').count(),
            'returned': submissions.filter(status='returned').count(),
            'pending': submissions.filter(status='submitted').count(),
            'assigned': submissions.filter(status='assigned').count()
        }

        avg_grade = submissions.filter(
            status='graded'
        ).exclude(grade=None).aggregate(Avg('grade'))['grade__avg']

        assignment_details = []
        for assignment in assignments:
            assignment_submissions = submissions.filter(assignment=assignment)
            assignment_details.append({
                'title': assignment.title,
                'total_submissions': assignment_submissions.count(),
                'graded': assignment_submissions.filter(status='graded').count(),
                'average_grade': assignment_submissions.filter(
                    status='graded'
                ).exclude(grade=None).aggregate(Avg('grade'))['grade__avg'],
                'on_time_submissions': assignment_submissions.filter(
                    submission_date__lte=assignment.due_date
                ).count() if assignment.due_date else None
            })

        return {
            'total_assignments': assignments.count(),
            'submissions': submission_stats,
            'average_grade': round(avg_grade, 2) if avg_grade else 0,
            'assignment_details': assignment_details,
            'submission_timeline': self.get_submission_timeline(course)
        }

    def get_submission_timeline(self, course):
        """Отримання таймлайну здач завдань"""
        submissions = Submission.objects.filter(
            assignment__course=course
        ).order_by('submission_date')
        
        timeline = []
        for submission in submissions:
            timeline.append({
                'date': submission.submission_date,
                'assignment': submission.assignment.title,
                'student': submission.student.username,
                'status': submission.status
            })
        
        return timeline

    def get(self, request, course_id):
        if request.user.role != 'admin':
            return Response({"error": "Only admin can access analytics"}, status=403)

        try:
            course = Course.objects.get(id=course_id)
        except Course.DoesNotExist:
            return Response({"error": "Course not found"}, status=404)

        cache_key = f'course_analytics_{course_id}'
        cached_data = cache.get(cache_key)

        if cached_data is None:
            analytics_data = {
                'course_info': {
                    'title': course.title,
                    'teacher': course.teacher.get_full_name(),
                    'start_date': course.start_date,
                    'end_date': course.end_date,
                    'status': course.status,
                    'total_students': Enrollment.objects.filter(course=course).count()
                },
                'enrollments': self.get_enrollment_statistics(course),
                'progress': self.get_progress_statistics(course),
                'assignments': self.get_assignment_statistics(course),
                'timestamp': timezone.now()
            }
            cache.set(cache_key, analytics_data, 300)  
            return Response(analytics_data)

        return Response(cached_data)
    
from django.db.models import Count, Avg, Sum
from django.db.models.functions import TruncMonth, TruncDay
from datetime import timedelta

class AnalyticsDataView(APIView):
    authentication_classes = [CsrfExemptSessionAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'admin':
            return Response({"error": "Only admin can access analytics"}, status=403)

        chart_type = request.query_params.get('type', 'enrollment_trends')
        period = request.query_params.get('period', '30')

        try:
            if chart_type == 'enrollment_trends':
                data = self.get_enrollment_trends(period)
            elif chart_type == 'course_popularity':
                data = self.get_course_popularity()
            elif chart_type == 'student_progress':
                data = self.get_student_progress_stats()
            elif chart_type == 'assignment_completion':
                data = self.get_assignment_completion_stats()
            elif chart_type == 'user_activity':
                data = self.get_user_activity(period)
            else:
                return Response({"error": "Invalid chart type"}, status=400)

            return Response(data)
        except Exception as e:
            return Response({"error": str(e)}, status=500)

    def get_enrollment_trends(self, period):
        """Тренди зарахувань на курси"""
        end_date = timezone.now()
        start_date = end_date - timedelta(days=int(period))
        
        enrollments = Enrollment.objects.filter(
            enrollment_date__gte=start_date
        ).annotate(
            date=TruncDay('enrollment_date')
        ).values('date').annotate(
            count=Count('id')
        ).order_by('date')

        return {
            'title': 'Enrollment Trends',
            'type': 'line',
            'labels': [item['date'].strftime('%Y-%m-%d') for item in enrollments],
            'datasets': [{
                'label': 'New Enrollments',
                'data': [item['count'] for item in enrollments]
            }]
        }

    def get_course_popularity(self):
        """Популярність курсів"""
        courses = Course.objects.annotate(
            student_count=Count('enrollment'),
            completed_modules=Count(
                'modules__moduleprogress',  
                filter=~Q(modules__moduleprogress__completed_at=None)
            ),
            average_grade=Avg(
                'assignments__submissions__grade',  
                filter=Q(assignments__submissions__status='graded')
            )
        )

        return {
            'title': 'Course Popularity',
            'type': 'bar',
            'labels': [course.title for course in courses],
            'datasets': [
                {
                    'label': 'Enrolled Students',
                    'data': [course.student_count for course in courses]
                },
                {
                    'label': 'Completed Modules',
                    'data': [course.completed_modules for course in courses]
                },
                {
                    'label': 'Average Grade',
                    'data': [float(round(course.average_grade, 2)) if course.average_grade else 0 for course in courses]
                }
            ]
        }

    def get_student_progress_stats(self):
        """Статистика прогресу студентів"""
        students = CustomUser.objects.filter(role='student').annotate(
            courses_enrolled=Count('enrollment'),
            completed_modules=Count(
                'moduleprogress', 
                filter=~Q(moduleprogress__completed_at=None)
            ),
            completed_lessons=Count(
                'lessonprogress',
                filter=~Q(lessonprogress__completed_at=None)
            ),
            assignments_submitted=Count('submissions'),
            average_grade=Avg(
                'submissions__grade',
                filter=Q(submissions__status='graded')
            )
        )

        progress_groups = {
            'Excellent': 0,
            'Good': 0,
            'Average': 0,
            'Below Average': 0
        }

        for student in students:
            avg_grade = student.average_grade or 0
            if avg_grade >= 90:
                progress_groups['Excellent'] += 1
            elif avg_grade >= 75:
                progress_groups['Good'] += 1
            elif avg_grade >= 60:
                progress_groups['Average'] += 1
            else:
                progress_groups['Below Average'] += 1

        return {
            'title': 'Student Progress Distribution',
            'type': 'pie',
            'labels': list(progress_groups.keys()),
            'datasets': [{
                'data': list(progress_groups.values()),
                'backgroundColor': [
                    '#4CAF50', 
                    '#2196F3',  
                    '#FFC107', 
                    '#F44336'  
                ]
            }]
        }

    def get_assignment_completion_stats(self):
        """Статистика виконання завдань"""
        try:
            
            status_stats = Submission.objects.values('status').annotate(
                count=Count('id')
            ).order_by('status')

            total_assignments = Assignment.objects.count()
            total_submissions = Submission.objects.count()

            submission_status_data = {
                'labels': [],
                'data': [],
                'backgroundColor': []
            }

            status_colors = {
                'assigned': '#9E9E9E',   
                'submitted': '#2196F3',    
                'graded': '#4CAF50',      
                'returned': '#FFC107'     
            }

            for stat in status_stats:
                submission_status_data['labels'].append(stat['status'].capitalize())
                submission_status_data['data'].append(stat['count'])
                submission_status_data['backgroundColor'].append(
                    status_colors.get(stat['status'], '#9E9E9E')
                )

            time_stats = {
                'on_time': Submission.objects.filter(
                    submission_date__lte=F('assignment__due_date')
                ).count(),
                'late': Submission.objects.filter(
                    submission_date__gt=F('assignment__due_date')
                ).count()
            }

            grade_stats = Submission.objects.filter(
                status='graded'
            ).aggregate(
                avg_grade=Avg('grade'),
                max_grade=Max('grade'),
                min_grade=Min('grade')
            )

            return {
                'overview': {
                    'total_assignments': total_assignments,
                    'total_submissions': total_submissions,
                    'completion_rate': round((total_submissions / total_assignments * 100), 2) if total_assignments > 0 else 0
                },
                'submission_status': {
                    'type': 'doughnut',
                    'data': {
                        'labels': submission_status_data['labels'],
                        'datasets': [{
                            'data': submission_status_data['data'],
                            'backgroundColor': submission_status_data['backgroundColor']
                        }]
                    }
                },
                'submission_timing': {
                    'type': 'pie',
                    'data': {
                        'labels': ['On Time', 'Late'],
                        'datasets': [{
                            'data': [time_stats['on_time'], time_stats['late']],
                            'backgroundColor': ['#4CAF50', '#F44336']
                        }]
                    }
                },
                'grades': {
                    'average': round(grade_stats['avg_grade'] or 0, 2),
                    'highest': grade_stats['max_grade'] or 0,
                    'lowest': grade_stats['min_grade'] or 0
                }
            }
        except Exception as e:
            print(f"Error in get_assignment_completion_stats: {str(e)}")
            return {
                'overview': {
                    'total_assignments': 0,
                    'total_submissions': 0,
                    'completion_rate': 0
                },
                'submission_status': {
                    'type': 'doughnut',
                    'data': {
                        'labels': [],
                        'datasets': [{'data': [], 'backgroundColor': []}]
                    }
                },
                'submission_timing': {
                    'type': 'pie',
                    'data': {
                        'labels': ['On Time', 'Late'],
                        'datasets': [{'data': [0, 0], 'backgroundColor': ['#4CAF50', '#F44336']}]
                    }
                },
                'grades': {
                    'average': 0,
                    'highest': 0,
                    'lowest': 0
                }
            }

    def get_user_activity(self, period):
        """Активність користувачів"""
        end_date = timezone.now()
        start_date = end_date - timedelta(days=int(period))
        
        daily_activity = CustomUser.objects.filter(
            last_login__gte=start_date
        ).annotate(
            date=TruncDay('last_login')
        ).values('date').annotate(
            count=Count('id')
        ).order_by('date')

        role_activity = CustomUser.objects.filter(
            last_login__gte=start_date
        ).values('role').annotate(
            count=Count('id')
        )

        return {
            'daily_activity': {
                'type': 'line',
                'labels': [act['date'].strftime('%Y-%m-%d') for act in daily_activity],
                'datasets': [{
                    'label': 'Active Users',
                    'data': [act['count'] for act in daily_activity],
                    'borderColor': '#2196F3',
                    'fill': False
                }]
            },
            'role_activity': {
                'type': 'pie',
                'labels': [act['role'] for act in role_activity],
                'datasets': [{
                    'data': [act['count'] for act in role_activity],
                    'backgroundColor': [
                        '#4CAF50',  
                        '#2196F3', 
                        '#FFC107'   
                    ]
                }]
            }
        }