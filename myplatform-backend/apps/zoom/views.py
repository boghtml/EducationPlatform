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

class ZoomMeetingViewSet(viewsets.ModelViewSet):
    """Viewset для Zoom зустрічей"""
    serializer_class = ZoomMeetingSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [CsrfExemptSessionAuthentication]
    
    def get_queryset(self):
        user = self.request.user
        
        if user.role == 'admin':
            
            return ZoomMeeting.objects.all()
        
        elif user.role == 'teacher':
            
            return ZoomMeeting.objects.filter(
                Q(created_by=user) | Q(course__teacher=user)
            ).distinct()
            
        else:
            
            enrolled_courses = Enrollment.objects.filter(
                student=user
            ).values_list('course_id', flat=True)
            
            return ZoomMeeting.objects.filter(course_id__in=enrolled_courses)
    
    def get_serializer_class(self):
        if self.action == 'create':
            return ZoomMeetingCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return ZoomMeetingUpdateSerializer
        return ZoomMeetingSerializer
    
    def perform_create(self, serializer):
        
        user = self.request.user
        
        course_id = serializer.validated_data.get('course').id
        course = get_object_or_404(Course, id=course_id)
        
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
            
        zoom_data = {
            "meeting_id": f"zoom_{course_id}_{int(timezone.now().timestamp())}",
            "meeting_password": "123456",
            "join_url": f"https://zoom.us/j/8529817{course_id}"
        }
        
        meeting = serializer.save(
            created_by=user,
            **zoom_data
        )
        
        return meeting
    
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
        
        if meeting.meeting_password is None or meeting.meeting_password == '':
            meeting.meeting_password = "123456" 
        else:
            
            meeting.meeting_password = str(meeting.meeting_password).strip()
        
        meeting_id = meeting.meeting_id
        if meeting_id.startswith('zoom_'):
            parts = meeting_id.split('_')
            if len(parts) >= 3:
                meeting_id = parts[2]  
        
        meeting_id = ''.join(filter(str.isdigit, meeting_id))
        
        print(f"Meeting ID for SDK: '{meeting_id}', Password: '{meeting.meeting_password}'")
        
        is_host = user.role in ['teacher', 'admin'] and (user.id == meeting.created_by.id or user.id == meeting.course.teacher.id)
        role = 1 if is_host else 0
        
        serializer = ZoomSDKAuthSerializer(data={
            'meeting_id': meeting_id,  
            'role': role,
            'user_name': f"{user.first_name} {user.last_name}".strip() or user.username,
            'user_email': user.email
        })
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        sdk_auth_data = serializer.generate_signature(
            meeting_number=meeting_id, 
            role=role
        )
        
        sdk_auth_data.update({
            'password': meeting.meeting_password,
            'pwd': meeting.meeting_password,
            'passWord': meeting.meeting_password,
            'userName': f"{user.first_name} {user.last_name}".strip() or user.username,
            'userEmail': user.email,
            'meetingNumber': meeting_id  
        })
        
        participant, created = ZoomMeetingParticipant.objects.update_or_create(
            meeting=meeting,
            user=user,
            defaults={
                'joined_at': timezone.now(),
                'device_type': request.META.get('HTTP_USER_AGENT', '')[:50],
                'ip_address': request.META.get('REMOTE_ADDR')
            }
        )
        
        if meeting.meeting_id != meeting_id:
            meeting.meeting_id = meeting_id
            meeting.save(update_fields=['meeting_id'])
        
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
        role = serializer.validated_data['role']
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
        
        sdk_auth_data = serializer.generate_signature(
            meeting_number=meeting_id,
            role=role
        )
        
        if user_name:
            sdk_auth_data['userName'] = user_name
        else:
            sdk_auth_data['userName'] = f"{request.user.first_name} {request.user.last_name}".strip() or request.user.username
            
        if user_email:
            sdk_auth_data['userEmail'] = user_email
        else:
            sdk_auth_data['userEmail'] = request.user.email
        
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