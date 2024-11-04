# apps/payments/models.py
from django.db import models
from apps.courses.models import Course
from apps.users.models import CustomUser

class Transaction(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='transactions')
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='transactions')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    transaction_date = models.DateTimeField(auto_now_add=True)
    description = models.TextField()

    def __str__(self):
        return f"Transaction for {self.course.title} by {self.user.username}"
