from django.urls import path
from .views import MaterialCreateView, MaterialUpdateView, MaterialDeleteView, MaterialAddFilesView, MaterialFileDeleteView \
    , MaterialListView, MaterialDetailView

urlpatterns = [
    path('', MaterialListView.as_view(), name='material_list'),
    path('<int:pk>/', MaterialDetailView.as_view(), name='material_detail'),

    path('create/', MaterialCreateView.as_view(), name='material_create'),
    path('<int:material_id>/edit/', MaterialUpdateView.as_view(), name='material_edit'),
    path('<int:material_id>/delete/', MaterialDeleteView.as_view(), name='material_delete'),
    path('<int:material_id>/add-files/', MaterialAddFilesView.as_view(), name='material_add_files'),
    path('files/<int:file_id>/delete/', MaterialFileDeleteView.as_view(), name='material_file_delete'),

]
