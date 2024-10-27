from django.apps import AppConfig

class ProgressTrackingConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.progress_tracking'
    
    def ready(self):
        import apps.progress_tracking.signals