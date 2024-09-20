from rest_framework import generics
from .models import Lesson
from .serializers import LessonSerializer
from rest_framework.generics import RetrieveAPIView

class LessonsByModuleView(generics.ListAPIView):
    serializer_class = LessonSerializer

    def get_queryset(self):
        module_id = self.kwargs['module_id']
        return Lesson.objects.filter(module_id=module_id)

class LessonDetailView(RetrieveAPIView):
    queryset = Lesson.objects.all()
    serializer_class = LessonSerializer