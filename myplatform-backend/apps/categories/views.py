from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from .models import CourseCategory
from .serializers import CourseCategorySerializer
from apps.assignments.mixins import CsrfExemptSessionAuthentication
from rest_framework.exceptions import PermissionDenied

class CategoryListCreateView(generics.ListCreateAPIView):
    queryset = CourseCategory.objects.all()
    serializer_class = CourseCategorySerializer
    authentication_classes = [CsrfExemptSessionAuthentication]
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        user = self.request.user
        if user.role != 'teacher':
            raise PermissionDenied("Only teachers can create categories.")
        serializer.save()

class CategoryRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = CourseCategory.objects.all()
    serializer_class = CourseCategorySerializer
    authentication_classes = [CsrfExemptSessionAuthentication]
    permission_classes = [IsAuthenticated]

    def perform_update(self, serializer):
        user = self.request.user
        if user.role != 'teacher':
            raise PermissionDenied("Only teachers can update categories.")
        serializer.save()

    def perform_destroy(self, instance):
        user = self.request.user
        if user.role != 'teacher':
            raise PermissionDenied("Only teachers can delete categories.")
        instance.delete()
