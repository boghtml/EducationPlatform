import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CourseCatalogPage from './components/CourseCatalogPage';
import About from './components/About';
import Events from './components/Events';
import Blog from './components/Blog';
import Reviews from './components/Reviews';
import CourseDetail from './components/CourseDetail';
import Register from './components/Register';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import ForgotPassword from './components/ForgotPassword';
import WorkingWithCourse from './components/WorkingWithCourse';
import LessonDetail from './components/LessonDetail';

import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';

import './css/auth.css';
import './css/courseCatalog.css';
import './css/header.css';
import './css/dashboard.css';

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

        <Route path="/privacy-policy" element={<PrivacyPolicy  />} />
        <Route path="/terms-of-service" element={<TermsOfService  />} />

        <Route path="/my-courses/:courseId" element={<WorkingWithCourse />} />
        <Route path="/courses/:courseId/modules/:moduleId/lessons/:lessonId" element={<LessonDetail />} />
      </Routes>
    </Router>
  );
}

export default App;