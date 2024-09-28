from rest_framework import generics
from .models import Module
from .serializers import ModuleSerializer
from rest_framework import generics, status
from rest_framework.response import Response

class ModulesByCourseView(generics.ListAPIView):
    serializer_class = ModuleSerializer

    def get_queryset(self):
        course_id = self.kwargs['course_id']
        return Module.objects.filter(course_id=course_id)

class ModuleCreateView(generics.CreateAPIView):
    queryset = Module.objects.all()
    serializer_class = ModuleSerializer

class ModuleUpdateView(generics.UpdateAPIView):
    queryset = Module.objects.all()
    serializer_class = ModuleSerializer

class ModuleDeleteView(generics.DestroyAPIView):
    queryset = Module.objects.all()
    serializer_class = ModuleSerializer

    def destroy(self, request, *args, **kwargs):
        module = self.get_object()
        self.perform_destroy(module)
        return Response({
            "message": f"Module '{module.title}' has been successfully deleted."
        }, status=status.HTTP_200_OK)
