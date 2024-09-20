from rest_framework import generics
from .models import Module
from .serializers import ModuleSerializer

class ModulesByCourseView(generics.ListAPIView):
    serializer_class = ModuleSerializer

    def get_queryset(self):
        course_id = self.kwargs['course_id']
        return Module.objects.filter(course_id=course_id)
