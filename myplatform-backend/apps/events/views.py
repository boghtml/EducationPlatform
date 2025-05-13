# apps/events/views.py

from rest_framework import viewsets, status, permissions, filters
from rest_framework.exceptions import PermissionDenied
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Event, EventFile
from .serializers import EventSerializer, EventCreateUpdateSerializer, EventFileSerializer
from .mixins import CsrfExemptSessionAuthentication
import boto3
from django.conf import settings
from botocore.exceptions import ClientError
import urllib.parse

s3_client = boto3.client(
    's3',
    aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
    aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
    region_name=settings.AWS_S3_REGION_NAME
)

class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.filter(status='published')
    authentication_classes = (CsrfExemptSessionAuthentication,)
    
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description', 'content']
    ordering_fields = ['created_at', 'start_date', 'title']
    ordering = ['-created_at']
    
    def create(self, request, *args, **kwargs):
        print("Request data:", request.data)
        print("User:", request.user.id if request.user.is_authenticated else None)
        
        serializer = self.get_serializer(data=request.data, context={'request': request})
        
        if serializer.is_valid():
            instance = serializer.save(author=request.user)
            # Use EventSerializer to get full event data including ID
            response_serializer = EventSerializer(instance, context={'request': request})
            headers = self.get_success_headers(response_serializer.data)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        
        print("Validation errors:", serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return EventCreateUpdateSerializer
        return EventSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy', 'upload_image', 'upload_file']:
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]
    
    def get_queryset(self):
        queryset = Event.objects.all()
        
        event_type = self.request.query_params.get('event_type')
        status_param = self.request.query_params.get('status')
        
        if self.request.user.is_authenticated:
            if self.request.user.role not in ['admin', 'teacher']:
                queryset = queryset.filter(status='published')
        else:
            queryset = queryset.filter(status='published')
        
        if event_type:
            queryset = queryset.filter(event_type=event_type)
        
        if status_param:
            queryset = queryset.filter(status=status_param)
        
        return queryset
    
    def perform_create(self, serializer):
        if not self.request.user.is_authenticated:
            raise PermissionDenied("Authentication required")
        serializer.save(author=self.request.user)
    
    @action(detail=True, methods=['post'])
    def upload_image(self, request, pk=None):
        event = self.get_object()
        user = request.user
        
        if not user.is_authenticated or (user != event.author and user.role != 'admin'):
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        file = request.FILES.get('image')
        if not file:
            return Response({"error": "No image provided"}, status=status.HTTP_400_BAD_REQUEST)
        
        print(f"Received file: {file.name}, size: {file.size}, content type: {file.content_type}")


        if not file.content_type.startswith('image/'):
            return Response({"error": "File must be an image"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            
            if event.image_url:
                try:
                    parsed_url = urllib.parse.urlparse(event.image_url)
                    encoded_old_image_key = parsed_url.path.lstrip('/')
                    old_image_key = urllib.parse.unquote(encoded_old_image_key)
                    s3_client.delete_object(Bucket=settings.AWS_STORAGE_BUCKET_NAME, Key=old_image_key)
                except Exception as e:
                    
                    print(f"Error deleting old image: {e}")
            
            s3_file_path = f"Events/Event_{event.id}/images/{file.name}"
            s3_client.upload_fileobj(file, settings.AWS_STORAGE_BUCKET_NAME, s3_file_path)

            encoded_file_path = urllib.parse.quote(s3_file_path, safe='/')
            file_url = f"https://{settings.AWS_STORAGE_BUCKET_NAME}.s3.amazonaws.com/{encoded_file_path}"
            
            event.image_url = file_url
            event.save()
            
            response = Response({
                'message': 'Image uploaded successfully',
                'image_url': file_url
            }, status=status.HTTP_200_OK)
            # Додайте заголовки CORS
            response["Access-Control-Allow-Origin"] = "*"

            return response
            
        except ClientError as e:
            print(f"S3 client error: {e}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            print(f"Unexpected error: {e}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['post'])
    def upload_file(self, request, pk=None):
        event = self.get_object()
        user = request.user
        
        if not user.is_authenticated or (user != event.author and user.role != 'admin'):
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        file = request.FILES.get('file')
        if not file:
            return Response({"error": "No file provided"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            
            s3_file_path = f"Events/Event_{event.id}/files/{file.name}"
            s3_client.upload_fileobj(file, settings.AWS_STORAGE_BUCKET_NAME, s3_file_path)

            encoded_file_path = urllib.parse.quote(s3_file_path, safe='/')
            file_url = f"https://{settings.AWS_STORAGE_BUCKET_NAME}.s3.amazonaws.com/{encoded_file_path}"
            
            file_type = 'other'
            content_type = file.content_type if hasattr(file, 'content_type') else ''
            extension = file.name.split('.')[-1].lower() if '.' in file.name else ''
            
            if content_type.startswith('image/') or extension in ['jpg', 'jpeg', 'png', 'gif']:
                file_type = 'image'
            elif content_type == 'application/pdf' or extension == 'pdf':
                file_type = 'pdf'
            elif content_type in ['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'] or extension in ['doc', 'docx']:
                file_type = 'docx'
            elif content_type.startswith('video/') or extension in ['mp4', 'avi', 'mov', 'wmv']:
                file_type = 'video'
            
            event_file = EventFile.objects.create(
                event=event,
                file_url=file_url,
                file_type=file_type,
                file_name=file.name
            )
            
            return Response({
                'message': 'File uploaded successfully',
                'file': {
                    'id': event_file.id,
                    'file_url': file_url,
                    'file_type': file_type,
                    'file_name': file.name
                }
            }, status=status.HTTP_201_CREATED)
            
        except ClientError as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)