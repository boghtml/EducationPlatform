import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../api';
import Header from './Header';
import Footer from './Footer';
import { 
  FaCog, 
  FaLock, 
  FaEye, 
  FaEyeSlash, 
  FaEnvelope, 
  FaMoon, 
  FaSun, 
  FaCheckCircle, 
  FaExclamationCircle,
  FaSpinner
} from 'react-icons/fa';
import '../css/settings.css';

function Settings() {
  // State for password change
  const [passwordForm, setPasswordForm] = useState({
    old_password: '',
    new_password: '',
    new_password_confirm: ''
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [showPassword, setShowPassword] = useState({
    old: false,
    new: false,
    confirm: false
  });

  // State for email reset
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [emailSuccess, setEmailSuccess] = useState('');
  const [isEmailLoading, setIsEmailLoading] = useState(false);

  // State for theme settings
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  
  // User data
  const [userId, setUserId] = useState('');
  const [userName, setUserName] = useState('');

  useEffect(() => {
    // Check if user is logged in
    const userIdFromSession = sessionStorage.getItem('userId');
    const userNameFromSession = sessionStorage.getItem('userName');
    const userEmail = sessionStorage.getItem('userEmail');
    
    if (!userIdFromSession) {
      window.location.href = '/login';
      return;
    }
    
    setUserId(userIdFromSession);
    setUserName(userNameFromSession || '');
    setEmail(userEmail || '');
    
    // Check theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkTheme(true);
    }
    
    // Get CSRF token
    getCSRFToken();
  }, []);

  const getCSRFToken = async () => {
    try {
      await axios.get(`${API_URL}/get-csrf-token/`, { withCredentials: true });
    } catch (error) {
      console.error('Error fetching CSRF token', error);
    }
  };

  // Password change handlers
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when typing
    if (passwordErrors[name]) {
      setPasswordErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const validatePasswordForm = () => {
    const errors = {};
    
    if (!passwordForm.old_password) {
      errors.old_password = 'Будь ласка, введіть поточний пароль';
    }
    
    if (!passwordForm.new_password) {
      errors.new_password = 'Будь ласка, введіть новий пароль';
    } else if (passwordForm.new_password.length < 8) {
      errors.new_password = 'Новий пароль повинен містити щонайменше 8 символів';
    }
    
    if (!passwordForm.new_password_confirm) {
      errors.new_password_confirm = 'Будь ласка, підтвердіть новий пароль';
    } else if (passwordForm.new_password !== passwordForm.new_password_confirm) {
      errors.new_password_confirm = 'Паролі не збігаються';
    }
    
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (!validatePasswordForm()) return;
    
    setIsPasswordLoading(true);
    setPasswordSuccess('');
    
    try {
      const response = await axios.post(`${API_URL}/users/change-password-id/${userId}/`, {
        old_password: passwordForm.old_password,
        new_password: passwordForm.new_password,
        new_password_confirm: passwordForm.new_password_confirm
      }, { withCredentials: true });
      
      setPasswordSuccess('Пароль успішно змінено!');
      setPasswordForm({
        old_password: '',
        new_password: '',
        new_password_confirm: ''
      });
    } catch (error) {
      console.error('Error changing password:', error);
      if (error.response && error.response.data && error.response.data.errors) {
        setPasswordErrors(error.response.data.errors);
      } else {
        setPasswordErrors({
          general: 'Помилка при зміні пароля. Спробуйте пізніше.'
        });
      }
    } finally {
      setIsPasswordLoading(false);
    }
  };

  // Email reset handlers
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setEmailError('');
  };

  const validateEmail = () => {
    if (!email) {
      setEmailError('Будь ласка, введіть вашу електронну адресу');
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError('Будь ласка, введіть коректну електронну адресу');
      return false;
    }
    
    return true;
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateEmail()) return;
    
    setIsEmailLoading(true);
    setEmailSuccess('');
    
    try {
      const response = await axios.post(`${API_URL}/users/reset-password-request/`, {
        email: email
      }, { withCredentials: true });
      
      setEmailSuccess('Інструкції для скидання пароля надіслано на вашу пошту!');
    } catch (error) {
      console.error('Error requesting password reset:', error);
      setEmailError('Не вдалося надіслати запит на скидання пароля. Перевірте вашу пошту та спробуйте ще раз.');
    } finally {
      setIsEmailLoading(false);
    }
  };

  // Theme switching
  const toggleTheme = () => {
    if (isDarkTheme) {
      document.body.classList.remove('dark-theme');
      localStorage.setItem('theme', 'light');
      setIsDarkTheme(false);
    } else {
      document.body.classList.add('dark-theme');
      localStorage.setItem('theme', 'dark');
      setIsDarkTheme(true);
    }
  };

  return (
    <div className="settings-page">
      <Header />
      
      <div className="settings-container container">
        <div className="settings-header">
          <h1>Налаштування</h1>
          <p>Керуйте налаштуваннями свого облікового запису</p>
        </div>
        
        <div className="settings-content">
          <div className="settings-sidebar">
            <div className="settings-menu">
              <h3>Меню налаштувань</h3>
              <ul>
                <li className="active">
                  <FaLock /> Безпека
                </li>
                <li>
                  <FaCog /> Загальні налаштування
                </li>
                <li>
                  <FaEnvelope /> Сповіщення
                </li>
              </ul>
            </div>
          </div>
          
          <div className="settings-main">
            {/* Theme Setting Section */}
            <div className="settings-section">
              <div className="settings-section-header">
                <h2>Тема</h2>
              </div>
              
              <div className="theme-settings">
                <div className="theme-option">
                  <div className="theme-switch">
                    <button 
                      className={`theme-button ${!isDarkTheme ? 'active' : ''}`}
                      onClick={toggleTheme}
                      aria-label="Light theme"
                    >
                      <FaSun /> Світла
                    </button>
                    <button 
                      className={`theme-button ${isDarkTheme ? 'active' : ''}`}
                      onClick={toggleTheme}
                      aria-label="Dark theme"
                    >
                      <FaMoon /> Темна
                    </button>
                  </div>
                  <p className="theme-description">
                    Оберіть тему оформлення, яка найбільше підходить для ваших очей
                  </p>
                </div>
              </div>
            </div>
            
            {/* Password Change Section */}
            <div className="settings-section">
              <div className="settings-section-header">
                <h2>Зміна пароля</h2>
                <p>Оновіть свій пароль для захисту облікового запису</p>
              </div>
              
              <form className="password-form" onSubmit={handlePasswordSubmit}>
                {passwordSuccess && (
                  <div className="success-message">
                    <FaCheckCircle />
                    <span>{passwordSuccess}</span>
                  </div>
                )}
                
                {passwordErrors.general && (
                  <div className="error-message">
                    <FaExclamationCircle />
                    <span>{passwordErrors.general}</span>
                  </div>
                )}
                
                <div className="form-group">
                  <label htmlFor="old_password">Поточний пароль</label>
                  <div className="password-input-container">
                    <input 
                      type={showPassword.old ? "text" : "password"}
                      id="old_password"
                      name="old_password"
                      value={passwordForm.old_password}
                      onChange={handlePasswordChange}
                      className={passwordErrors.old_password ? 'error' : ''}
                    />
                    <button 
                      type="button" 
                      className="password-toggle" 
                      onClick={() => togglePasswordVisibility('old')}
                    >
                      {showPassword.old ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {passwordErrors.old_password && (
                    <div className="error-text">{passwordErrors.old_password}</div>
                  )}
                </div>
                
                <div className="form-group">
                  <label htmlFor="new_password">Новий пароль</label>
                  <div className="password-input-container">
                    <input 
                      type={showPassword.new ? "text" : "password"}
                      id="new_password"
                      name="new_password"
                      value={passwordForm.new_password}
                      onChange={handlePasswordChange}
                      className={passwordErrors.new_password ? 'error' : ''}
                    />
                    <button 
                      type="button" 
                      className="password-toggle" 
                      onClick={() => togglePasswordVisibility('new')}
                    >
                      {showPassword.new ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {passwordErrors.new_password && (
                    <div className="error-text">{passwordErrors.new_password}</div>
                  )}
                </div>
                
                <div className="form-group">
                  <label htmlFor="new_password_confirm">Підтвердження нового пароля</label>
                  <div className="password-input-container">
                    <input 
                      type={showPassword.confirm ? "text" : "password"}
                      id="new_password_confirm"
                      name="new_password_confirm"
                      value={passwordForm.new_password_confirm}
                      onChange={handlePasswordChange}
                      className={passwordErrors.new_password_confirm ? 'error' : ''}
                    />
                    <button 
                      type="button" 
                      className="password-toggle" 
                      onClick={() => togglePasswordVisibility('confirm')}
                    >
                      {showPassword.confirm ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {passwordErrors.new_password_confirm && (
                    <div className="error-text">{passwordErrors.new_password_confirm}</div>
                  )}
                </div>
                
                <button 
                  type="submit" 
                  className="btn-change-password"
                  disabled={isPasswordLoading}
                >
                  {isPasswordLoading ? (
                    <>
                      <FaSpinner className="spinner" />
                      Змінюємо пароль...
                    </>
                  ) : (
                    'Змінити пароль'
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}

export default Settings;