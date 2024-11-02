from rest_framework import serializers
from .models import Material, MaterialFile
import urllib.parse

class MaterialFileSerializer(serializers.ModelSerializer):
    file_name = serializers.SerializerMethodField()  

    class Meta:
        model = MaterialFile
        fields = ['id', 'material', 'file_url', 'file_type', 'file_size', 'uploaded_at', 'file_name']

    def get_file_name(self, obj):
        
        parsed_url = urllib.parse.urlparse(obj.file_url)
        return urllib.parse.unquote(parsed_url.path.split('/')[-1])

class MaterialSerializer(serializers.ModelSerializer):
    files = MaterialFileSerializer(many=True, read_only=True)

    class Meta:
        model = Material
        fields = ['id', 'course', 'title', 'description', 'created_at', 'updated_at', 'files']
        read_only_fields = ['created_at', 'updated_at']
