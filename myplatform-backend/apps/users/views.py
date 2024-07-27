from .forms import CustomUserCreationForm
from django.http import JsonResponse
from django.contrib.auth import authenticate, login
from django.views.decorators.csrf import csrf_exempt
import json
from django.contrib.auth import get_user_model
from django.db.models import Q
from django.shortcuts import render, get_object_or_404
from django.contrib.auth.decorators import login_required
from .models import CustomUser
from .forms import CustomUserUpdateForm
import logging


logger = logging.getLogger(__name__)

@csrf_exempt
def register(request):
    if request.method == 'POST':
        logger.debug(f'Request POST data: {request.POST}')
        form = CustomUserCreationForm(request.POST)
        if form.is_valid():
            user = form.save(commit=False)
            user.role = 'student'  # Встановлюємо роль за замовчуванням
            user.save()
            logger.info(f'New user created: {user.username}')
            login(request, user)
            return JsonResponse({'message': 'User registered successfully'})
        else:
            logger.error(f'Error in form: {form.errors}')
            return JsonResponse({'errors': form.errors}, status=400)
    else:
        form = CustomUserCreationForm()
    return render(request, 'users/register.html', {'form': form})


@csrf_exempt
def login_view(request):
    if request.method == 'POST':
        logger.debug(f'Login - Request POST data: {request.POST}')
        logger.debug(f'Login - Request body: {request.body}')
        
        try:
            data = json.loads(request.body)
            username_or_email = data.get('username')  # Це поле може містити або username, або email
            password = data.get('password')
        except json.JSONDecodeError:
            logger.error('Invalid JSON in request body')
            return JsonResponse({'errors': 'Invalid JSON'}, status=400)
        
        logger.debug(f'Login attempt for username or email: {username_or_email}')
        
        UserModel = get_user_model()
        try:
            # Шукаємо користувача за username або email
            user = UserModel.objects.get(Q(username=username_or_email) | Q(email=username_or_email))
            # Перевіряємо пароль
            if user.check_password(password):
                login(request, user)
                request.session['userName'] = user.username
                request.session['userEmail'] = user.email
                request.session['profileImageUrl'] = user.profile_image_url if user.profile_image_url else 'https://via.placeholder.com/40'
                
                logger.info(f'User logged in successfully: {user.username}')
                logger.info(f"Session data set: {request.session['userName']}, {request.session['userEmail']}, {request.session['profileImageUrl']}")
                
                return JsonResponse({
                    'message': 'User logged in successfully',
                    'userName': user.username,
                    'userEmail': user.email,
                    'profileImageUrl': user.profile_image_url if user.profile_image_url else 'https://via.placeholder.com/40',
                    'role': user.role,
                    'phone_number': user.phone_number,
                    'id': user.id
                })
            else:
                logger.warning(f'Failed login attempt for username or email: {username_or_email}')
                return JsonResponse({'errors': 'Invalid credentials'}, status=400)
        except UserModel.DoesNotExist:
            logger.warning(f'User not found for username or email: {username_or_email}')
            return JsonResponse({'errors': 'User not found'}, status=400)
    
    return render(request, 'users/login.html')

@csrf_exempt
@login_required
def update_profile(request, user_id):
    if request.method == 'POST':
        data = json.loads(request.body)
        user = get_object_or_404(CustomUser, id=user_id)
        
        form = CustomUserUpdateForm(data, instance=user)
        if form.is_valid():
            form.save()
            return JsonResponse({
                'message': 'Profile updated successfully',
                'userName': user.username,
                'userEmail': user.email,
                'profileImageUrl': user.profile_image_url,
                'role': user.role,
                'phone_number': user.phone_number,
                'id': user.id
            })
        else:
            logger.error(f'Error in form: {form.errors}')
            return JsonResponse({'errors': form.errors}, status=400)
    return JsonResponse({'message': 'Invalid request method'}, status=400)