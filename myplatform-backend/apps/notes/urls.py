# apps/notes/urls.py

from django.urls import path
from .views import (
    UserNoteCreateView, UserNoteListView, UserNoteDetailView,
    NoteFolderCreateView, NoteFolderListView, NoteFolderDetailView
)

urlpatterns = [
    path('', UserNoteListView.as_view(), name='list_notes'), 
    path('create/', UserNoteCreateView.as_view(), name='create_note'),  
    path('<int:pk>/', UserNoteDetailView.as_view(), name='detail_note'),  
    path('folders/', NoteFolderListView.as_view(), name='list_folders'), 
    path('folders/create/', NoteFolderCreateView.as_view(), name='create_folder'), 
    path('folders/<int:pk>/', NoteFolderDetailView.as_view(), name='detail_folder'),  
]
