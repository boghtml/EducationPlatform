from rest_framework import viewsets, generics, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db.models import Q
from django.conf import settings

from .models import ZoomMeeting, ZoomMeetingParticipant
from .serializers import (
    ZoomMeetingSerializer, 
    ZoomMeetingCreateSerializer,
    ZoomMeetingUpdateSerializer,
    ZoomMeetingParticipantSerializer,
    ZoomSDKAuthSerializer
)
from apps.courses.models import Course
from apps.enrollments.models import Enrollment
from apps.assignments.mixins import CsrfExemptSessionAuthentication

from .utils import create_zoom_meeting, generate_sdk_signature

class ZoomMeetingViewSet(viewsets.ModelViewSet):
    """Viewset для Zoom зустрічей"""
    serializer_class = ZoomMeetingSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [CsrfExemptSessionAuthentication]
    
    def get_queryset(self):
        user = self.request.user
        print(f"Fetching meetings for user: {user.id}, role: {user.role}")
        
        queryset = None
        
        if user.role == 'admin':
            queryset = ZoomMeeting.objects.all()
            print(f"Admin user - returning all meetings")
        
        elif user.role == 'teacher':
            queryset = ZoomMeeting.objects.filter(
                Q(created_by=user) | Q(course__teacher=user)
            ).distinct()
            print(f"Teacher user - returning teacher's meetings")
            
        else:
            enrolled_courses = Enrollment.objects.filter(
                student=user
            ).values_list('course_id', flat=True)
            print(f"Student user - enrolled in courses: {list(enrolled_courses)}")
            
            queryset = ZoomMeeting.objects.filter(course_id__in=enrolled_courses)
        
        # Log the number of meetings found
        if queryset is not None:
            count = queryset.count()
            print(f"Found {count} meetings for user {user.id}")
            
            # If empty, log the total meetings in the database for debugging
            if count == 0:
                total_meetings = ZoomMeeting.objects.all().count()
                print(f"Total meetings in database: {total_meetings}")
                
                # If there are meetings in the database, log a few for debugging
                if total_meetings > 0:
                    sample_meetings = ZoomMeeting.objects.all()[:5]
                    print(f"Sample meetings: {[(m.id, m.course_id, m.created_by_id) for m in sample_meetings]}")
        
        return queryset
    
    def get_serializer_class(self):
        if self.action == 'create':
            return ZoomMeetingCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return ZoomMeetingUpdateSerializer
        return ZoomMeetingSerializer
    
    def perform_create(self, serializer):
        print("Starting Zoom meeting creation process")
        
        user = self.request.user
        print(f"User attempting to create meeting: {user.id} ({user.username}), role: {user.role}")
        
        course_id = serializer.validated_data.get('course').id
        course = get_object_or_404(Course, id=course_id)
        print(f"Creating meeting for course: {course_id} ({course.title})")
            
        if user.role == 'student':
            return Response(
                {"error": "Студенти не можуть створювати зустрічі"}, 
                status=status.HTTP_403_FORBIDDEN
            )
            
        if user.role == 'teacher' and course.teacher.id != user.id:
            return Response(
                {"error": "Ви не є викладачем цього курсу"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            # Налаштування для Zoom API
            topic = serializer.validated_data.get('topic')
            description = serializer.validated_data.get('description', '')
            start_time = serializer.validated_data.get('start_time').isoformat()
            duration = serializer.validated_data.get('duration')
            
            # Додаткові налаштування
            api_settings = {
                "host_video": serializer.validated_data.get('host_video', True),
                "participant_video": serializer.validated_data.get('participant_video', True),
                "join_before_host": serializer.validated_data.get('join_before_host', False),
                "mute_upon_entry": serializer.validated_data.get('mute_upon_entry', True),
                "auto_recording": serializer.validated_data.get('auto_recording', 'none')
            }
            
            # Створюємо зустріч через Zoom API
            print(f"Creating real Zoom meeting via API for course {course.id}: {topic}")
            
            zoom_response = create_zoom_meeting(
                topic=topic,
                description=description,
                start_time=start_time,
                duration=duration,
                settings=api_settings
            )
            
            print(f"Zoom API response received for meeting '{topic}'")
            print(f"Meeting ID: {zoom_response['id']}, Password: {zoom_response.get('password', 'None')}")
            
            # Extract meeting data from the standardized response
            zoom_data = {
                "meeting_id": zoom_response['id'],
                "meeting_password": zoom_response.get('password', ''),
                "join_url": zoom_response.get('join_url', '')
            }
            
            # Зберігаємо зустріч в базу даних
            from django.db import transaction
            
            with transaction.atomic():
                meeting = serializer.save(
                    created_by=user,
                    **zoom_data
                )
                print(f"Successfully saved meeting to database with ID: {meeting.id}")
                
                # Додаткова перевірка збереження
                saved_meeting = ZoomMeeting.objects.get(id=meeting.id)
                print(f"Verified saved meeting: ID={saved_meeting.id}, meeting_id={saved_meeting.meeting_id}")
            
            return meeting
                
        except Exception as e:
            import traceback
            error_traceback = traceback.format_exc()
            print(f"ERROR: Error in Zoom meeting creation: {str(e)}")
            print(f"Traceback: {error_traceback}")
            
            # Повертаємо JSON-відповідь з детальною інформацією про помилку
            return Response(
                {
                    "error": f"Не вдалося створити Zoom зустріч: {str(e)}",
                    "error_type": type(e).__name__,
                    "traceback": error_traceback
                }, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def perform_update(self, serializer):
        
        user = self.request.user
        meeting = self.get_object()
        
        if user.role == 'student':
            return Response(
                {"error": "Студенти не можуть оновлювати зустрічі"}, 
                status=status.HTTP_403_FORBIDDEN
            )
            
        if user.role == 'teacher' and meeting.created_by.id != user.id and meeting.course.teacher.id != user.id:
            return Response(
                {"error": "Ви не маєте прав для оновлення цієї зустрічі"}, 
                status=status.HTTP_403_FORBIDDEN
            )
            
        return serializer.save()
    
    @action(detail=False, methods=['get'])
    def upcoming(self, request):
        """Отримання майбутніх зустрічей"""
        now = timezone.now()
        queryset = self.get_queryset().filter(
            start_time__gte=now - timezone.timedelta(minutes=15),
            status__in=['scheduled', 'live']
        )
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def course_meetings(self, request):
        """Отримання зустрічей для конкретного курсу"""
        course_id = request.query_params.get('course_id')
        if not course_id:
            return Response(
                {"error": "Вкажіть course_id у параметрах запиту"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
            
        queryset = self.get_queryset().filter(course_id=course_id)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def join(self, request, pk=None):
        """Приєднання до зустрічі з використанням SDK Auth"""
        meeting = self.get_object()
        user = request.user
        
        if not meeting.can_join:
            return Response(
                {"error": "Неможливо приєднатися до цієї зустрічі зараз"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Ensure we have a valid meeting ID and password
        if not meeting.meeting_id or not meeting.meeting_id.strip():
            return Response(
                {"error": "ID зустрічі Zoom не знайдено"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
            
        if not meeting.meeting_password or not meeting.meeting_password.strip():
            print(f"Warning: Meeting {meeting.id} has no password")
        
        # Get the actual Zoom meeting ID
        meeting_id = meeting.meeting_id.strip()
        
        # Determine if user is host
        is_host = user.role in ['teacher', 'admin'] and (user.id == meeting.created_by.id or user.id == meeting.course.teacher.id)
        role = 1 if is_host else 0
        
        # Generate SDK auth data
        sdk_auth_data = generate_sdk_signature(
            meeting_number=meeting_id, 
            role=role
        )
        
        # Add meeting details to the SDK data
        sdk_auth_data.update({
            'passWord': meeting.meeting_password,
            'userName': f"{user.first_name} {user.last_name}".strip() or user.username,
            'userEmail': user.email,
            'meetingNumber': meeting_id,
            'leaveUrl': f"/courses/{meeting.course.id}/discussions" if meeting.course else "/dashboard"
        })
        
        # Record participant joining
        participant, created = ZoomMeetingParticipant.objects.update_or_create(
            meeting=meeting,
            user=user,
            defaults={
                'joined_at': timezone.now(),
                'device_type': request.META.get('HTTP_USER_AGENT', '')[:50],
                'ip_address': request.META.get('REMOTE_ADDR')
            }
        )
        
        return Response({
            'meeting': ZoomMeetingSerializer(meeting).data,
            'sdk_data': sdk_auth_data,
            'is_host': is_host
        })

    @action(detail=True, methods=['post'])
    def leave(self, request, pk=None):
        """Вихід з зустрічі"""
        meeting = self.get_object()
        user = request.user
        
        try:
            participant = ZoomMeetingParticipant.objects.get(meeting=meeting, user=user)
            
            if participant.joined_at:
                
                left_at = timezone.now()
                time_spent = (left_at - participant.joined_at).total_seconds()
                
                participant.left_at = left_at
                participant.time_in_meeting = time_spent
                participant.save()
                
            return Response({"message": "Вихід з зустрічі зафіксовано"})
            
        except ZoomMeetingParticipant.DoesNotExist:
            return Response(
                {"error": "Запис про участь не знайдено"}, 
                status=status.HTTP_404_NOT_FOUND
            )

class ZoomSDKAuthView(generics.GenericAPIView):
    """View для отримання Zoom SDK Auth для веб-клієнта"""
    serializer_class = ZoomSDKAuthSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [CsrfExemptSessionAuthentication]
    
    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        meeting_id = serializer.validated_data['meeting_id']
        # Safely get role with default value of 0
        role = serializer.validated_data.get('role', 0)
        user_name = serializer.validated_data.get('user_name', '')
        user_email = serializer.validated_data.get('user_email', '')
        
        if role == 1:
            user = request.user
            try:
                meeting = ZoomMeeting.objects.get(meeting_id=meeting_id)
                if user.role == 'student' or (user.role == 'teacher' and meeting.created_by.id != user.id):
                    return Response(
                        {"error": "Ви не маєте прав бути ведучим цієї зустрічі"}, 
                        status=status.HTTP_403_FORBIDDEN
                    )
            except ZoomMeeting.DoesNotExist:
                pass
        
        # Generate the signature using our utility function
        sdk_auth_data = generate_sdk_signature(
            meeting_number=meeting_id,
            role=role
        )
        
        # Ensure the password isn't empty
        if not user_name:
            sdk_auth_data['userName'] = f"{request.user.first_name} {request.user.last_name}".strip() or request.user.username
        else:
            sdk_auth_data['userName'] = user_name
            
        if not user_email:
            sdk_auth_data['userEmail'] = request.user.email
        else:
            sdk_auth_data['userEmail'] = user_email
        
        # Try to get the meeting password if available
        try:
            meeting = ZoomMeeting.objects.get(meeting_id=meeting_id)
            if meeting.meeting_password:
                sdk_auth_data['passWord'] = meeting.meeting_password
        except ZoomMeeting.DoesNotExist:
            pass
        
        # Set a default leave URL
        sdk_auth_data['leaveUrl'] = request.data.get('leave_url', '/dashboard')
        
        return Response(sdk_auth_data)


class CourseZoomMeetingsView(generics.ListAPIView):
    """View для отримання зустрічей для конкретного курсу"""
    serializer_class = ZoomMeetingSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [CsrfExemptSessionAuthentication]
    
    def get_queryset(self):
        course_id = self.kwargs.get('course_id')
        user = self.request.user
        
        if user.role == 'student':
            has_access = Enrollment.objects.filter(
                student=user,
                course_id=course_id
            ).exists()
            
            if not has_access:
                return ZoomMeeting.objects.none()
        
        elif user.role == 'teacher':
            course = get_object_or_404(Course, id=course_id)
            if course.teacher.id != user.id:
                return ZoomMeeting.objects.none()
        
        return ZoomMeeting.objects.filter(course_id=course_id)



from rest_framework.decorators import api_view
from .utils import get_zoom_access_token

@api_view(['GET'])
def test_zoom_token(request):
    """Тестовий ендпоінт для перевірки отримання Zoom токена"""
    try:
        token = get_zoom_access_token()
        return Response({
            'success': True,
            'message': 'Successfully obtained Zoom access token',
            'token_preview': token[:10] + '...' if token else 'None'
        })
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=500)
    

import traceback
from django.utils import timezone
from datetime import timedelta
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .utils import get_zoom_access_token, create_zoom_meeting

@api_view(['GET', 'POST'])
def test_zoom_api(request):
    """Тестовий endpoint для перевірки Zoom API інтеграції"""
    try:
        # Отримуємо токен
        token = get_zoom_access_token()
        
        if request.method == 'POST':
            # Якщо це POST запит, спробуємо створити тестову зустріч
            test_data = {
                'topic': 'Test Meeting API',
                'description': 'This is a test meeting created via API',
                'start_time': (timezone.now() + timedelta(hours=1)).isoformat(),
                'duration': 30,
                'settings': {
                    'host_video': True,
                    'participant_video': True
                }
            }
            
            meeting = create_zoom_meeting(**test_data)
            
            return Response({
                'success': True,
                'message': 'Successfully created a test Zoom meeting',
                'token_preview': token[:10] + '...' if token else 'None',
                'meeting_data': meeting
            })
        else:
            # Якщо GET запит, просто повертаємо статус токена
            return Response({
                'success': True,
                'message': 'Successfully obtained Zoom access token',
                'token_preview': token[:10] + '...' if token else 'None',
                'token_full': token,  # Додаємо повний токен для діагностики
                'account_id': getattr(request, 'ACCOUNT_ID', 'Not defined in settings'),
                'client_id': getattr(request, 'CLIENT_ID', 'Not defined in settings')
            })
    except Exception as e:
        error_traceback = traceback.format_exc()
        return Response({
            'success': False,
            'error': str(e),
            'error_type': type(e).__name__,
            'traceback': error_traceback
        }, status=500)