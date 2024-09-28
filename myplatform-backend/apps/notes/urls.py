# apps/notes/urls.py

from django.urls import path
from .views import (
    UserNoteCreateView, UserNoteListView, UserNoteDetailView,
    NoteFolderCreateView, NoteFolderListView, NoteFolderDetailView
)

urlpatterns = [
    path('', UserNoteListView.as_view(), name='list_notes'),  # Отримати список нотаток
    path('create/', UserNoteCreateView.as_view(), name='create_note'),  # Створити нову нотатку
    path('<int:pk>/', UserNoteDetailView.as_view(), name='detail_note'),  # Деталі, оновлення, видалення нотатки
    path('folders/', NoteFolderListView.as_view(), name='list_folders'),  # Отримати список папок
    path('folders/create/', NoteFolderCreateView.as_view(), name='create_folder'),  # Створити нову папку
    path('folders/<int:pk>/', NoteFolderDetailView.as_view(), name='detail_folder'),  # Деталі, оновлення, видалення папки
]
