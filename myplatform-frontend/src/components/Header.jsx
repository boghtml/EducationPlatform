// src/components/Header.jsx
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
  FaQuestionCircle,
  FaMoon,
  FaSun
} from 'react-icons/fa';

const Header = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState({
    userName: '',
    userEmail: '',
    profileImageUrl: '',
    userRole: '',
    userId: ''
  });
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  const profileDropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  /* === синхронізуємося з sessionStorage одразу та після події auth:login === */
  useEffect(() => {
    const syncAuth = () => {
      const userName = sessionStorage.getItem('userName');
      if (userName) {
        setIsLoggedIn(true);
        setUser({
          userName,
          userEmail: sessionStorage.getItem('userEmail') || '',
          profileImageUrl:
            sessionStorage.getItem('profileImageUrl') ||
            'https://via.placeholder.com/40',
          userRole: sessionStorage.getItem('userRole') || 'student',
          userId: sessionStorage.getItem('userId') || ''
        });
      } else {
        setIsLoggedIn(false);
        setUser({
          userName: '',
          userEmail: '',
          profileImageUrl: '',
          userRole: '',
          userId: ''
        });
      }
    };

    syncAuth();
    window.addEventListener('auth:login', syncAuth);
    window.addEventListener('storage', syncAuth); // на випадок змін у інших вкладках
    return () => {
      window.removeEventListener('auth:login', syncAuth);
      window.removeEventListener('storage', syncAuth);
    };
  }, []);

  /* === приховуємо дроп‑даун, якщо клікнули поза ним === */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(e.target)
      ) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  /* === тема (світла / темна) === */
  useEffect(() => {
    const theme = localStorage.getItem('theme');
    if (theme === 'dark') {
      setIsDarkTheme(true);
      document.body.classList.add('dark-theme');
    }
  }, []);

  const toggleTheme = () => {
    setIsDarkTheme((prev) => {
      const next = !prev;
      document.body.classList.toggle('dark-theme', next);
      localStorage.setItem('theme', next ? 'dark' : 'light');
      return next;
    });
  };

  const handleLogout = () => {
    sessionStorage.clear();
    setIsLoggedIn(false);
    navigate('/login');
  };

  const isActive = (path) =>
    path === '/'
      ? location.pathname === '/'
      : location.pathname.startsWith(path);

  console.log("isLoggedIn:", isLoggedIn);
  console.log("user:", user);
  console.log("showProfileDropdown:", showProfileDropdown);
  
  return (
    <header className="main-header">
      <div className="container">
        <div className="header-content">
          {/* логотип */}
          <div className="logo-container">
            <Link to="/" className="logo">
              <span className="logo-text">MyPlatform</span>
            </Link>
          </div>

          {/* mobile‑burger */}
          <button
            className="mobile-menu-toggle"
            onClick={() => setShowMobileMenu((p) => !p)}
            aria-label="Toggle menu"
          >
            <span />
            <span />
            <span />
          </button>

          {/* навігація */}
          <nav className={`main-nav ${showMobileMenu ? 'show' : ''}`}>
            <ul className="nav-list">
              <li className={`nav-item ${isActive('/') ? 'active' : ''}`}>
                <Link to="/" className="nav-link">
                  Курси
                </Link>
              </li>
              <li className={`nav-item ${isActive('/events') ? 'active' : ''}`}>
                <Link to="/events" className="nav-link">
                  Заходи
                </Link>
              </li>
              <li className={`nav-item ${isActive('/blog') ? 'active' : ''}`}>
                <Link to="/blog" className="nav-link">
                  Блог
                </Link>
              </li>
              <li
                className={`nav-item ${isActive('/reviews') ? 'active' : ''}`}
              >
                <Link to="/reviews" className="nav-link">
                  Відгуки
                </Link>
              </li>
              <li className={`nav-item ${isActive('/about') ? 'active' : ''}`}>
                <Link to="/about" className="nav-link">
                  Про нас
                </Link>
              </li>
            </ul>
          </nav>

          {/* праві дії */}
          <div className="header-actions">
            {isLoggedIn ? (
              <div className="user-profile" ref={profileDropdownRef}>
                <div
                  className="profile-toggle"
                  onClick={() =>
                    setShowProfileDropdown((prev) => !prev) /* toggle! */
                  }
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
                    <ul className="profile-menu">
                      <li className="dropdown-item">
                        <Link to={`/profile/${user.userId}`} className="dropdown-link">
                          <FaUser /> Профіль
                        </Link>
                      </li>
                      <li className="dropdown-item">
                        <Link to="/settings" className="dropdown-link">
                          <FaCog /> Налаштування
                        </Link>
                      </li>
                      <li className="dropdown-item">
                        <Link to="/subscription" className="dropdown-link">
                          <FaCreditCard /> Підписка
                        </Link>
                      </li>
                      <li className="dropdown-divider" />
                      <li className="dropdown-item">
                        <button className="dropdown-link logout-btn" onClick={handleLogout}>
                          <FaSignOutAlt /> Вийти
                        </button>
                      </li>
                    </ul>
                  </div>
                )}

              </div>
            ) : (
              <div className="auth-buttons">
                <Link to="/login" className="btn btn-login">
                  Увійти
                </Link>
                <Link to="/register" className="btn btn-register">
                  Зареєструватися
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
