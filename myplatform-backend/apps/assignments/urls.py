from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    AssignmentViewSet,
    UploadAssignmentFileView,
    DeleteTempAssignmentFileView,
    ConfirmAssignmentFilesView,
    AddAssignmentLinksView,
    AssignmentLinkDeleteView,
    DeleteAssignmentFileView,
)

router = DefaultRouter()
router.register(r'', AssignmentViewSet, basename='assignments')

urlpatterns = [
    path('', include(router.urls)),
    path('<int:assignment_id>/upload-file/', UploadAssignmentFileView.as_view(), name='upload_assignment_file'),
    path('files/<int:file_id>/delete/', DeleteTempAssignmentFileView.as_view(), name='delete_temp_assignment_file'),
    path('<int:assignment_id>/confirm-files/', ConfirmAssignmentFilesView.as_view(), name='confirm_assignment_files'),

    path('<int:assignment_id>/add-links/', AddAssignmentLinksView.as_view(), name='add_assignment_links'),
    path('links/<int:pk>/delete/', AssignmentLinkDeleteView.as_view(), name='delete_assignment_link'),

    path('files_confirm/<int:file_id>/delete/', DeleteAssignmentFileView.as_view(), name='delete_assignment_file'),

]
