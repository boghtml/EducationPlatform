from django.urls import path
from .views import MaterialCreateView

urlpatterns = [
    path('materials/create/', MaterialCreateView.as_view(), name='material_create'),
    # Add other paths for edit, delete, etc.
]
