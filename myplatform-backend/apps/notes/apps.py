# apps/notes/apps.py

from django.apps import AppConfig

class NotesConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.notes'  # Зверніть увагу на зміну тут
