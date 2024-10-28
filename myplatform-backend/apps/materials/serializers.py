from rest_framework import serializers
from .models import Material, MaterialFile

class MaterialFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = MaterialFile
        fields = ['id', 'file_url', 'file_type', 'file_size', 'uploaded_at']

class MaterialSerializer(serializers.ModelSerializer):
    files = MaterialFileSerializer(many=True, read_only=True)

    class Meta:
        model = Material
        fields = ['id', 'course', 'title', 'description', 'created_at', 'updated_at', 'files']
        read_only_fields = ['created_at', 'updated_at']
