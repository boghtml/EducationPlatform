import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CourseCatalogPage from './components/CourseCatalogPage';
import About from './components/About';
import Events from './components/Events';
import Blog from './components/Blog';
import Reviews from './components/Reviews';
import CourseDetail from './components/CourseDetail';
import Register from './components/Register'; // Імпортуйте компонент реєстрації
import Login from './components/Login';
import Dashboard from './components/Dashboard';

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
        <Route path="/register" element={<Register />} /> {/* Додайте маршрут */}
        <Route path="/login" element={<Login />} /> {/* Додаємо маршрут */}
        <Route path="/Dashboard" element={<Dashboard />} /> {/* Додаємо маршрут */}

      </Routes>
    </Router>
  );
}

export default App;
