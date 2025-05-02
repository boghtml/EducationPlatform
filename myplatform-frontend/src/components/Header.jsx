import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import '../css/header.css';
import { 
  FaUser, 
  FaSignOutAlt, 
  FaCog, 
  FaBook, 
  FaGraduationCap, 
  FaList,
  FaBell,
  FaTasks,
  FaCreditCard,
  FaQuestionCircle
} from 'react-icons/fa';

const Header = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState({
    userName: '',
    userEmail: '',
    profileImageUrl: '',
    userRole: ''
  });
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const profileDropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const userName = sessionStorage.getItem('userName');
    const userEmail = sessionStorage.getItem('userEmail');
    const profileImageUrl = sessionStorage.getItem('profileImageUrl');
    const userRole = sessionStorage.getItem('userRole');
    
    if (userName) {
      setIsLoggedIn(true);
      setUser({
        userName: userName,
        userEmail: userEmail || '',
        profileImageUrl: profileImageUrl || 'https://via.placeholder.com/40',
        userRole: userRole || 'student'
      });
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    
    sessionStorage.removeItem('userName');
    sessionStorage.removeItem('userId');
    sessionStorage.removeItem('userEmail');
    sessionStorage.removeItem('profileImageUrl');
    sessionStorage.removeItem('userRole');
    
    setIsLoggedIn(false);
    setUser({
      userName: '',
      userEmail: '',
      profileImageUrl: '',
      userRole: ''
    });
    
    navigate('/');
  };

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') {
      return true;
    }
    if (path !== '/' && location.pathname.startsWith(path)) {
      return true;
    }
    return false;
  };

  return (
    <header className="main-header">
      <div className="container">
        <div className="header-content">
          <div className="logo-container">
            <Link to="/" className="logo">
              <span className="logo-text">MyPlatform</span>
            </Link>
          </div>
          
          <button 
            className="mobile-menu-toggle" 
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
          
          <nav className={`main-nav ${showMobileMenu ? 'show' : ''}`}>
            <ul className="nav-list">
              <li className={`nav-item ${isActive('/') ? 'active' : ''}`}>
                <Link to="/" className="nav-link">Курси</Link>
              </li>
              <li className={`nav-item ${isActive('/events') ? 'active' : ''}`}>
                <Link to="/events" className="nav-link">Заходи</Link>
              </li>
              <li className={`nav-item ${isActive('/blog') ? 'active' : ''}`}>
                <Link to="/blog" className="nav-link">Блог</Link>
              </li>
              <li className={`nav-item ${isActive('/reviews') ? 'active' : ''}`}>
                <Link to="/reviews" className="nav-link">Відгуки</Link>
              </li>
              <li className={`nav-item ${isActive('/about') ? 'active' : ''}`}>
                <Link to="/about" className="nav-link">Про нас</Link>
              </li>
              <li className={`nav-item ${isActive('/site-map') ? 'active' : ''}`}>
                <Link to="/site-map" className="nav-link">Картка</Link>
              </li>
            </ul>
          </nav>
          
          <div className="header-actions">
            {isLoggedIn ? (
              <div className="user-profile" ref={profileDropdownRef}>
                <div 
                  className="profile-toggle"
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                >
                  <img
                    src={user.profileImageUrl}
                    alt={user.userName}
                    className="profile-image"
                  />
                  <span className="profile-name">{user.userName}</span>
                </div>
                
                {showProfileDropdown && (
                  <div className="profile-dropdown">
                    <div className="dropdown-header">
                      <img
                        src={user.profileImageUrl}
                        alt={user.userName}
                        className="dropdown-profile-image"
                      />
                      <div className="dropdown-user-info">
                        <span className="dropdown-user-name">{user.userName}</span>
                        <span className="dropdown-user-email">{user.userEmail}</span>
                      </div>
                    </div>
                    
                    <ul className="dropdown-menu">
                      <li className="dropdown-item">
                        <Link to="/dashboard" className="dropdown-link">
                          <FaGraduationCap /> Мої курси
                        </Link>
                      </li>
                      
                      {user.userRole === 'student' && (
                        <>
                          <li className="dropdown-item">
                            <Link to="/assignments" className="dropdown-link">
                              <FaTasks /> Мої завдання
                            </Link>
                          </li>
                          <li className="dropdown-item">
                            <Link to="/progress" className="dropdown-link">
                              <FaList /> Мій прогрес
                            </Link>
                          </li>
                        </>
                      )}
                      
                      {user.userRole === 'teacher' && (
                        <>
                          <li className="dropdown-item">
                            <Link to="/my-teaching" className="dropdown-link">
                              <FaBook /> Моє викладання
                            </Link>
                          </li>
                          <li className="dropdown-item">
                            <Link to="/create-course" className="dropdown-link">
                              <FaGraduationCap /> Створити курс
                            </Link>
                          </li>
                        </>
                      )}
                      
                      <li className="dropdown-item">
                        <Link to="/notifications" className="dropdown-link">
                          <FaBell /> Сповіщення
                        </Link>
                      </li>
                      
                      <li className="dropdown-item">
                        <Link to="/profile" className="dropdown-link">
                          <FaUser /> Профіль
                        </Link>
                      </li>
                      
                      <li className="dropdown-item">
                        <Link to="/settings" className="dropdown-link">
                          <FaCog /> Налаштування
                        </Link>
                      </li>
                      
                      <li className="dropdown-item">
                        <Link to="/payments" className="dropdown-link">
                          <FaCreditCard /> Платежі
                        </Link>
                      </li>
                      
                      <li className="dropdown-item">
                        <Link to="/help" className="dropdown-link">
                          <FaQuestionCircle /> Підтримка
                        </Link>
                      </li>
                      
                      <li className="dropdown-divider"></li>
                      
                      <li className="dropdown-item">
                        <button className="dropdown-link logout-btn" onClick={handleLogout}>
                          <FaSignOutAlt /> Вийти
                        </button>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="auth-buttons">
                <Link to="/login" className="btn btn-login">Увійти</Link>
                <Link to="/register" className="btn btn-register">Зареєструватися</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;