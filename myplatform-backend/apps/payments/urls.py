from django.urls import path
from .views import PurchaseCourseView, UserTransactionHistoryView

urlpatterns = [
    path('purchase/', PurchaseCourseView.as_view(), name='purchase_course'),
    path('history/<int:user_id>/', UserTransactionHistoryView.as_view(), name='transaction_history'),
]
