from django.test import TestCase, Client
from django.urls import reverse
from rest_framework import status
from django.contrib.auth import get_user_model
from apps.lessons.models import Lesson
from apps.modules.models import Module
from apps.courses.models import Course
from apps.lessons.models import LessonLink  # Імпортуємо модель для посилань
from datetime import date, timedelta

class LessonsAPITest(TestCase):

    def setUp(self):
        self.client = Client()
        self.username = "andrii_teacher"
        self.password = "1234567890HTML"
        self.user = get_user_model().objects.create_user(username=self.username, password=self.password, role="teacher")
        self.client.login(username=self.username, password=self.password)
       
        self.course = Course.objects.create(
            title="Sample Course",
            description="Course Description",
            teacher=self.user,
            start_date=date.today(),
            end_date=date.today() + timedelta(days=30),
            duration=30,
            batch_number=1,
            status='free' 
        )

        self.module = Module.objects.create(
            course=self.course,
            title="Sample Module",
            description="Module Description"
        )

        self.lesson = Lesson.objects.create(
            module=self.module,
            title="Sample Lesson",
            content="Lesson Content",
            duration=60
        )

        self.lesson_link = LessonLink.objects.create(
            lesson=self.lesson,
            link_url="https://example.com"
        )

    def test_get_lessons(self):
        response = self.client.get(reverse("lessons_by_module", kwargs={"module_id": self.module.id}))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("Sample Lesson", [lesson['title'] for lesson in response.json()])

    def test_lesson_links(self):
        response = self.client.get(reverse("lesson_links", kwargs={"lesson_id": self.lesson.id}))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Перевіряємо, що 'link_url' є в отриманих даних
        links = response.json()
        link_urls = [link['link_url'] for link in links]
        self.assertIn("https://example.com", link_urls)
