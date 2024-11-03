from django.urls import path
from .views import (
    QuestionCreateView,
    QuestionUpdateView,
    QuestionDeleteView,
    QuestionListView,
    QuestionDetailView,
    AnswerCreateView,
    AnswerUpdateView,
    AnswerDeleteView,
)

urlpatterns = [
    
    path('create/', QuestionCreateView.as_view(), name='question_create'),
    path('<int:question_id>/edit/', QuestionUpdateView.as_view(), name='question_edit'),
    path('<int:question_id>/delete/', QuestionDeleteView.as_view(), name='question_delete'),
    path('course/<int:course_id>/', QuestionListView.as_view(), name='question_list'),
    path('<int:question_id>/', QuestionDetailView.as_view(), name='question_detail'),
    
    path('<int:question_id>/answer/', AnswerCreateView.as_view(), name='answer_create'),
    path('answer/<int:answer_id>/edit/', AnswerUpdateView.as_view(), name='answer_edit'),
    path('answer/<int:answer_id>/delete/', AnswerDeleteView.as_view(), name='answer_delete'),
]
