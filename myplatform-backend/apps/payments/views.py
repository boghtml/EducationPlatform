from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from apps.courses.models import Course
from apps.users.models import CustomUser
from apps.enrollments.models import Enrollment
from .models import Transaction
from .serializers import TransactionSerializer
from apps.assignments.mixins import CsrfExemptSessionAuthentication
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone

class PurchaseCourseView(APIView):
    authentication_classes = (CsrfExemptSessionAuthentication,)
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        course_id = request.data.get('course_id')

        if not course_id:
            return Response({'error': 'Course ID is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            course = Course.objects.get(id=course_id, status='premium')
        except Course.DoesNotExist:
            return Response({'error': 'Course not found or not premium'}, status=status.HTTP_404_NOT_FOUND)

        if Enrollment.objects.filter(course=course, student=user).exists():
            return Response({'error': 'You are already enrolled in this course'}, status=status.HTTP_400_BAD_REQUEST)

        transaction = Transaction.objects.create(
            course=course,
            user=user,
            amount=course.price,
            transaction_date=timezone.now(),
            description=f"Ви придбали курс: '{course.title}'"
        )

        Enrollment.objects.create(course=course, student=user, enrollment_date=timezone.now())

        serializer = TransactionSerializer(transaction)
        return Response({'message': 'Course purchased successfully', 'transaction': serializer.data}, status=status.HTTP_201_CREATED)

class UserTransactionHistoryView(APIView):
    authentication_classes = (CsrfExemptSessionAuthentication,)
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id):
        user = request.user

        if user.id != user_id and not user.is_staff:
            return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)

        transactions = Transaction.objects.filter(user_id=user_id)
        serializer = TransactionSerializer(transactions, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
