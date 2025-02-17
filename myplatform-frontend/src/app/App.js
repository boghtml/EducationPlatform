import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CourseCatalogPage from '../views/CourseCatalogPage';
import About from '../views/About';
import Events from '../views/Events';
import Blog from '../views/Blog';
import Reviews from '../views/Reviews';
import CourseDetail from '../views/CourseDetail';
import Register from '../views/Register';
import Login from '../views/Login';
import Dashboard from '../views/Dashboard';
import ForgotPassword from '../views/ForgotPassword';
import WorkingWithCourse from '../views/WorkingWithCourse';
import LessonDetail from '../views/LessonDetail';

import PrivacyPolicy from '../views/PrivacyPolicy';
import TermsOfService from '../views/TermsOfService';
import UserProfile from '../views/profile/ProfilePage';
import TeacherDashboard from '../views/users/teacher/TeacherCourses';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<CourseCatalogPage />} />
        <Route path="/courses/:id" element={<CourseDetail />} />
        <Route path="/about" element={<About />} />
        <Route path="/events" element={<Events />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/reviews" element={<Reviews />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/dashboard-teacher" element={<TeacherDashboard />} />

        <Route path="/privacy-policy" element={<PrivacyPolicy  />} />
        <Route path="/terms-of-service" element={<TermsOfService  />} />

        <Route path="/my-courses/:courseId" element={<WorkingWithCourse />} />
        <Route path="/courses/:courseId/modules/:moduleId/lessons/:lessonId" element={<LessonDetail />} />
      </Routes>
    </Router>
  );
}

export default App;