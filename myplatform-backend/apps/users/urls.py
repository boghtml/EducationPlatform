# apps/users/urls.py

from django.urls import path
from .views import register, login_view, update_profile

urlpatterns = [
    path('register/', register, name='register'),
    path('login/', login_view, name='login'),
    path('update-profile/<int:user_id>/', update_profile, name='update_profile'),
]
