<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
</head>
<body>

<h1>Education Platform</h1>

<p>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License"></a>
  <a href="https://www.python.org/downloads/"><img src="https://img.shields.io/badge/python-3.11%2B-blue" alt="Python Version"></a>
  <a href="https://www.djangoproject.com/"><img src="https://img.shields.io/badge/django-4.0%2B-blue" alt="Django Version"></a>
  <a href="https://reactjs.org/"><img src="https://img.shields.io/badge/react-18.0%2B-blue" alt="React Version"></a>
</p>

<h2>Table of Contents</h2>
<ul>
  <li><a href="#overview">Overview</a></li>
  <li><a href="#features">Features</a>
    <ul>
      <li><a href="#user-roles-and-permissions">User Roles and Permissions</a>
        <ul>
          <li><a href="#student">Student</a></li>
          <li><a href="#teacher">Teacher</a></li>
          <li><a href="#administrator">Administrator</a></li>
        </ul>
      </li>
      <li><a href="#core-functionality">Core Functionality</a>
        <ul>
          <li><a href="#authentication-and-authorization">Authentication and Authorization</a></li>
          <li><a href="#course-management">Course Management</a></li>
          <li><a href="#assignments-and-submissions">Assignments and Submissions</a></li>
          <li><a href="#analytics-dashboard">Analytics Dashboard</a></li>
          <li><a href="#notifications">Notifications</a></li>
          <li><a href="#file-management">File Management</a></li>
        </ul>
      </li>
    </ul>
  </li>
  <li><a href="#technologies-used">Technologies Used</a></li>
  <li><a href="#architecture">Architecture</a>
    <ul>
      <li><a href="#backend">Backend</a></li>
      <li><a href="#frontend">Frontend</a></li>
      <li><a href="#database-schema">Database Schema</a></li>
      <li><a href="#file-storage-structure">File Storage Structure</a></li>
    </ul>
  </li>
  <li><a href="#installation">Installation</a>
    <ul>
      <li><a href="#prerequisites">Prerequisites</a></li>
      <li><a href="#backend-setup">Backend Setup</a></li>
      <li><a href="#frontend-setup">Frontend Setup</a></li>
    </ul>
  </li>
  <li><a href="#usage">Usage</a>
    <ul>
      <li><a href="#running-the-application">Running the Application</a></li>
      <li><a href="#accessing-the-application">Accessing the Application</a></li>
    </ul>
  </li>
  <li><a href="#api-documentation">API Documentation</a></li>
  <li><a href="#project-structure">Project Structure</a></li>
  <li><a href="#contributing">Contributing</a></li>
  <li><a href="#license">License</a></li>
  <li><a href="#contact-information">Contact Information</a></li>
</ul>

<hr>

<h2 id="overview">Overview</h2>

<p>The <strong>Education Platform</strong> is a comprehensive web application designed to facilitate online learning. It offers a wide range of functionalities for students, teachers, and administrators. Built using modern technologies like Django for the backend and React for the frontend, the platform aims to provide an interactive and user-friendly experience.</p>
<b> To view the functionality, go to the MASTER branch </b>
<hr>

<h2 id="features">Features</h2>

<h3 id="user-roles-and-permissions">User Roles and Permissions</h3>

<p>The platform supports three primary user roles, each with specific permissions and functionalities:</p>

<h4 id="student">Student</h4>
<ul>
  <li><strong>Registration and Authentication</strong></li>
  <li><strong>Course Enrollment</strong>: Enroll in free and premium courses.</li>
  <li><strong>Course Progression</strong>: Access course materials, lessons, and modules.</li>
  <li><strong>Assignments</strong>: Submit assignments and view feedback.</li>
  <li><strong>Notes</strong>: Create personal notes and organize them into folders.</li>
  <li><strong>Forum Participation</strong>: Engage in discussions with peers and instructors.</li>
  <li><strong>Progress Tracking</strong>: Monitor learning progress and achievements.</li>
</ul>

<h4 id="teacher">Teacher</h4>
<ul>
  <li><strong>Course Creation</strong>: Develop and manage courses, modules, and lessons.</li>
  <li><strong>Assignment Management</strong>: Create assignments and grade submissions.</li>
  <li><strong>Material Upload</strong>: Add supplementary materials to courses.</li>
  <li><strong>Forum Moderation</strong>: Interact with students and moderate discussions.</li>
  <li><strong>Category Management</strong>: Organize courses into relevant categories.</li>
</ul>

<h4 id="administrator">Administrator</h4>
<ul>
  <li><strong>User Management</strong>: Add, edit, or remove users; assign roles.</li>
  <li><strong>Analytics Dashboard</strong>: Access detailed analytics about platform usage.</li>
  <li><strong>Full Access</strong>: All permissions available to teachers.</li>
</ul>

<h3 id="core-functionality">Core Functionality</h3>

<h4 id="authentication-and-authorization">Authentication and Authorization</h4>
<ul>
  <li>Secure user registration and login using email and password.</li>
  <li>Role-based access control to restrict functionalities based on user roles.</li>
  <li>Password reset and profile management capabilities.</li>
</ul>

<h4 id="course-management">Course Management</h4>
<ul>
  <li><strong>Browse Courses</strong>: View available courses with detailed descriptions.</li>
  <li><strong>Enroll in Courses</strong>: Students can enroll in courses of interest.</li>
  <li><strong>Course Creation and Editing</strong>: Teachers and admins can create and modify courses.</li>
  <li><strong>Categorization</strong>: Organize courses into categories for easy navigation.</li>
</ul>

<h4 id="assignments-and-submissions">Assignments and Submissions</h4>
<ul>
  <li><strong>Assignment Creation</strong>: Teachers can create assignments with deadlines.</li>
  <li><strong>Submission Handling</strong>: Students can submit assignments; teachers can grade and provide feedback.</li>
  <li><strong>Status Tracking</strong>: Monitor the status of assignments (assigned, submitted, graded, returned).</li>
</ul>

<h4 id="analytics-dashboard">Analytics Dashboard</h4>
<ul>
  <li><strong>Overview Metrics</strong>: Total courses, categories, students, teachers.</li>
  <li><strong>User Activity</strong>: Active students, new registrations, enrollment stats.</li>
  <li><strong>Course Analytics</strong>: Most popular courses, completion rates.</li>
  <li><strong>Assignment Analytics</strong>: Submission rates, grading timelines.</li>
</ul>

<h4 id="notifications">Notifications</h4>
<ul>
  <li><strong>Email Notifications</strong>: Automated emails for important events (enrollment confirmation, assignment deadlines).</li>
  <li><strong>SMS Notifications</strong>: Optional SMS alerts for critical updates.</li>
  <li><strong>In-App Notifications</strong>: Real-time updates within the platform.</li>
</ul>

<h4 id="file-management">File Management</h4>
<ul>
  <li><strong>AWS S3 Integration</strong>: Secure and scalable file storage for media and documents.</li>
  <li><strong>Structured File Organization</strong>: Files organized by courses, assignments, users.</li>
  <li><strong>Media Handling</strong>: Support for various media types (videos, PDFs, images).</li>
</ul>

<hr>

<h2 id="technologies-used">Technologies Used</h2>

<ul>
  <li><strong>Backend</strong>:
    <ul>
      <li>Python 3.11+</li>
      <li>Django 4.0+</li>
      <li>Django REST Framework</li>
      <li>PostgreSQL (via Amazon RDS)</li>
      <li>Redis (for caching)</li>
    </ul>
  </li>
  <li><strong>Frontend</strong>:
    <ul>
      <li>React 18.0+</li>
      <li>Redux (state management)</li>
      <li>Axios (HTTP requests)</li>
      <li>Bootstrap and custom CSS for styling</li>
    </ul>
  </li>
  <li><strong>Cloud Services</strong>:
    <ul>
      <li>Amazon Web Services (AWS)
        <ul>
          <li>EC2 or Elastic Beanstalk (deployment)</li>
          <li>S3 (file storage)</li>
          <li>RDS (PostgreSQL database)</li>
          <li>IAM (security and access management)</li>
          <li>CloudWatch (monitoring and logging)</li>
        </ul>
      </li>
    </ul>
  </li>
  <li><strong>Authentication</strong>:
    <ul>
      <li>Django's built-in authentication system</li>
      <li>Token-based authentication (JWT)</li>
    </ul>
  </li>
  <li><strong>Other Tools</strong>:
    <ul>
      <li>Docker (containerization)</li>
      <li>Git and GitHub (version control)</li>
      <li>Postman (API testing)</li>
      <li>Swagger/OpenAPI (API documentation)</li>
    </ul>
  </li>
</ul>

<hr>

<h2 id="architecture">Architecture</h2>

<h3 id="backend">Backend</h3>

<p>The backend is built using Django and Django REST Framework, following an app-based modular structure. Each app is responsible for a specific domain of the platform:</p>

<ul>
  <li><code>users</code>: User management and authentication</li>
  <li><code>courses</code>: Course creation and management</li>
  <li><code>assignments</code>: Assignment handling and submissions</li>
  <li><code>analytics</code>: Platform analytics and reporting</li>
  <li><code>notifications</code>: Email and SMS notifications</li>
  <li><code>media</code>: Media file management</li>
</ul>

![image](https://github.com/user-attachments/assets/01a20435-969d-4591-90db-c3173446b13f)

<h3 id="frontend">Frontend</h3>

<p>The frontend is developed using React, providing a responsive and interactive user interface. It communicates with the backend via RESTful APIs.</p>

<h3 id="database-schema">Database Schema</h3>

<p>The platform uses a PostgreSQL database with a well-structured schema to maintain data integrity and relationships. Key tables include:</p>

<ul>
  <li><code>users</code>: Stores user information and roles</li>
  <li><code>courses</code>: Contains course details and metadata</li>
  <li><code>modules</code> and <code>lessons</code>: Breakdown of courses into consumable units</li>
  <li><code>assignments</code> and <code>submissions</code>: Handles assignment distribution and student submissions</li>
  <li><code>enrollments</code>: Tracks student course enrollments</li>
  <li><code>analytics</code>: Stores aggregated data for reporting</li>
</ul>

![image](https://github.com/user-attachments/assets/8fedca2b-c2d3-4bfc-8d85-895c90eca3c8)


<h3 id="file-storage-structure">File Storage Structure</h3>

<p>Files are stored in AWS S3 buckets with a hierarchical structure:</p>

<pre><code>- Courses/
  - course_id/
    - assignments/
      - assignment_id/
    - course_files/
    - lessons/
      - lesson_id/
    - materials/
      - material_id/
    - submissions/
      - submission_id/
- Users/
  - user_id/
    - profile_image.jpg
    - documents/
</code></pre>

![image](https://github.com/user-attachments/assets/3878e432-01dd-48f7-a854-5cffc8598fa0)

<hr>

<h2 id="installation">Installation</h2>
![image](https://github.com/user-attachments/assets/7db0d86b-2a4f-4be5-a212-a786981d1f7f)

<h3 id="prerequisites">Prerequisites</h3>

<ul>
  <li><strong>Python</strong>: Version 3.11 or higher</li>
  <li><strong>Node.js</strong>: Version 14 or higher</li>
  <li><strong>PostgreSQL</strong>: For the database</li>
  <li><strong>AWS Account</strong>: For cloud services (optional for local setup)</li>
  <li><strong>Docker</strong>: If you prefer containerization</li>
</ul>

<h3 id="backend-setup">Backend Setup</h3>

<ol>
  <li><strong>Clone the Repository</strong>
    <pre><code>git clone https://github.com/boghtml/education-platform.git
cd education-platform/myplatform-backend
</code></pre>
  </li>
  <li><strong>Create and Activate a Virtual Environment</strong>
    <pre><code>python -m venv venv
source venv/bin/activate  # On Windows use `venv\Scripts\activate`
</code></pre>
  </li>
  <li><strong>Install Required Packages</strong>
    <pre><code>pip install -r requirements.txt
</code></pre>
  </li>
  <li><strong>Configure Environment Variables</strong>
    <p>Create a <code>.env</code> file in the <code>myplatform-backend</code> directory with the following variables:</p>
    <pre><code>SECRET_KEY=your_secret_key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

DATABASE_NAME=your_db_name
DATABASE_USER=your_db_user
DATABASE_PASSWORD=your_db_password
DATABASE_HOST=localhost
DATABASE_PORT=5432

AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_STORAGE_BUCKET_NAME=your_s3_bucket_name
</code></pre>
  </li>
  <li><strong>Configure the Database</strong>
    <p>Ensure PostgreSQL is running and the database is created. Update the <code>DATABASES</code> settings in <code>myplatform/settings.py</code> or use environment variables as above.</p>
  </li>
  <li><strong>Run Migrations</strong>
    <pre><code>python manage.py migrate
</code></pre>
  </li>
  <li><strong>Create a Superuser</strong>
    <pre><code>python manage.py createsuperuser
</code></pre>
  </li>
  <li><strong>Collect Static Files</strong>
    <pre><code>python manage.py collectstatic
</code></pre>
  </li>
  <li><strong>Run the Development Server</strong>
    <pre><code>python manage.py runserver
</code></pre>
  </li>
</ol>

<h3 id="frontend-setup">Frontend Setup</h3>

<ol>
  <li><strong>Navigate to the Frontend Directory</strong>
    <pre><code>cd ../myplatform-frontend
</code></pre>
  </li>
  <li><strong>Install Required Packages</strong>
    <pre><code>npm install
</code></pre>
  </li>
  <li><strong>Configure Environment Variables</strong>
    <p>Create a <code>.env</code> file in the <code>myplatform-frontend</code> directory with the following variables:</p>
    <pre><code>REACT_APP_API_BASE_URL=http://localhost:8000/api
</code></pre>
  </li>
  <li><strong>Start the Development Server</strong>
    <pre><code>npm start
</code></pre>
    <p>The frontend development server will start at <code>http://localhost:3000</code>.</p>
  </li>
</ol>

<hr>

<h2 id="usage">Usage</h2>

<h3 id="running-the-application">Running the Application</h3>

<ol>
  <li><strong>Backend</strong>: Ensure the backend server is running on <code>http://localhost:8000</code>.</li>
  <li><strong>Frontend</strong>: Ensure the frontend server is running on <code>http://localhost:3000</code>.</li>
</ol>

<h3 id="accessing-the-application">Accessing the Application</h3>

<ol>
  <li><strong>Open Browser</strong>: Navigate to <code>http://localhost:3000</code>.</li>
  <li><strong>Register a New User</strong>: Fill out the registration form to create a new account.</li>
  <li><strong>Login</strong>: Use your credentials to log in.</li>
  <li><strong>Explore</strong>:
    <ul>
      <li><strong>Students</strong>: Enroll in courses, submit assignments, and interact on forums.</li>
      <li><strong>Teachers</strong>: Create courses, add assignments, and manage enrolled students.</li>
      <li><strong>Administrators</strong>: Access the analytics dashboard and manage platform users.</li>
    </ul>
  </li>
</ol>

<hr>

<h2 id="api-documentation">API Documentation</h2>
<p>The platform's API follows RESTful principles and provides over 100 endpoints to manage its various features. It is documented using <strong>Swagger</strong> and <strong>Redoc</strong> for ease of access and testing.</p>

<ul>
    <li><strong>Base URL</strong>: <code>http://localhost:8000/api/</code></li>
</ul>

<p>Swagger and Redoc allow developers to explore and test all endpoints interactively. Swagger offers a user-friendly UI for live testing and debugging of API endpoints, while Redoc provides a clean, structured view of the API documentation.</p>

<hr>

<h2>Overview of applications and their BASIC endpoints</h2>

**More than 100 endpoints have been developed on the backend** and here short list of them:

<h3>1. Users App</h3>
<p>Manages user accounts, authentication, and profiles.</p>
<ul>
    <li><strong>Authentication Endpoints</strong>:
        <ul>
            <li>User Registration: <code>POST /api/users/register/</code></li>
            <li>User Login: <code>POST /api/users/login/</code></li>
            <li>Password Reset Request: <code>POST /api/users/reset-password-request/</code></li>
            <li>Password Reset Confirm: <code>POST /api/users/reset-password-confirm/</code></li>
        </ul>
    </li>
    <li><strong>User Management Endpoints</strong>:
        <ul>
            <li>Update Profile: <code>PUT /api/users/update-profile/&lt;int:user_id&gt;/</code></li>
            <li>Upload Profile Image: <code>POST /api/users/upload-profile-image/&lt;int:user_id&gt;/</code></li>
            <li>Get Student Details: <code>GET /api/users/student/&lt;int:id&gt;/</code></li>
            <li>Get Teacher Details: <code>GET /api/users/teacher/&lt;int:id&gt;/</code></li>
        </ul>
    </li>
</ul>

<h3>2. Courses App</h3>
<p>Handles course creation, management, and enrollment.</p>
<ul>
    <li>Course List: <code>GET /api/courses/</code></li>
    <li>Course Detail: <code>GET /api/courses/&lt;int:course_id&gt;/</code></li>
    <li>Add Course: <code>POST /api/courses/</code></li>
    <li>Update Course: <code>PUT /api/courses/&lt;int:course_id&gt;/</code></li>
    <li>Delete Course: <code>DELETE /api/courses/&lt;int:course_id&gt;/</code></li>
</ul>

<h3>3. Assignments App</h3>
<p>Facilitates assignment creation, submission, and feedback.</p>
<ul>
    <li>Assignment List: <code>GET /api/assignments/</code></li>
    <li>Assignment Detail: <code>GET /api/assignments/&lt;int:assignment_id&gt;/</code></li>
    <li>Submit Assignment: <code>POST /api/assignments/submit/</code></li>
</ul>

<h3>4. Analytics App</h3>
<p>Provides analytical insights and reports for administrators.</p>
<ul>
    <li>Admin Analytics: <code>GET /api/analytics/admin-analytics/</code></li>
</ul>

<h3>5. Progress Tracking App</h3>
<p>Monitors student progress in courses, lessons, and assignments.</p>
<ul>
    <li>Get Progress: <code>GET /api/progress/&lt;int:student_id&gt;/</code></li>
    <li>Update Progress: <code>PUT /api/progress/&lt;int:student_id&gt;/</code></li>
</ul>

<h3>6. Notifications App</h3>
<p>Manages real-time and scheduled notifications for users.</p>
<ul>
    <li>List Notifications: <code>GET /api/notifications/</code></li>
    <li>Mark as Read: <code>PUT /api/notifications/&lt;int:id&gt;/read/</code></li>
</ul>

<h3>7. Notes App</h3>
<p>Allows students to create and manage personal notes.</p>
<ul>
    <li>List Notes: <code>GET /api/notes/</code></li>
    <li>Add Note: <code>POST /api/notes/</code></li>
    <li>Update Note: <code>PUT /api/notes/&lt;int:note_id&gt;/</code></li>
    <li>Delete Note: <code>DELETE /api/notes/&lt;int:note_id&gt;/</code></li>
</ul>

<h3>8. Materials App</h3>
<p>Facilitates the management of lesson materials and additional resources.</p>
<ul>
    <li>List Materials: <code>GET /api/materials/&lt;int:lesson_id&gt;/</code></li>
    <li>Upload Material: <code>POST /api/materials/&lt;int:lesson_id&gt;/</code></li>
</ul>

<h3>9. Payments App</h3>
<p>Handles payment processing and course enrollment fees.</p>
<ul>
    <li>Initiate Payment: <code>POST /api/payments/initiate/</code></li>
    <li>Verify Payment: <code>POST /api/payments/verify/</code></li>
</ul>

<h3>10. Forum/Questions App</h3>
<p>Supports discussions and Q&A among students and teachers.</p>
<ul>
    <li>Post Question: <code>POST /api/questions/</code></li>
    <li>Answer Question: <code>POST /api/questions/&lt;int:question_id&gt;/answers/</code></li>
    <li>List Questions: <code>GET /api/questions/</code></li>
</ul>

<h2>Swagger and Redoc Integration</h2>
<p>The platform uses Swagger and Redoc to document and test APIs:</p>
<ul>
    <li><strong>Swagger</strong>: Provides an interactive API interface to test endpoints directly from the browser.</li>
    <li><strong>Redoc</strong>: Offers clean, structured documentation for developers and stakeholders.</li>
</ul>
<p>To access the documentation:</p>
<ul>
    <li>Swagger: <code>http://localhost:8000/swagger/</code></li>
    <li>Redoc: <code>http://localhost:8000/redoc/</code></li>
</ul>
<p>These tools simplify API exploration and reduce integration errors.</p>

<hr>

<h2 id="project-structure">Project Structure</h2>
<pre><code>EducationPlatform/
│
├── myplatform-backend/
│   ├── myplatform/
│   │   ├── __init__.py
│   │   ├── asgi.py
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   ├── apps/
│   │   ├── analytics/
│   │   │   ├── migrations/
│   │   │   ├── serializers.py
│   │   │   ├── urls.py
│   │   │   └── views.py
│   │   ├── assignments/
│   │   │   ├── migrations/
│   │   │   ├── models.py
│   │   │   ├── serializers.py
│   │   │   ├── urls.py
│   │   │   └── views.py
│   │   ├── categories/
│   │   │   ├── migrations/
│   │   │   ├── models.py
│   │   │   ├── serializers.py
│   │   │   ├── urls.py
│   │   │   └── views.py
│   │   ├── courses/
│   │   │   ├── migrations/
│   │   │   ├── models.py
│   │   │   ├── serializers.py
│   │   │   ├── urls.py
│   │   │   └── views.py
│   │   ├── enrollments/
│   │   │   ├── migrations/
│   │   │   ├── models.py
│   │   │   ├── serializers.py
│   │   │   ├── urls.py
│   │   │   └── views.py
│   │   ├── lessons/
│   │   │   ├── migrations/
│   │   │   ├── models.py
│   │   │   ├── serializers.py
│   │   │   ├── urls.py
│   │   │   └── views.py
│   │   ├── materials/
│   │   │   ├── migrations/
│   │   │   ├── models.py
│   │   │   ├── serializers.py
│   │   │   ├── urls.py
│   │   │   └── views.py
│   │   ├── modules/
│   │   │   ├── migrations/
│   │   │   ├── models.py
│   │   │   ├── serializers.py
│   │   │   ├── urls.py
│   │   │   └── views.py
│   │   ├── notes/
│   │   │   ├── migrations/
│   │   │   ├── models.py
│   │   │   ├── serializers.py
│   │   │   ├── urls.py
│   │   │   └── views.py
│   │   ├── notifications/
│   │   │   ├── migrations/
│   │   │   ├── email.py
│   │   │   ├── sms.py
│   │   │   ├── urls.py
│   │   │   └── views.py
│   │   ├── payments/
│   │   │   ├── migrations/
│   │   │   ├── models.py
│   │   │   ├── serializers.py
│   │   │   ├── urls.py
│   │   │   └── views.py
│   │   ├── progress_tracking/
│   │   │   ├── migrations/
│   │   │   ├── models.py
│   │   │   ├── serializers.py
│   │   │   ├── urls.py
│   │   │   └── views.py
│   │   ├── questions/
│   │   │   ├── migrations/
│   │   │   ├── models.py
│   │   │   ├── serializers.py
│   │   │   ├── urls.py
│   │   │   └── views.py
│   │   ├── users/
│   │   │   ├── migrations/
│   │   │   ├── templates/
│   │   │   ├── forms.py
│   │   │   ├── models.py
│   │   │   ├── serializers.py
│   │   │   ├── urls.py
│   │   │   └── views.py
│   ├── media/
│   │   ├── aws.py
│   │   └── utils.py
│   ├── manage.py
│   ├── requirements.txt
│   └── .env
│
├── .gitignore
└── README.md
</code></pre>

<hr>

<h2 id="contributing">Contributing</h2>

<p>We welcome contributions to improve the Education Platform. To contribute:</p>

<ol>
  <li><strong>Fork the Repository</strong>
    <p>Click the "Fork" button at the top-right corner of the repository page.</p>
  </li>
  <li><strong>Clone Your Fork</strong>
    <pre><code>git clone https://github.com/boghtml/education-platform.git
</code></pre>
  </li>
  <li><strong>Create a New Branch</strong>
    <pre><code>git checkout -b feature/your-feature-name
</code></pre>
  </li>
  <li><strong>Make Your Changes</strong>
    <p>Implement your feature or bug fix.</p>
  </li>
  <li><strong>Commit Your Changes</strong>
    <pre><code>git commit -am 'Add new feature'
</code></pre>
  </li>
  <li><strong>Push to Your Branch</strong>
    <pre><code>git push origin feature/your-feature-name
</code></pre>
  </li>
  <li><strong>Create a Pull Request</strong>
    <p>Go to the original repository and open a pull request.</p>
  </li>
</ol>

<hr>

<p>Thank you for your interest in the Education Platform! We hope this platform serves as a valuable resource for educators and learners alike.</p>

</body>
</html>
