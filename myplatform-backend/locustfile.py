# locustfile.py
from locust import HttpUser, TaskSet, task, between

class UserBehavior(TaskSet):
    
    def on_start(self):
        
        self.client.post("/api/users/login/", json={
            "username": "boghtml@gmail.com",
            "password": "1234567890HTMLl"
        })


    @task(1)
    def get_courses(self):
        self.client.get("/api/courses/")

    @task(2)
    def get_modules(self):
        self.client.get("/api/modules/get_modules/2/")
    
    @task(3)
    def get_lessons(self):
        self.client.get("/api/lessons/get_lessons/1/")

    @task(4)
    def lesson_files(self):
        self.client.get("/api/lessons/2/files/")
    
    @task(5)
    def lesson_links(self):
        self.client.get("/api/lessons/2/links/")
    

class WebsiteUser(HttpUser):
    tasks = [UserBehavior]
    wait_time = between(1, 5)
