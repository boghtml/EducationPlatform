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
import ProtectedRoute from './components/ProtectedRoute';

// Teacher components import
import TeacherDashboard from './components/teacher/TeacherDashboard';
import TeacherCourses from './components/teacher/TeacherCourses';
import TeacherAssignments from './components/teacher/TeacherAssignments';
import TeacherMaterials from './components/teacher/TeacherMaterials';
import TeacherStudents from './components/teacher/TeacherStudents';

import TeacherCreateCourse from './components/teacher/TeacherCreateCourse';
import TeacherCreateModule from './components/teacher/TeacherCreateModule';
import TeacherCreateLesson from './components/teacher/TeacherCreateLesson';
import TeacherCourseDetail from './components/teacher/TeacherCourseDetail';
import TeacherEditCourse from './components/teacher/TeacherEditCourse';
import TeacherEditModule from './components/teacher/TeacherEditModule';
import TeacherModuleDetail from './components/teacher/TeacherModuleDetail';
/*
import TeacherQA from './components/teacher/TeacherQA';
import TeacherAnalytics from './components/teacher/TeacherAnalytics';
import TeacherLessons from './components/teacher/TeacherLessons';
import TeacherSettings from './components/teacher/TeacherSettings';
import TeacherNotifications from './components/teacher/TeacherNotifications';
import TeacherAnnouncements from './components/teacher/TeacherAnnouncements';
import TeacherSchedule from './components/teacher/TeacherSchedule';
import TeacherDiscussions from './components/teacher/TeacherDiscussions';
import TeacherHelp from './components/teacher/TeacherHelp';
*/

// Import CSS files
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
        {/* Public routes */}
        <Route path="/" element={<CourseCatalogPage />} />
        <Route path="/courses/:id" element={<CourseDetail />} />
        <Route path="/about" element={<About />} />
        <Route path="/events" element={<Events />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/reviews" element={<Reviews />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/site-map" element={<SiteMap/>} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/help" element={<HelpCenter />} />

        {/* Protected student routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute 
            element={<Dashboard />} 
            allowedRoles={['student']} 
          />
        } />
        <Route path="/profile/:userId" element={
          <ProtectedRoute 
            element={<Profile />} 
            allowedRoles={['student', 'teacher', 'admin']} 
          />
        } />
        <Route path="/settings" element={
          <ProtectedRoute 
            element={<Settings />} 
            allowedRoles={['student', 'teacher', 'admin']} 
          />
        } />
        <Route path="/subscription" element={
          <ProtectedRoute 
            element={<Subscription />} 
            allowedRoles={['student']} 
          />
        } />

        <Route path="/notes-management" element={
          <ProtectedRoute 
            element={<NotesManagement />}
            allowedRoles={['student']} 
          />
        } />
        <Route path="/my-courses/:courseId" element={
          <ProtectedRoute 
            element={<WorkingWithCourse />}
            allowedRoles={['student']} 
          />
        }>
          <Route index element={<LessonsTab />} />
          <Route path="lessons" element={<LessonsTab />} />
          <Route path="assignments" element={<AssignmentsTab />} />
          <Route path="tests" element={<TestsTab />} />
          <Route path="discussions" element={<DiscussionsTab />} />
          <Route path="qa" element={<QATab />} />
          <Route path="participants" element={<ParticipantsTab />} />
          <Route path="grades" element={<GradesTab />} />
        </Route>
        <Route path="/courses/:courseId/modules/:moduleId/lessons/:lessonId" element={
          <ProtectedRoute 
            element={<LessonDetail />}
            allowedRoles={['student']} 
          />
        } />
        <Route path="/assignments/:assignmentId" element={
          <ProtectedRoute 
            element={<AssignmentDetails />}
            allowedRoles={['student']} 
          />
        } />
        <Route path="/qa/:questionId" element={
          <ProtectedRoute 
            element={<QADetails />}
            allowedRoles={['student', 'teacher']} 
          />
        } />
        
        {/* Teacher routes - доступ тільки з роллю 'teacher' */}
        <Route path="/teacher/dashboard" element={
          <ProtectedRoute 
            element={<TeacherDashboard />}
            allowedRoles={['teacher']} 
          />
        } />
        <Route path="/teacher/courses" element={
          <ProtectedRoute 
            element={<TeacherCourses />}
            allowedRoles={['teacher']} 
          />
        } />
        <Route path="/teacher/courses/:courseId" element={
          <ProtectedRoute 
            element={<TeacherCourseDetail />}
            allowedRoles={['teacher']} 
          />
        } />
        <Route path="/teacher/courses/:courseId/edit" element={
          <ProtectedRoute 
            element={<TeacherEditCourse />}
            allowedRoles={['teacher']} 
          />
        } />
        {/* Нові маршрути для створення курсу, модуля та уроку */}
        <Route path="/teacher/courses/create" element={
          <ProtectedRoute 
            element={<TeacherCreateCourse />}
            allowedRoles={['teacher']} 
          />
        } />
        <Route path="/teacher/courses/:courseId/create-module" element={
          <ProtectedRoute 
            element={<TeacherCreateModule />}
            allowedRoles={['teacher']} 
          />
        } />
        <Route path="/teacher/modules/:moduleId/create-lesson" element={
          <ProtectedRoute 
            element={<TeacherCreateLesson />}
            allowedRoles={['teacher']} 
          />
        } />
        <Route path="/teacher/modules/:moduleId/edit" element={
          <ProtectedRoute 
            element={<TeacherEditModule />}
            allowedRoles={['teacher']} 
          />
        } />
        <Route path="/teacher/modules/:moduleId" element={
          <ProtectedRoute 
            element={<TeacherModuleDetail />}
            allowedRoles={['teacher']} 
          />
        } />
        <Route path="/teacher/assignments" element={
          <ProtectedRoute 
            element={<TeacherAssignments />}
            allowedRoles={['teacher']} 
          />
        } />
        <Route path="/teacher/materials" element={
          <ProtectedRoute 
            element={<TeacherMaterials />}
            allowedRoles={['teacher']} 
          />
        } />
        <Route path="/teacher/materials/create" element={
          <ProtectedRoute 
            element={<TeacherMaterials />}
            allowedRoles={['teacher']} 
          />
        } />
        <Route path="/teacher/materials/:materialId" element={
          <ProtectedRoute 
            element={<TeacherMaterials />}
            allowedRoles={['teacher']} 
          />
        } />
        <Route path="/teacher/materials/:materialId/edit" element={
          <ProtectedRoute 
            element={<TeacherMaterials />}
            allowedRoles={['teacher']} 
          />
        } />
        <Route path="/teacher/students" element={
          <ProtectedRoute 
            element={<TeacherStudents />}
            allowedRoles={['teacher']} 
          />
        } />
        <Route path="/teacher/students/:studentId/progress" element={
          <ProtectedRoute 
            element={<TeacherStudents />}
            allowedRoles={['teacher']} 
          />
        } />
       
       

        
        {
          /*
           <Route path="/teacher/analytics" element={
          <ProtectedRoute 
            element={<TeacherAnalytics />}
            allowedRoles={['teacher']} 
          />
        } />
      
              <Route path="/teacher/lessons" element={
          <ProtectedRoute 
            element={<TeacherLessons />}
            allowedRoles={['teacher']} 
          />
        } />

           <Route path="/teacher/qa" element={
          <ProtectedRoute 
            element={<TeacherQA />}
            allowedRoles={['teacher']} 
          />
        } />
                    <Route path="/teacher/announcements" element={
          <ProtectedRoute 
            element={<TeacherAnnouncements />}
            allowedRoles={['teacher']} 
          />
        } />
        <Route path="/teacher/notifications" element={
          <ProtectedRoute 
            element={<TeacherNotifications />}
            allowedRoles={['teacher']} 
          />
        } />
        <Route path="/teacher/schedule" element={
          <ProtectedRoute 
            element={<TeacherSchedule />}
            allowedRoles={['teacher']} 
          />
        } />
        <Route path="/teacher/discussions" element={
          <ProtectedRoute 
            element={<TeacherDiscussions />}
            allowedRoles={['teacher']} 
          />
        } />
        <Route path="/teacher/settings" element={
          <ProtectedRoute 
            element={<TeacherSettings />}
            allowedRoles={['teacher']} 
          />
        } />
        <Route path="/teacher/help" element={
          <ProtectedRoute 
            element={<TeacherHelp />}
            allowedRoles={['teacher']} 
          />
        } />
          */
        }
      </Routes>
    </Router>
  );
}

export default App;