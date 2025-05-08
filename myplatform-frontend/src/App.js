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
import AssignmentDetails from './components/AssignmentDetails';
import QADetails from './components/QADetails';
import Profile from './components/Profile';
import LessonsTab from './components/LessonsTab';
import AssignmentsTab from './components/AssignmentsTab';
import TestsTab from './components/TestsTab';
import DiscussionsTab from './components/DiscussionsTab';
import QATab from './components/QATab';
import ParticipantsTab from './components/ParticipantsTab';
import GradesTab from './components/GradesTab';
import NotesManagement from './components/NotesManagement';
import SiteMap from './components/SiteMap';
import Contact from './components/Contact';
import FAQ from './components/FAQ';
import HelpCenter from './components/HelpCenter';
import Subscription from './components/Subscription';
import Settings from './components/Settings';

import './css/auth.css';
import './css/courseCatalog.css';
import './css/header.css';
import './css/dashboard.css';
import './css/NotesPanel.css';
import './css/NotesManagement.css';
import './css/subscription.css';
import './css/settings.css';

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
        
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/site-map" element={<SiteMap/>} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/help" element={<HelpCenter />} />

        {/* New Routes */}
        <Route path="/profile/:userId" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/subscription" element={<Subscription />} />

        <Route path="/notes-management" element={<NotesManagement />} />
        <Route path="/my-courses/:courseId" element={<WorkingWithCourse />}>
          <Route index element={<LessonsTab />} />
          <Route path="lessons" element={<LessonsTab />} />
          <Route path="assignments" element={<AssignmentsTab />} />
          <Route path="tests" element={<TestsTab />} />
          <Route path="discussions" element={<DiscussionsTab />} />
          <Route path="qa" element={<QATab />} />
          <Route path="participants" element={<ParticipantsTab />} />
          <Route path="grades" element={<GradesTab />} />
        </Route>
        <Route path="/courses/:courseId/modules/:moduleId/lessons/:lessonId" element={<LessonDetail />} />
        <Route path="/assignments/:assignmentId" element={<AssignmentDetails />} />
        <Route path="/qa/:questionId" element={<QADetails />} />
      </Routes>
    </Router>
  );
}

export default App;