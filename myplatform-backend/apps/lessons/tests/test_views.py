# apps/lessons/tests/test_views.py
from django.test import TestCase, Client
from django.urls import reverse
from rest_framework import status
from django.contrib.auth import get_user_model
from apps.lessons.models import Lesson

class LessonsAPITest(TestCase):

    def setUp(self):
        self.client = Client()
        self.username = "andrii_teacher"
        self.password = "1234567890HTML"
        self.user = get_user_model().objects.create_user(username=self.username, password=self.password, role="teacher")
        self.client.login(username=self.username, password=self.password)
        self.lesson = Lesson.objects.create(
            module_id=1, 
            title="Sample Lesson", 
            content="Lesson Content",
            duration=60
        )

    def test_get_lessons(self):
        response = self.client.get(reverse("get_lessons", kwargs={"module_id": 1}))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("Sample Lesson", response.json())

    def test_lesson_files(self):
        response = self.client.get(reverse("lesson_files", kwargs={"lesson_id": self.lesson.id}))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("file_url", response.json())

    def test_lesson_links(self):
        response = self.client.get(reverse("lesson_links", kwargs={"lesson_id": self.lesson.id}))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("link_url", response.json())
