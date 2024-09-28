from django.urls import path
from .views import LessonsByModuleView, LessonDetailView, LessonFilesView, LessonLinksView, \
LessonCreateView, UploadLessonFileView, DeleteTempFileView, ConfirmTempFilesView, AddLessonLinksView, \
LessonDeleteView, LessonUpdateView, DeleteConfirmedFileView, LessonLinkUpdateView, LessonLinkDeleteView

urlpatterns = [
    path('get_lessons/<int:module_id>/', LessonsByModuleView.as_view(), name='lessons_by_module'),
    path('<int:pk>/', LessonDetailView.as_view(), name='lesson_detail'),
    path('<int:lesson_id>/files/', LessonFilesView.as_view(), name='lesson_files'),
    path('<int:lesson_id>/links/', LessonLinksView.as_view(), name='lesson_links'),
    
    path('create_lesson/', LessonCreateView.as_view(), name='create_lesson'),
    path('upload-file/<int:lesson_id>/', UploadLessonFileView.as_view(), name='upload-file'),
    path('delete-temp-file/<int:file_id>/', DeleteTempFileView.as_view(), name='delete-temp-file'),
    path('confirm-temp-files/<int:lesson_id>/', ConfirmTempFilesView.as_view(), name='confirm-temp-files'),
    path('add-lesson-links/<int:lesson_id>/', AddLessonLinksView.as_view(), name='add-lesson-links'),

        # Видалення та редагування уроків
    path('lesson/delete/<int:pk>/', LessonDeleteView.as_view(), name='delete_lesson'),
    path('lesson/update/<int:pk>/', LessonUpdateView.as_view(), name='update_lesson'),

    # Видалення підтверджених файлів
    path('file/delete-confirmed/<int:file_id>/', DeleteConfirmedFileView.as_view(), name='delete_confirmed_file'),

    # Редагування та видалення лінків
    path('link/update/<int:pk>/', LessonLinkUpdateView.as_view(), name='update_link'),
    path('link/delete/<int:pk>/', LessonLinkDeleteView.as_view(), name='delete_link'),

]
