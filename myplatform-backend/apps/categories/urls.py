from django.urls import path
from .views import (
    CategoryListCreateView,
    CategoryRetrieveUpdateDestroyView,
)

urlpatterns = [
    path('', CategoryListCreateView.as_view(), name='category_list_create'),
    path('<int:pk>/', CategoryRetrieveUpdateDestroyView.as_view(), name='category_detail'),
]
