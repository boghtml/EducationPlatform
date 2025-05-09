from django.urls import path
from .views import (
    ModulesByCourseView, ModuleCreateView, ModuleUpdateView, ModuleDeleteView, ModuleDetailView
)
urlpatterns = [
    path('get_modules/<int:course_id>/', ModulesByCourseView.as_view(), name='modules_by_course'),
    path('create/', ModuleCreateView.as_view(), name='create_module'),
    path('update/<int:pk>/', ModuleUpdateView.as_view(), name='update_module'),
    path('delete/<int:pk>/', ModuleDeleteView.as_view(), name='delete_module'),
    path('detail/<int:pk>/', ModuleDetailView.as_view(), name='module_detail'),

]