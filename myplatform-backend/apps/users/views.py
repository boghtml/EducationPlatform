import json
import logging

from django.conf import settings
from django.contrib.auth.decorators import login_required
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.db.models import Q
from django.http import JsonResponse, Http404
from django.shortcuts import render, get_object_or_404
from django.utils.crypto import get_random_string
from django.views.decorators.csrf import csrf_exempt

from .models import CustomUser
from .forms import CustomUserCreationForm, CustomUserUpdateForm, CustomUserChangeForm

from google.oauth2 import id_token
from google.auth.transport import requests
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
import boto3
from botocore.exceptions import ClientError
from django.conf import settings
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from rest_framework import status

from django.contrib.auth import login, get_user_model
from django.contrib.auth.backends import ModelBackend

logger = logging.getLogger(__name__)


s3_client = boto3.client(
    's3',
    aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
    aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
    region_name=settings.AWS_S3_REGION_NAME
)


@csrf_exempt
def register(request):
    if request.method == 'POST':
        logger.debug(f'Request POST data: {request.POST}')
        form = CustomUserCreationForm(request.POST)
        if form.is_valid():
            user = form.save(commit=False)
            user.role = 'student' 
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
            username_or_email = data.get('username') 
            password = data.get('password')
        except json.JSONDecodeError:
            logger.error('Invalid JSON in request body')
            return JsonResponse({'errors': 'Invalid JSON'}, status=400)
        
        logger.debug(f'Login attempt for username or email: {username_or_email}')
        
        UserModel = get_user_model()
        try:
            
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
@api_view(['POST'])
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

@csrf_exempt
@login_required
def delete_user(request, user_id):
    if request.method == 'DELETE':
        user = get_object_or_404(CustomUser, id=user_id)
        user.delete()
        return JsonResponse({'message': 'User deleted successfully'})
    return JsonResponse({'message': 'Invalid request method'}, status=400)

@csrf_exempt
def list_teachers(request):
    if request.method == 'GET':
        teachers = CustomUser.objects.filter(role='teacher')
        teachers_list = [{
            'id': teacher.id,
            'username': teacher.username,
            'email': teacher.email,
            'first_name': teacher.first_name,
            'last_name': teacher.last_name,
            'phone_number': teacher.phone_number,
            'profile_image_url': teacher.profile_image_url
        } for teacher in teachers]
        return JsonResponse(teachers_list, safe=False)
    return JsonResponse({'message': 'Invalid request method'}, status=400)

@csrf_exempt
def list_students(request):
    if request.method == 'GET':
        students = CustomUser.objects.filter(role='student')
        students_list = [{
            'id': student.id,
            'username': student.username,
            'email': student.email,
            'first_name': student.first_name,
            'last_name': student.last_name,
            'phone_number': student.phone_number,
            'profile_image_url': student.profile_image_url,
            'last_login': student.last_login,
            'data_joined': student.date_joined,
        } for student in students]
        return JsonResponse(students_list, safe=False)
    return JsonResponse({'message': 'Invalid request method'}, status=400)


@csrf_exempt
def get_student_details(request, id):
    try:
        user = get_object_or_404(CustomUser, id=id, role='student')
        user_data = {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'phone_number': user.phone_number,
            'profile_image_url': user.profile_image_url,
            'role': user.role,
            'last_login': user.last_login,
            'date_joined': user.date_joined,
        }
        return JsonResponse({'message': 'Student details retrieved successfully', 'data': user_data})
    except Http404:
        return JsonResponse({'error': 'Student not found or does not have the correct role'}, status=404)
    except Exception as e:
        return JsonResponse({'error': f'An error occurred: {str(e)}'}, status=500)

@csrf_exempt
def get_teacher_details(request, id):
    try:
        user = get_object_or_404(CustomUser, id=id, role='teacher')
        user_data = {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'phone_number': user.phone_number,
            'profile_image_url': user.profile_image_url,
            'role': user.role,
            'last_login': user.last_login,
            'date_joined': user.date_joined,
        }
        return JsonResponse({'message': 'Teacher details retrieved successfully', 'data': user_data})
    except Http404:
        return JsonResponse({'error': 'Teacher not found or does not have the correct role'}, status=404)
    except Exception as e:
        return JsonResponse({'error': f'An error occurred: {str(e)}'}, status=500)


@csrf_exempt
def reset_password_request(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        email = data.get('email')
        
        try:
            user = CustomUser.objects.get(email=email)
            token = default_token_generator.make_token(user)
            reset_url = f"http://localhost:3000/reset-password?uid={user.pk}&token={token}"
            send_mail(
                'Password Reset Request',
                f'Click the link below to reset your password:\n{reset_url}',
                settings.DEFAULT_FROM_EMAIL,
                [email],
                fail_silently=False,
            )
            return JsonResponse({'message': 'Password reset link has been sent to your email.'})
        except CustomUser.DoesNotExist:
            return JsonResponse({'errors': 'Email not found'}, status=404)
    return JsonResponse({'message': 'Invalid request method'}, status=400)

@csrf_exempt
def reset_password_confirm(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        uid = data.get('uid')
        token = data.get('token')
        new_password = data.get('new_password')
        new_password_confirm = data.get('new_password_confirm')

        if new_password != new_password_confirm:
            return JsonResponse({'errors': 'Passwords do not match'}, status=400)

        try:
            user = CustomUser.objects.get(pk=uid)
            if default_token_generator.check_token(user, token):
                user.set_password(new_password)
                user.save()
                return JsonResponse({'message': 'Password has been reset successfully'})
            else:
                return JsonResponse({'errors': 'Invalid token'}, status=400)
        except CustomUser.DoesNotExist:
            return JsonResponse({'errors': 'Invalid user'}, status=404)
    return JsonResponse({'message': 'Invalid request method'}, status=400)


@csrf_exempt
def test_email(request):
    send_mail(
        'Test Email',
        'This is a test email from Django.',
        settings.DEFAULT_FROM_EMAIL,
        ['boghtml@gmail.com'],
        fail_silently=False,
    )
    return JsonResponse({'message': 'Email sent successfully'})


@csrf_exempt
@login_required
def change_password(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        old_password = data.get('old_password')
        new_password = data.get('new_password')
        new_password_confirm = data.get('new_password_confirm')

        if new_password != new_password_confirm:
            return JsonResponse({'errors': 'New passwords do not match'}, status=400)

        user = request.user

        if not user.check_password(old_password):
            return JsonResponse({'errors': 'Old password is incorrect'}, status=400)
    

        user.set_password(new_password)
        user.save()
        return JsonResponse({'message': 'Password has been changed successfully'})
    return JsonResponse({'message': 'Invalid request method'}, status=400)


@csrf_exempt
@login_required

def change_password_by_id(request, user_id):
    if request.method == 'POST':
        data = json.loads(request.body)
        old_password = data.get('old_password')
        new_password = data.get('new_password')
        new_password_confirm = data.get('new_password_confirm')

        if new_password != new_password_confirm:
            return JsonResponse({'errors': 'New passwords do not match'}, status=400)

        try:
            user = CustomUser.objects.get(id=user_id)
        except CustomUser.DoesNotExist:
            return JsonResponse({'errors': 'User not found'}, status=404)

        if not user.check_password(old_password):
            return JsonResponse({'errors': 'Old password is incorrect'}, status=400)

        user.set_password(new_password)
        user.save()
        return JsonResponse({'message': 'Password has been changed successfully'}, status=200)

    return JsonResponse({'message': 'Invalid request method'}, status=400)

UserModel = get_user_model()

@csrf_exempt
def login_view(request):
    if request.method == 'POST':
        try:

            body = request.body.decode('utf-8')
            data = json.loads(body)
            
            if 'token' in data:
                return handle_google_login(request, data['token'])
            else:
                return handle_regular_login(request, data)
        except json.JSONDecodeError:
            logger.error('Invalid JSON in request body')
            return JsonResponse({'errors': 'Invalid JSON'}, status=400)
    
    return JsonResponse({'errors': 'Invalid request method'}, status=405)

def handle_regular_login(request, data):
    username_or_email = data.get('username')
    password = data.get('password')
    
    logger.debug(f'Login attempt for username or email: {username_or_email}')
    
    try:
        user = UserModel.objects.get(Q(username=username_or_email) | Q(email=username_or_email))
        if user.check_password(password):
            login(request, user, backend='django.contrib.auth.backends.ModelBackend')
            return create_success_response(request, user)
        
        else:
            logger.warning(f'Failed login attempt for username or email: {username_or_email}')
            return JsonResponse({'errors': 'Invalid credentials'}, status=400)
    except UserModel.DoesNotExist:
        logger.warning(f'User not found for username or email: {username_or_email}')
        return JsonResponse({'errors': 'User not found'}, status=400)

def handle_google_login(request, token):
    try:
        idinfo = id_token.verify_oauth2_token(
            token, 
            requests.Request(), 
            '961028426280-6o6re3hfrp7lnr3nennusu902171sapj.apps.googleusercontent.com'
        )
        
        email = idinfo['email']
        name = idinfo.get('name', '')
        
        user, created = UserModel.objects.get_or_create(email=email)
        
        if created:
            user.username = email.split('@')[0]
            user.first_name = name
            user.save()
        
        login(request, user, backend='django.contrib.auth.backends.ModelBackend')
        
        return create_success_response(request, user)
    except ValueError:
        logger.warning('Invalid token for Google login')
        return JsonResponse({'errors': 'Invalid token'}, status=400)

def create_success_response(request, user):
    request.session['userName'] = user.username
    request.session['userEmail'] = user.email
    request.session['profileImageUrl'] = user.profile_image_url if hasattr(user, 'profile_image_url') else 'https://via.placeholder.com/40'
    
    logger.info(f'User logged in successfully: {user.username}')
    logger.info(f"Session data set: {request.session['userName']}, {request.session['userEmail']}, {request.session['profileImageUrl']}")
    
    return JsonResponse({
        'message': 'User logged in successfully',
        'userName': user.username,
        'userEmail': user.email,
        'profileImageUrl': user.profile_image_url if hasattr(user, 'profile_image_url') else 'https://via.placeholder.com/40',
        'role': user.role if hasattr(user, 'role') else '',
        'phone_number': user.phone_number if hasattr(user, 'phone_number') else '',
        'id': user.id
    })

@csrf_exempt
def register(request):
    if request.method == 'POST':
        if 'application/json' in request.content_type:
            data = json.loads(request.body)
        else:
            data = request.POST

        if 'token' in data: 
            return handle_google_register(request, data['token'])
        else:
            logger.debug(f'Request POST data: {data}')
            form = CustomUserCreationForm(data)
            if form.is_valid():
                user = form.save(commit=False)
                user.role = data.get('role', 'student')
                user.save()
                logger.info(f'New user created: {user.username}')
                login(request, user, backend='django.contrib.auth.backends.ModelBackend')
                return JsonResponse({'message': 'User registered successfully', 'user_id': user.id})

            else:
                logger.error(f'Error in form: {form.errors}')
                return JsonResponse({'errors': form.errors}, status=400)
    else:
        form = CustomUserCreationForm()
    return render(request, 'users/register.html', {'form': form})


def handle_google_register(request, token):
    try:
        idinfo = id_token.verify_oauth2_token(
            token,
            requests.Request(),
            '961028426280-6o6re3hfrp7lnr3nennusu902171sapj.apps.googleusercontent.com'
        )
        
        email = idinfo['email']
        name = idinfo.get('name', '')
        
        user, created = UserModel.objects.get_or_create(email=email)
        
        if created:

            user.username = email.split('@')[0]
            user.first_name = idinfo.get('given_name', '')
            user.last_name = idinfo.get('family_name', '')
            user.profile_image_url = idinfo.get('picture', '')
            user.set_unusable_password() 
            user.save()

        login(request, user, backend='django.contrib.auth.backends.ModelBackend')
        
        return create_success_response(request, user)
    except ValueError:
        logger.warning('Invalid token for Google registration')
        return JsonResponse({'errors': 'Invalid token'}, status=400)

import urllib.parse


@csrf_exempt
@api_view(['POST'])
def upload_profile_image(request, user_id):

    user = get_object_or_404(CustomUser, id=user_id)

    file = request.FILES.get('profile_image')
    if not file:
        return Response({"error": "No file provided"}, status=status.HTTP_400_BAD_REQUEST)

    file_extension = file.name.split('.')[-1].lower()
    if file_extension not in ['jpg', 'jpeg', 'png', 'gif']:
        return Response({'error': 'Invalid file type. Only jpg, jpeg, png, and gif are allowed.'}, 
                        status=status.HTTP_400_BAD_REQUEST)
    
    try:
        
        s3_file_path = f"Users/User_{user.id}/{file.name}"


        s3_client.upload_fileobj(file, settings.AWS_STORAGE_BUCKET_NAME, s3_file_path)

        encoded_file_path = urllib.parse.quote(s3_file_path, safe='/')

        file_url = f"https://{settings.AWS_STORAGE_BUCKET_NAME}.s3.amazonaws.com/{encoded_file_path}"

        if user.profile_image_url:
            parsed_url = urllib.parse.urlparse(user.profile_image_url)
            encoded_old_image_key = parsed_url.path.lstrip('/')
            old_image_key = urllib.parse.unquote(encoded_old_image_key)
            s3_client.delete_object(Bucket=settings.AWS_STORAGE_BUCKET_NAME, Key=old_image_key)

        user.profile_image_url = file_url
        user.save()

        return Response({'message': 'Profile image uploaded successfully', 'profile_image_url': file_url}, status=status.HTTP_200_OK)

    except ClientError as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    

@login_required
@csrf_exempt
def create_teacher(request):
    if request.user.role != 'admin':
        return JsonResponse({'error': 'Only admins can create teachers.'}, status=403)

    if request.method == 'POST':
        if 'application/json' in request.content_type:
            data = json.loads(request.body)
        else:
            data = request.POST

        form = CustomUserCreationForm(data)
        if form.is_valid():
            user = form.save(commit=False)
            user.role = 'teacher'
            user.save()
            return JsonResponse({'message': 'Teacher created successfully', 'user_id': user.id})
        else:
            return JsonResponse({'errors': form.errors}, status=400)
    else:
        return JsonResponse({'error': 'Invalid request method.'}, status=405)
    
@login_required
@csrf_exempt
def edit_teacher(request, teacher_id):
    if request.user.role != 'admin':
        return JsonResponse({'error': 'Only admins can edit teachers.'}, status=403)

    try:
        teacher = get_user_model().objects.get(id=teacher_id, role='teacher')
    except get_user_model().DoesNotExist:
        return JsonResponse({'error': 'Teacher not found.'}, status=404)

    if request.method == 'POST':
        if 'application/json' in request.content_type:
            data = json.loads(request.body)
        else:
            data = request.POST

        form = CustomUserChangeForm(data, instance=teacher)
        if form.is_valid():
            form.save()
            return JsonResponse({'message': 'Teacher updated successfully', 'user_id': teacher.id})
        else:
            return JsonResponse({'errors': form.errors}, status=400)
    else:
        return JsonResponse({'error': 'Invalid request method.'}, status=405)
    
@login_required
@csrf_exempt
def delete_teacher(request, teacher_id):
    if request.user.role != 'admin':
        return JsonResponse({'error': 'Only admins can delete teachers.'}, status=403)

    try:
        teacher = get_user_model().objects.get(id=teacher_id, role='teacher')
    except get_user_model().DoesNotExist:
        return JsonResponse({'error': 'Teacher not found.'}, status=404)

    if request.method == 'DELETE':
        teacher.delete()
        return JsonResponse({'message': 'Teacher deleted successfully.'})
    else:
        return JsonResponse({'error': 'Invalid request method.'}, status=405)
