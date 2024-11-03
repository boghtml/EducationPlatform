# apps/users/urls.py

from django.urls import path
from .views import (
    register, login_view, update_profile, delete_user,
    list_teachers, list_students, reset_password_request,
    reset_password_confirm, change_password, test_email, get_student_details, get_teacher_details, change_password_by_id,
    upload_profile_image,
  #  google_login
)

urlpatterns = [
    path('register/', register, name='register'),
    path('login/', login_view, name='login'),
    path('update-profile/<int:user_id>/', update_profile, name='update_profile'),
    path('delete-user/<int:user_id>/', delete_user, name='delete_user'), 
    path('teachers/', list_teachers, name='list_teachers'),   
    path('students/', list_students, name='list_students'),  
    path('reset-password-request/', reset_password_request, name='reset_password_request'),
    path('reset-password-confirm/', reset_password_confirm, name='reset_password_confirm'),
    path('test-email/', test_email, name='test_email'),
    path('change-password/', change_password, name='change_password'),
    path('change-password-id/<int:user_id>/', change_password_by_id, name='change_password_by_id'),

    path('student/<int:id>/', get_student_details, name='get_student_details'),
    path('teacher/<int:id>/', get_teacher_details, name='get_teacher_details'),

    path('upload-profile-image/<int:user_id>/', upload_profile_image, name='upload_profile_image'),
]
