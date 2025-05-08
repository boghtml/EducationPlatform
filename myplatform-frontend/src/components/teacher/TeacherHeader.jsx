import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../../css/teacher/TeacherHeader.css';

import {
  FaUser,
  FaSignOutAlt,
  FaCog,
  FaBell,
  FaEnvelope,
  FaQuestion,
  FaSearch
} from 'react-icons/fa';

function TeacherHeader() {
  const [user, setUser] = useState({
    userName: '',
    profileImageUrl: '',
    userId: ''
  });
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const profileDropdownRef = useRef(null);
  const notificationsRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userName = sessionStorage.getItem('userName');
    const profileImageUrl = sessionStorage.getItem('profileImageUrl');
    const userId = sessionStorage.getItem('userId');
    
    if (userName) {
      setUser({
        userName,
        profileImageUrl: profileImageUrl || 'https://via.placeholder.com/40',
        userId: userId || ''
      });
    }
    
    const testNotifications = [
      { id: 1, title: 'Новий студент', message: 'Марія Іванова записалась на ваш курс', time: '1 годину тому', read: false },
      { id: 2, title: 'Нове запитання', message: 'У вас є нове запитання у курсі "JavaScript для початківців"', time: '3 години тому', read: false },
      { id: 3, title: 'Дедлайн завдання', message: 'Завтра дедлайн завдання "Фінальний проект"', time: '5 годин тому', read: true },
      { id: 4, title: 'Адміністрація', message: 'Ваш курс був схвалений адміністрацією', time: '1 день тому', read: true }
    ];
    
    setNotifications(testNotifications);
    setUnreadNotifications(testNotifications.filter(notification => !notification.read).length);
    
    const handleOutsideClick = (e) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target)) {
        setShowProfileDropdown(false);
      }
      
      if (notificationsRef.current && !notificationsRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    
    document.addEventListener('mousedown', handleOutsideClick);
    
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  const handleLogout = () => {
    sessionStorage.clear();
    navigate('/login');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/teacher/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notification => ({ ...notification, read: true })));
    setUnreadNotifications(0);
  };

  const markAsRead = (id) => {
    const updatedNotifications = notifications.map(notification =>
      notification.id === id ? { ...notification, read: true } : notification
    );
    
    setNotifications(updatedNotifications);
    setUnreadNotifications(updatedNotifications.filter(notification => !notification.read).length);
  };

  return (
    <header className="teacher-header">
      <div className="teacher-header-container">
        <div className="teacher-header-left">
          <Link to="/teacher/dashboard" className="teacher-logo">
            <span className="teacher-logo-text">MyPlatform</span>
            <span className="teacher-logo-badge">Викладач</span>
          </Link>
          
          <form className="teacher-search-form" onSubmit={handleSearch}>
            <div className="teacher-search-container">
              <FaSearch className="teacher-search-icon" />
              <input
                type="text"
                placeholder="Пошук по курсах, завданнях..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="teacher-search-input"
              />
            </div>
            <button type="submit" className="teacher-search-btn">Пошук</button>
          </form>
        </div>
        
        <div className="teacher-header-right">
          <div className="teacher-header-notifications" ref={notificationsRef}>
            <button 
              className="teacher-notifications-btn"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <FaBell />
              {unreadNotifications > 0 && (
                <span className="teacher-notifications-badge">{unreadNotifications}</span>
              )}
            </button>
            
            {showNotifications && (
              <div className="teacher-notifications-dropdown">
                <div className="teacher-notifications-header">
                  <h3>Сповіщення</h3>
                  {unreadNotifications > 0 && (
                    <button 
                      className="teacher-mark-read-btn"
                      onClick={markAllAsRead}
                    >
                      Позначити всі як прочитані
                    </button>
                  )}
                </div>
                
                <div className="teacher-notifications-list">
                  {notifications.length > 0 ? (
                    notifications.map(notification => (
                      <div 
                        key={notification.id} 
                        className={`teacher-notification-item ${!notification.read ? 'unread' : ''}`}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div className="teacher-notification-icon">
                          <FaBell />
                        </div>
                        <div className="teacher-notification-content">
                          <h4>{notification.title}</h4>
                          <p>{notification.message}</p>
                          <span className="teacher-notification-time">{notification.time}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="teacher-no-notifications">
                      <p>Немає нових сповіщень</p>
                    </div>
                  )}
                </div>
                
                <div className="teacher-notifications-footer">
                  <Link to="/teacher/notifications">Переглянути всі сповіщення</Link>
                </div>
              </div>
            )}
          </div>
          
          <div className="teacher-header-messages">
            <Link to="/teacher/messages" className="teacher-messages-btn">
              <FaEnvelope />
            </Link>
          </div>
          
          <div className="teacher-header-help">
            <Link to="/teacher/help" className="teacher-help-btn">
              <FaQuestion />
            </Link>
          </div>
          
          <div className="teacher-header-profile" ref={profileDropdownRef}>
            <button 
              className="teacher-profile-btn"
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            >
              <img
                src={user.profileImageUrl}
                alt={user.userName}
                className="teacher-profile-image"
              />
              <span className="teacher-profile-name">{user.userName}</span>
            </button>
            
            {showProfileDropdown && (
              <div className="teacher-profile-dropdown">
                <div className="teacher-profile-header">
                  <img
                    src={user.profileImageUrl}
                    alt={user.userName}
                    className="teacher-profile-dropdown-image"
                  />
                  <div className="teacher-profile-details">
                    <h4>{user.userName}</h4>
                    <p>Викладач</p>
                  </div>
                </div>
                
                <ul className="teacher-profile-menu">
                  <li>
                    <Link to={`/profile/${user.userId}`} className="teacher-profile-link">
                      <FaUser />
                      <span>Мій профіль</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/teacher/settings" className="teacher-profile-link">
                      <FaCog />
                      <span>Налаштування</span>
                    </Link>
                  </li>
                  <li>
                    <button onClick={handleLogout} className="teacher-profile-link teacher-logout-btn">
                      <FaSignOutAlt />
                      <span>Вийти</span>
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default TeacherHeader;