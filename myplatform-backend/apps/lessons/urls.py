from django.urls import path
from .views import LessonsByModuleView, LessonDetailView, LessonFilesView, LessonLinksView, \
LessonCreateView, UploadLessonFileView, DeleteTempFileView, ConfirmTempFilesView, AddLessonLinksView

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

]
