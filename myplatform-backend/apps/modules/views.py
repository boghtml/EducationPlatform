from rest_framework import generics
from .models import Module
from .serializers import ModuleSerializer
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from .mixins import CsrfExemptSessionAuthentication

class ModulesByCourseView(generics.ListAPIView):
    serializer_class = ModuleSerializer
    permission_classes = [AllowAny] 
    authentication_classes = (CsrfExemptSessionAuthentication,)

    def get_queryset(self):
        course_id = self.kwargs['course_id']
        return Module.objects.filter(course_id=course_id)

class ModuleCreateView(generics.CreateAPIView):
    queryset = Module.objects.all()
    serializer_class = ModuleSerializer
    permission_classes = [AllowAny]  
    authentication_classes = (CsrfExemptSessionAuthentication,)

class ModuleUpdateView(generics.UpdateAPIView):
    queryset = Module.objects.all()
    serializer_class = ModuleSerializer
    permission_classes = [AllowAny] 
    authentication_classes = (CsrfExemptSessionAuthentication,)

class ModuleDeleteView(generics.DestroyAPIView):
    queryset = Module.objects.all()
    serializer_class = ModuleSerializer
    permission_classes = [AllowAny] 
    authentication_classes = (CsrfExemptSessionAuthentication,)
    
    def destroy(self, request, *args, **kwargs):
        module = self.get_object()
        self.perform_destroy(module)
        return Response({
            "message": f"Module '{module.title}' has been successfully deleted."
        }, status=status.HTTP_200_OK)

class ModuleDetailView(generics.RetrieveAPIView):
    """
    API endpoint для отримання детальної інформації про модуль за його ID.
    Включає список уроків та іншу відповідну інформацію про модуль.
    """
    queryset = Module.objects.all()
    serializer_class = ModuleSerializer
    permission_classes = [AllowAny] 
    authentication_classes = (CsrfExemptSessionAuthentication,)
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        
        from apps.lessons.models import Lesson
        from apps.lessons.serializers import LessonSerializer
        
        lessons = Lesson.objects.filter(module=instance).order_by('id')
        lessons_data = LessonSerializer(lessons, many=True, context={'request': request}).data
        
        data = serializer.data
        data['lessons'] = lessons_data
        
        if request.user.is_authenticated and request.user.role == 'student':
            from apps.progress_tracking.models import LessonProgress
            
            completed_lessons = LessonProgress.objects.filter(
                student=request.user,
                lesson__module=instance
            ).count()
            
            data['progress'] = {
                'total_lessons': lessons.count(),
                'completed_lessons': completed_lessons,
                'completion_percentage': round(completed_lessons / lessons.count() * 100, 2) if lessons.count() > 0 else 0
            }
        
        return Response(data)