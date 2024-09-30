from rest_framework import generics
from .models import Module
from .serializers import ModuleSerializer
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from .mixins import CsrfExemptSessionAuthentication

class ModulesByCourseView(generics.ListAPIView):
    serializer_class = ModuleSerializer
    permission_classes = [AllowAny]  # Відкритий доступ для всіх
    authentication_classes = (CsrfExemptSessionAuthentication,)

    def get_queryset(self):
        course_id = self.kwargs['course_id']
        return Module.objects.filter(course_id=course_id)

class ModuleCreateView(generics.CreateAPIView):
    queryset = Module.objects.all()
    serializer_class = ModuleSerializer
    permission_classes = [AllowAny]  # Відкритий доступ для всіх
    authentication_classes = (CsrfExemptSessionAuthentication,)

class ModuleUpdateView(generics.UpdateAPIView):
    queryset = Module.objects.all()
    serializer_class = ModuleSerializer
    permission_classes = [AllowAny]  # Відкритий доступ для всіх
    authentication_classes = (CsrfExemptSessionAuthentication,)

class ModuleDeleteView(generics.DestroyAPIView):
    queryset = Module.objects.all()
    serializer_class = ModuleSerializer
    permission_classes = [AllowAny]  # Відкритий доступ для всіх
    authentication_classes = (CsrfExemptSessionAuthentication,)
    
    def destroy(self, request, *args, **kwargs):
        module = self.get_object()
        self.perform_destroy(module)
        return Response({
            "message": f"Module '{module.title}' has been successfully deleted."
        }, status=status.HTTP_200_OK)
