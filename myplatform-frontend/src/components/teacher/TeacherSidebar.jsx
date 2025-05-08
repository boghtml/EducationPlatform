import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../../css/teacher/TeacherSidebar.css';

import { 
  FaHome, 
  FaGraduationCap, 
  FaTasks, 
  FaFileAlt, 
  FaUsers, 
  FaComments, 
  FaChartLine, 
  FaCog,
  FaBook,
  FaQuestion,
  FaBullhorn,
  FaBell,
  FaCalendarAlt
} from 'react-icons/fa';

function TeacherSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      
      if (window.innerWidth < 992) {
        setIsCollapsed(true);
      }
    };

    window.addEventListener('resize', handleResize);
    
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path);
  };

  return (
    <div className={`teacher-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-toggle" onClick={toggleSidebar}>
        <span className="toggle-icon">{isCollapsed ? '→' : '←'}</span>
      </div>
      
      <div className="sidebar-content">
        <nav className="sidebar-menu">
          <Link 
            to="/teacher/dashboard" 
            className={`sidebar-item ${isActive('/teacher/dashboard') ? 'active' : ''}`}
          >
            <FaHome className="sidebar-icon" />
            {!isCollapsed && <span className="sidebar-label">Головна</span>}
          </Link>

          <Link 
            to="/teacher/courses" 
            className={`sidebar-item ${isActive('/teacher/courses') ? 'active' : ''}`}
          >
            <FaGraduationCap className="sidebar-icon" />
            {!isCollapsed && <span className="sidebar-label">Мої курси</span>}
          </Link>

          <Link 
            to="/teacher/assignments" 
            className={`sidebar-item ${isActive('/teacher/assignments') ? 'active' : ''}`}
          >
            <FaTasks className="sidebar-icon" />
            {!isCollapsed && <span className="sidebar-label">Завдання</span>}
          </Link>

          <Link 
            to="/teacher/materials" 
            className={`sidebar-item ${isActive('/teacher/materials') ? 'active' : ''}`}
          >
            <FaFileAlt className="sidebar-icon" />
            {!isCollapsed && <span className="sidebar-label">Матеріали</span>}
          </Link>

          <Link 
            to="/teacher/students" 
            className={`sidebar-item ${isActive('/teacher/students') ? 'active' : ''}`}
          >
            <FaUsers className="sidebar-icon" />
            {!isCollapsed && <span className="sidebar-label">Студенти</span>}
          </Link>

          <Link 
            to="/teacher/qa" 
            className={`sidebar-item ${isActive('/teacher/qa') ? 'active' : ''}`}
          >
            <FaQuestion className="sidebar-icon" />
            {!isCollapsed && <span className="sidebar-label">Питання і відповіді</span>}
          </Link>

          <Link 
            to="/teacher/analytics" 
            className={`sidebar-item ${isActive('/teacher/analytics') ? 'active' : ''}`}
          >
            <FaChartLine className="sidebar-icon" />
            {!isCollapsed && <span className="sidebar-label">Аналітика</span>}
          </Link>
          
          <div className="sidebar-divider"></div>
          
          <Link 
            to="/teacher/lessons" 
            className={`sidebar-item ${isActive('/teacher/lessons') ? 'active' : ''}`}
          >
            <FaBook className="sidebar-icon" />
            {!isCollapsed && <span className="sidebar-label">Уроки</span>}
          </Link>
          
          <Link 
            to="/teacher/announcements" 
            className={`sidebar-item ${isActive('/teacher/announcements') ? 'active' : ''}`}
          >
            <FaBullhorn className="sidebar-icon" />
            {!isCollapsed && <span className="sidebar-label">Оголошення</span>}
          </Link>
          
          <Link 
            to="/teacher/notifications" 
            className={`sidebar-item ${isActive('/teacher/notifications') ? 'active' : ''}`}
          >
            <FaBell className="sidebar-icon" />
            {!isCollapsed && <span className="sidebar-label">Сповіщення</span>}
          </Link>
          
          <Link 
            to="/teacher/schedule" 
            className={`sidebar-item ${isActive('/teacher/schedule') ? 'active' : ''}`}
          >
            <FaCalendarAlt className="sidebar-icon" />
            {!isCollapsed && <span className="sidebar-label">Розклад</span>}
          </Link>
          
          <Link 
            to="/teacher/discussions" 
            className={`sidebar-item ${isActive('/teacher/discussions') ? 'active' : ''}`}
          >
            <FaComments className="sidebar-icon" />
            {!isCollapsed && <span className="sidebar-label">Обговорення</span>}
          </Link>
          
          <div className="sidebar-divider"></div>
          
          <Link 
            to="/teacher/settings" 
            className={`sidebar-item ${isActive('/teacher/settings') ? 'active' : ''}`}
          >
            <FaCog className="sidebar-icon" />
            {!isCollapsed && <span className="sidebar-label">Налаштування</span>}
          </Link>
        </nav>
        
        {!isCollapsed && (
          <div className="sidebar-footer">
            <div className="app-version">
              <span>Версія 1.0.0</span>
            </div>
            <div className="support-link">
              <Link to="/teacher/help">
                Потрібна допомога?
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TeacherSidebar;