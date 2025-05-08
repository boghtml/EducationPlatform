import React, { useState, useEffect, useRef } from 'react';
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
  FaSpinner,
  FaUser,
  FaBell,
  FaUpload,
  FaPhone,
  FaPencilAlt,
  FaLanguage,
  FaGlobe,
  FaDesktop,
  FaToggleOn,
  FaToggleOff,
  FaBook,
  FaCalendarAlt
} from 'react-icons/fa';
import '../css/settings.css';

function Settings() {
  // State for profile data
  const [profileData, setProfileData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    phone_number: '',
    profile_image_url: ''
  });
  const [profileErrors, setProfileErrors] = useState({});
  const [profileSuccess, setProfileSuccess] = useState('');
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const fileInputRef = useRef(null);
  const [profileImagePreview, setProfileImagePreview] = useState('');
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

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
  const [resetEmailForm, setResetEmailForm] = useState({
    email: ''
  });
  const [resetEmailErrors, setResetEmailErrors] = useState({});
  const [resetEmailSuccess, setResetEmailSuccess] = useState('');
  const [isResetEmailLoading, setIsResetEmailLoading] = useState(false);

  // State for reset password confirmation
  const [resetPasswordForm, setResetPasswordForm] = useState({
    uid: '',
    token: '',
    new_password: '',
    new_password_confirm: ''
  });
  const [resetPasswordErrors, setResetPasswordErrors] = useState({});
  const [resetPasswordSuccess, setResetPasswordSuccess] = useState('');
  const [isResetPasswordLoading, setIsResetPasswordLoading] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState({
    new: false,
    confirm: false
  });

  // State for general settings
  const [generalSettings, setGeneralSettings] = useState({
    language: 'uk',
    timezone: 'Europe/Kiev',
    dateFormat: 'DD.MM.YYYY'
  });
  const [interfaceSettings, setInterfaceSettings] = useState({
    autoplay_videos: true,
    show_progress: true,
    sound_effects: false
  });
  const [textSize, setTextSize] = useState(100);
  const [accessibilitySettings, setAccessibilitySettings] = useState({
    high_contrast: false,
    reduce_animations: false
  });

  // State for notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    courseUpdates: true,
    assignmentReminders: true,
    platformAnnouncements: true,
    marketingEmails: false
  });
  const [notificationSchedule, setNotificationSchedule] = useState({
    time: 'morning',
    days: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт']
  });

  // State for theme settings
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  
  // State for active tab
  const [activeTab, setActiveTab] = useState('security');
  
  // User data
  const [userId, setUserId] = useState('');
  const [userName, setUserName] = useState('');

  // Effect for initialization
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
    setProfileData(prev => ({
      ...prev,
      email: userEmail || ''
    }));
    setResetEmailForm(prev => ({
      ...prev,
      email: userEmail || ''
    }));
    
    // Check theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.body.classList.add('dark-theme');
      setIsDarkTheme(true);
    }
    
    // Get CSRF token
    getCSRFToken();
    
    // Fetch user profile data
    fetchUserProfile(userIdFromSession);
  }, []);

  // API Utility Functions
  const getCSRFToken = async () => {
    try {
      const response = await axios.get(`${API_URL}/get-csrf-token/`, { withCredentials: true });
      if (response.data && response.data.csrftoken) {
        axios.defaults.headers.common['X-CSRFToken'] = response.data.csrftoken;
      }
    } catch (error) {
      console.error('Помилка отримання CSRF токена:', error);
    }
  };

  const fetchUserProfile = async (userId) => {
    try {
      setIsProfileLoading(true);
      const response = await axios.get(`${API_URL}/users/student/${userId}/`, {
        withCredentials: true
      });
      
      if (response.data && response.data.data) {
        const userData = response.data.data;
        setProfileData({
          username: userData.username || '',
          email: userData.email || '',
          first_name: userData.first_name || '',
          last_name: userData.last_name || '',
          phone_number: userData.phone_number || '',
          profile_image_url: userData.profile_image_url || ''
        });
        
        setProfileImagePreview(userData.profile_image_url || '');
      }
    } catch (error) {
      console.error('Помилка отримання профілю користувача:', error);
      setProfileErrors({ general: 'Не вдалося завантажити дані профілю.' });
    } finally {
      setIsProfileLoading(false);
    }
  };

  // Profile Handlers
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (profileErrors[name]) {
      setProfileErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateProfileData = () => {
    const errors = {};
    
    if (!profileData.username) {
      errors.username = "Ім'я користувача обов'язкове";
    }
    
    if (!profileData.email) {
      errors.email = "Email обов'язковий";
    } else if (!/\S+@\S+\.\S+/.test(profileData.email)) {
      errors.email = 'Некоректний формат email';
    }

    if (profileData.phone_number && !/^\+?[\d\s-]{10,}$/.test(profileData.phone_number)) {
      errors.phone_number = 'Некоректний формат номера телефону';
    }
    
    setProfileErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateProfileData()) return;
    
    setIsProfileLoading(true);
    setProfileSuccess('');
    
    try {
      const response = await axios.post(`${API_URL}/users/update-profile/${userId}/`, 
        profileData,
        { 
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      setProfileSuccess('Профіль успішно оновлено!');
      
      sessionStorage.setItem('userName', response.data.username || profileData.username);
      sessionStorage.setItem('userEmail', response.data.email || profileData.email);
      
      window.dispatchEvent(new Event('auth:login'));
      
    } catch (error) {
      console.error('Помилка оновлення профілю:', error);
      if (error.response && error.response.data && error.response.data.errors) {
        setProfileErrors(error.response.data.errors);
      } else {
        setProfileErrors({
          general: 'Помилка при оновленні профілю. Спробуйте пізніше.'
        });
      }
    } finally {
      setIsProfileLoading(false);
    }
  };

  const handleProfileImageClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      setProfileErrors(prev => ({
        ...prev,
        profileImage: 'Файл занадто великий. Максимальний розмір: 5MB'
      }));
      return;
    }
    
    if (!['image/jpeg', 'image/jpg', 'image/png', 'image/gif'].includes(file.type)) {
      setProfileErrors(prev => ({
        ...prev,
        profileImage: 'Підтримуються лише формати: JPEG, PNG, GIF'
      }));
      return;
    }
    
    setProfileImageFile(file);
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
    
    if (profileErrors.profileImage) {
      setProfileErrors(prev => {
        const newErrors = {...prev};
        delete newErrors.profileImage;
        return newErrors;
      });
    }
  };

  const handleUploadImage = async () => {
    if (!profileImageFile) return;
    
    setIsUploadingImage(true);
    
    try {
      const formData = new FormData();
      formData.append('profile_image', profileImageFile);
      
      const response = await axios.post(
        `${API_URL}/users/upload-profile-image/${userId}/`,
        formData,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      setProfileData(prev => ({
        ...prev,
        profile_image_url: response.data.profile_image_url
      }));
      
      setProfileSuccess('Фото профілю успішно оновлено!');
      
      sessionStorage.setItem('profileImageUrl', response.data.profile_image_url);
      
      window.dispatchEvent(new Event('auth:login'));
      
    } catch (error) {
      console.error('Помилка завантаження зображення профілю:', error);
      setProfileErrors(prev => ({
        ...prev,
        profileImage: error.response?.data?.error || 'Помилка при завантаженні зображення'
      }));
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Password Handlers
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
    
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
      errors.old_password = "Будь ласка, введіть поточний пароль";
    }
    
    if (!passwordForm.new_password) {
      errors.new_password = "Будь ласка, введіть новий пароль";
    } else if (passwordForm.new_password.length < 8) {
      errors.new_password = 'Новий пароль повинен містити щонайменше 8 символів';
    }
    
    if (!passwordForm.new_password_confirm) {
      errors.new_password_confirm = "Будь ласка, підтвердіть новий пароль";
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
      const response = await axios.post(`${API_URL}/users/change-password-id/${userId}/`, 
        passwordForm,
        { withCredentials: true }
      );
      
      setPasswordSuccess('Пароль успішно змінено!');
      setPasswordForm({
        old_password: '',
        new_password: '',
        new_password_confirm: ''
      });
    } catch (error) {
      console.error('Помилка зміни пароля:', error);
      if (error.response && error.response.data && error.response.data.errors) {
        setPasswordErrors(typeof error.response.data.errors === 'string' 
          ? { general: error.response.data.errors } 
          : error.response.data.errors);
      } else {
        setPasswordErrors({
          general: 'Помилка при зміні пароля. Спробуйте пізніше.'
        });
      }
    } finally {
      setIsPasswordLoading(false);
    }
  };

  // Email Reset Handlers
  const handleResetEmailChange = (e) => {
    const { name, value } = e.target;
    setResetEmailForm(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (resetEmailErrors[name]) {
      setResetEmailErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateResetEmailForm = () => {
    const errors = {};
    
    if (!resetEmailForm.email) {
      errors.email = "Будь ласка, введіть вашу пошту";
    } else if (!/\S+@\S+\.\S+/.test(resetEmailForm.email)) {
      errors.email = 'Некоректний формат email';
    }
    
    setResetEmailErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleResetEmailSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateResetEmailForm()) return;
    
    setIsResetEmailLoading(true);
    setResetEmailSuccess('');
    
    try {
      const response = await axios.post(`${API_URL}/users/reset-password-request/`, 
        resetEmailForm,
        { withCredentials: true }
      );
      
      setResetEmailSuccess('Інструкції для скидання пароля надіслано на вашу пошту!');
    } catch (error) {
      console.error('Помилка запиту на скидання пароля:', error);
      setResetEmailErrors({
        email: 'Не вдалося надіслати запит на скидання пароля. Перевірте вашу пошту та спробуйте ще раз.'
      });
    } finally {
      setIsResetEmailLoading(false);
    }
  };

  // Reset Password Confirmation Handlers
  const handleResetPasswordChange = (e) => {
    const { name, value } = e.target;
    setResetPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (resetPasswordErrors[name]) {
      setResetPasswordErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const toggleResetPasswordVisibility = (field) => {
    setShowResetPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const validateResetPasswordForm = () => {
    const errors = {};
    
    if (!resetPasswordForm.uid) {
      errors.uid = "ID користувача обов'язковий";
    }
    
    if (!resetPasswordForm.token) {
      errors.token = "Токен обов'язковий";
    }
    
    if (!resetPasswordForm.new_password) {
      errors.new_password = "Будь ласка, введіть новий пароль";
    } else if (resetPasswordForm.new_password.length < 8) {
      errors.new_password = 'Новий пароль повинен містити щонайменше 8 символів';
    }
    
    if (!resetPasswordForm.new_password_confirm) {
      errors.new_password_confirm = "Будь ласка, підтвердіть новий пароль";
    } else if (resetPasswordForm.new_password !== resetPasswordForm.new_password_confirm) {
      errors.new_password_confirm = 'Паролі не збігаються';
    }
    
    setResetPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateResetPasswordForm()) return;
    
    setIsResetPasswordLoading(true);
    setResetPasswordSuccess('');
    
    try {
      const response = await axios.post(`${API_URL}/users/reset-password-confirm/`, 
        resetPasswordForm,
        { withCredentials: true }
      );
      
      setResetPasswordSuccess('Пароль успішно змінено! Тепер ви можете увійти з новим паролем.');
      setResetPasswordForm({
        uid: '',
        token: '',
        new_password: '',
        new_password_confirm: ''
      });
    } catch (error) {
      console.error('Помилка підтвердження скидання пароля:', error);
      if (error.response && error.response.data && error.response.data.errors) {
        setResetPasswordErrors(typeof error.response.data.errors === 'string' 
          ? { general: error.response.data.errors } 
          : error.response.data.errors);
      } else {
        setResetPasswordErrors({
          general: 'Помилка при скиданні пароля. Перевірте правильність ID та токену.'
        });
      }
    } finally {
      setIsResetPasswordLoading(false);
    }
  };

  // General Settings Handlers
  const handleGeneralSettingsChange = (e) => {
    const { name, value } = e.target;
    setGeneralSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleInterfaceToggle = (setting) => {
    setInterfaceSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const handleTextSizeChange = (e) => {
    const size = parseInt(e.target.value, 10);
    setTextSize(size);
    document.documentElement.style.setProperty('--font-size-multiplier', size / 100);
  };

  const handleAccessibilityToggle = (setting) => {
    setAccessibilitySettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const handleGeneralSettingsSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/users/settings/general/`, 
        { ...generalSettings, ...interfaceSettings, textSize, ...accessibilitySettings },
        { withCredentials: true }
      );
      setProfileSuccess('Загальні налаштування збережено!');
    } catch (error) {
      console.error('Помилка збереження загальних налаштувань:', error);
      setProfileErrors({
        general: 'Не вдалося зберегти налаштування. Спробуйте пізніше.'
      });
    }
  };

  // Notification Settings Handlers
  const handleNotificationToggle = (setting) => {
    setNotificationSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const handleNotificationScheduleChange = (e) => {
    const { name, value } = e.target;
    setNotificationSchedule(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDayToggle = (day) => {
    setNotificationSchedule(prev => {
      const days = prev.days.includes(day)
        ? prev.days.filter(d => d !== day)
        : [...prev.days, day];
      return { ...prev, days };
    });
  };

  const handleNotificationSettingsSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/users/settings/notifications/`, 
        notificationSettings,
        { withCredentials: true }
      );
      setProfileSuccess('Налаштування сповіщень збережено!');
    } catch (error) {
      console.error('Помилка збереження налаштувань сповіщень:', error);
      setProfileErrors({
        general: 'Не вдалося зберегти налаштування сповіщень. Спробуйте пізніше.'
      });
    }
  };

  const saveNotificationSchedule = async () => {
    try {
      await axios.post(`${API_URL}/users/settings/notification-schedule/`, 
        notificationSchedule,
        { withCredentials: true }
      );
      setProfileSuccess('Розклад сповіщень збережено!');
    } catch (error) {
      console.error('Помилка збереження розкладу сповіщень:', error);
      setProfileErrors({
        general: 'Не вдалося зберегти розклад сповіщень. Спробуйте пізніше.'
      });
    }
  };

  // Theme Handlers
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

  // Render
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
                <li 
                  className={activeTab === 'profile' ? 'active' : ''}
                  onClick={() => setActiveTab('profile')}
                >
                  <FaUser /> Профіль
                </li>
                <li 
                  className={activeTab === 'security' ? 'active' : ''}
                  onClick={() => setActiveTab('security')}
                >
                  <FaLock /> Безпека
                </li>
                <li 
                  className={activeTab === 'general' ? 'active' : ''}
                  onClick={() => setActiveTab('general')}
                >
                  <FaCog /> Загальні налаштування
                </li>
                <li 
                  className={activeTab === 'notifications' ? 'active' : ''}
                  onClick={() => setActiveTab('notifications')}
                >
                  <FaBell /> Сповіщення
                </li>
              </ul>
            </div>
          </div>
          
          <div className="settings-main">
            {/* Profile Section */}
            {activeTab === 'profile' && (
              <div className="settings-section">
                <div className="settings-section-header">
                  <h2>Інформація профілю</h2>
                  <p>Редагуйте свої персональні дані</p>
                </div>
                
                <div className="profile-edit-container">
                  <div className="profile-image-container">
                    <div className="profile-image-wrapper">
                      <img 
                        src={profileImagePreview || 'https://via.placeholder.com/150'}
                        alt={`${profileData.first_name} ${profileData.last_name}`}
                        className="profile-image-preview"
                      />
                      <div className="profile-image-overlay" onClick={handleProfileImageClick}>
                        <FaUpload />
                        <span>Змінити фото</span>
                      </div>
                    </div>
                    
                    <input 
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      style={{ display: 'none' }}
                      accept="image/jpeg,image/png,image/gif"
                    />
                    
                    {profileImageFile && (
                      <button 
                        className="btn-upload-image"
                        onClick={handleUploadImage}
                        disabled={isUploadingImage}
                      >
                        {isUploadingImage ? (
                          <>
                            <FaSpinner className="spinner" />
                            Завантаження...
                          </>
                        ) : (
                          <>
                            <FaUpload /> Завантажити нове фото
                          </>
                        )}
                      </button>
                    )}
                    
                    {profileErrors.profileImage && (
                      <div className="error-text profile-image-error">
                        {profileErrors.profileImage}
                      </div>
                    )}
                  </div>
                  
                  <form className="profile-form" onSubmit={handleProfileSubmit}>
                    {profileSuccess && (
                      <div className="success-message">
                        <FaCheckCircle />
                        <span>{profileSuccess}</span>
                      </div>
                    )}
                    
                    {profileErrors.general && (
                      <div className="error-message">
                        <FaExclamationCircle />
                        <span>{profileErrors.general}</span>
                      </div>
                    )}
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="username">Ім'я користувача</label>
                        <input 
                          type="text"
                          id="username"
                          name="username"
                          value={profileData.username}
                          onChange={handleProfileChange}
                          className={profileErrors.username ? 'error' : ''}
                        />
                        {profileErrors.username && (
                          <div className="error-text">{profileErrors.username}</div>
                        )}
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input 
                          type="email"
                          id="email"
                          name="email"
                          value={profileData.email}
                          onChange={handleProfileChange}
                          className={profileErrors.email ? 'error' : ''}
                        />
                        {profileErrors.email && (
                          <div className="error-text">{profileErrors.email}</div>
                        )}
                      </div>
                    </div>
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="first_name">Ім'я</label>
                        <input 
                          type="text"
                          id="first_name"
                          name="first_name"
                          value={profileData.first_name}
                          onChange={handleProfileChange}
                          className={profileErrors.first_name ? 'error' : ''}
                        />
                        {profileErrors.first_name && (
                          <div className="error-text">{profileErrors.first_name}</div>
                        )}
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="last_name">Прізвище</label>
                        <input 
                          type="text"
                          id="last_name"
                          name="last_name"
                          value={profileData.last_name}
                          onChange={handleProfileChange}
                          className={profileErrors.last_name ? 'error' : ''}
                        />
                        {profileErrors.last_name && (
                          <div className="error-text">{profileErrors.last_name}</div>
                        )}
                      </div>
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="phone_number">Номер телефону</label>
                      <input 
                        type="tel"
                        id="phone_number"
                        name="phone_number"
                        value={profileData.phone_number}
                        onChange={handleProfileChange}
                        className={profileErrors.phone_number ? 'error' : ''}
                      />
                      {profileErrors.phone_number && (
                        <div className="error-text">{profileErrors.phone_number}</div>
                      )}
                    </div>
                    
                    <button 
                      type="submit"
                      className="btn-update-profile"
                      disabled={isProfileLoading}
                    >
                      {isProfileLoading ? (
                        <>
                          <FaSpinner className="spinner" />
                          Оновлення...
                        </>
                      ) : (
                        <>
                          <FaPencilAlt /> Оновити профіль
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            )}
            
            {/* Security Section */}
            {activeTab === 'security' && (
              <>
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
                          aria-label="Світла тема"
                        >
                          <FaSun /> Світла
                        </button>
                        <button 
                          className={`theme-button ${isDarkTheme ? 'active' : ''}`}
                          onClick={toggleTheme}
                          aria-label="Темна тема"
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
                          placeholder="Введіть поточний пароль"
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
                          placeholder="Введіть новий пароль"
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
                          placeholder="Підтвердіть новий пароль"
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
                
                {/* Email Password Reset Request Section */}
                <div className="settings-section">
                  <div className="settings-section-header">
                    <h2>Скидання пароля через email</h2>
                    <p>Надішліть на вашу електронну пошту посилання для скидання пароля</p>
                  </div>
                  
                  <form className="email-form" onSubmit={handleResetEmailSubmit}>
                    {resetEmailSuccess && (
                      <div className="success-message">
                        <FaCheckCircle />
                        <span>{resetEmailSuccess}</span>
                      </div>
                    )}
                    
                    <div className="form-group">
                      <label htmlFor="reset_email">Email</label>
                      <div className="email-input-container">
                        <FaEnvelope className="email-icon" />
                        <input 
                          type="email"
                          id="reset_email"
                          name="email"
                          value={resetEmailForm.email}
                          onChange={handleResetEmailChange}
                          className={resetEmailErrors.email ? 'error' : ''}
                          placeholder="Введіть email для скидання пароля"
                        />
                      </div>
                      {resetEmailErrors.email && (
                        <div className="error-text">{resetEmailErrors.email}</div>
                      )}
                    </div>
                    
                    <button 
                      type="submit" 
                      className="btn-reset-password"
                      disabled={isResetEmailLoading}
                    >
                      {isResetEmailLoading ? (
                        <>
                          <FaSpinner className="spinner" />
                          Надсилаємо запит...
                        </>
                      ) : (
                        'Надіслати посилання для скидання'
                      )}
                    </button>
                  </form>
                </div>
                
                {/* Password Reset Confirmation Section */}
                <div className="settings-section">
                  <div className="settings-section-header">
                    <h2>Підтвердження скидання пароля</h2>
                    <p>Якщо у вас є токен скидання пароля, ви можете використати його тут</p>
                  </div>
                  
                  <form className="reset-password-form" onSubmit={handleResetPasswordSubmit}>
                    {resetPasswordSuccess && (
                      <div className="success-message">
                        <FaCheckCircle />
                        <span>{resetPasswordSuccess}</span>
                      </div>
                    )}
                    
                    {resetPasswordErrors.general && (
                      <div className="error-message">
                        <FaExclamationCircle />
                        <span>{resetPasswordErrors.general}</span>
                      </div>
                    )}
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="uid">ID користувача</label>
                        <input 
                          type="text"
                          id="uid"
                          name="uid"
                          value={resetPasswordForm.uid}
                          onChange={handleResetPasswordChange}
                          className={resetPasswordErrors.uid ? 'error' : ''}
                          placeholder="Введіть ID користувача"
                        />
                        {resetPasswordErrors.uid && (
                          <div className="error-text">{resetPasswordErrors.uid}</div>
                        )}
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="token">Токен</label>
                        <input 
                          type="text"
                          id="token"
                          name="token"
                          value={resetPasswordForm.token}
                          onChange={handleResetPasswordChange}
                          className={resetPasswordErrors.token ? 'error' : ''}
                          placeholder="Введіть токен скидання"
                        />
                        {resetPasswordErrors.token && (
                          <div className="error-text">{resetPasswordErrors.token}</div>
                        )}
                      </div>
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="reset_new_password">Новий пароль</label>
                      <div className="password-input-container">
                        <input 
                          type={showResetPassword.new ? "text" : "password"}
                          id="reset_new_password"
                          name="new_password"
                          value={resetPasswordForm.new_password}
                          onChange={handleResetPasswordChange}
                          className={resetPasswordErrors.new_password ? 'error' : ''}
                          placeholder="Введіть новий пароль"
                        />
                        <button 
                          type="button" 
                          className="password-toggle" 
                          onClick={() => toggleResetPasswordVisibility('new')}
                        >
                          {showResetPassword.new ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                      {resetPasswordErrors.new_password && (
                        <div className="error-text">{resetPasswordErrors.new_password}</div>
                      )}
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="reset_new_password_confirm">Підтвердження нового пароля</label>
                      <div className="password-input-container">
                        <input 
                          type={showResetPassword.confirm ? "text" : "password"}
                          id="reset_new_password_confirm"
                          name="new_password_confirm"
                          value={resetPasswordForm.new_password_confirm}
                          onChange={handleResetPasswordChange}
                          className={resetPasswordErrors.new_password_confirm ? 'error' : ''}
                          placeholder="Підтвердіть новий пароль"
                        />
                        <button 
                          type="button" 
                          className="password-toggle" 
                          onClick={() => toggleResetPasswordVisibility('confirm')}
                        >
                          {showResetPassword.confirm ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                      {resetPasswordErrors.new_password_confirm && (
                        <div className="error-text">{resetPasswordErrors.new_password_confirm}</div>
                      )}
                    </div>
                    
                    <button 
                      type="submit" 
                      className="btn-reset-password"
                      disabled={isResetPasswordLoading}
                    >
                      {isResetPasswordLoading ? (
                        <>
                          <FaSpinner className="spinner" />
                          Скидаємо пароль...
                        </>
                      ) : (
                        'Скинути пароль'
                      )}
                    </button>
                  </form>
                </div>
              </>
            )}
            
            {/* General Settings Section */}
            {activeTab === 'general' && (
              <>
                <div className="settings-section">
                  <div className="settings-section-header">
                    <h2>Загальні налаштування</h2>
                    <p>Налаштуйте уподобання інтерфейсу та локалізації</p>
                  </div>
                  
                  <form className="general-settings-form" onSubmit={handleGeneralSettingsSubmit}>
                    <div className="form-group">
                      <label htmlFor="language">
                        <FaLanguage /> Мова інтерфейсу
                      </label>
                      <select 
                        id="language"
                        name="language"
                        value={generalSettings.language}
                        onChange={handleGeneralSettingsChange}
                      >
                        <option value="uk">Українська</option>
                        <option value="en">English</option>
                        <option value="pl">Polski</option>
                        <option value="de">Deutsch</option>
                      </select>
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="timezone">
                        <FaGlobe /> Часовий пояс
                      </label>
                      <select 
                        id="timezone"
                        name="timezone"
                        value={generalSettings.timezone}
                        onChange={handleGeneralSettingsChange}
                      >
                        <option value="Europe/Kiev">Київ (UTC+2)</option>
                        <option value="Europe/London">Лондон (UTC+0)</option>
                        <option value="Europe/Berlin">Берлін (UTC+1)</option>
                        <option value="America/New_York">Нью-Йорк (UTC-5)</option>
                      </select>
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="dateFormat">
                        <FaCalendarAlt /> Формат дати
                      </label>
                      <select 
                        id="dateFormat"
                        name="dateFormat"
                        value={generalSettings.dateFormat}
                        onChange={handleGeneralSettingsChange}
                      >
                        <option value="DD.MM.YYYY">DD.MM.YYYY (31.12.2024)</option>
                        <option value="MM/DD/YYYY">MM/DD/YYYY (12/31/2024)</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD (2024-12-31)</option>
                      </select>
                    </div>
                    
                    <div className="settings-checkbox-group">
                      <div className="checkbox-container">
                        <input 
                          type="checkbox"
                          id="autoplay_videos"
                          checked={interfaceSettings.autoplay_videos}
                          onChange={() => handleInterfaceToggle('autoplay_videos')}
                        />
                        <label htmlFor="autoplay_videos">Автоматичне відтворення відео</label>
                      </div>
                      
                      <div className="checkbox-container">
                        <input 
                          type="checkbox"
                          id="show_progress"
                          checked={interfaceSettings.show_progress}
                          onChange={() => handleInterfaceToggle('show_progress')}
                        />
                        <label htmlFor="show_progress">Показувати прогрес курсу на дашборді</label>
                      </div>
                      
                      <div className="checkbox-container">
                        <input 
                          type="checkbox"
                          id="sound_effects"
                          checked={interfaceSettings.sound_effects}
                          onChange={() => handleInterfaceToggle('sound_effects')}
                        />
                        <label htmlFor="sound_effects">Звукові ефекти</label>
                      </div>
                    </div>
                    
                    <button type="submit" className="btn-save-settings">
                      Зберегти налаштування
                    </button>
                  </form>
                </div>
                
                <div className="settings-section">
                  <div className="settings-section-header">
                    <h2>Налаштування доступності</h2>
                    <p>Налаштуйте параметри для зручнішого використання платформи</p>
                  </div>
                  
                  <div className="accessibility-settings">
                    <div className="settings-slider-group">
                      <label>Розмір тексту</label>
                      <div className="slider-container">
                        <span>A</span>
                        <input 
                          type="range" 
                          min="80" 
                          max="120" 
                          value={textSize} 
                          onChange={handleTextSizeChange}
                        />
                        <span>A</span>
                      </div>
                    </div>
                    
                    <div className="settings-checkbox-group">
                      <div className="checkbox-container">
                        <input 
                          type="checkbox"
                          id="high_contrast"
                          checked={accessibilitySettings.high_contrast}
                          onChange={() => handleAccessibilityToggle('high_contrast')}
                        />
                        <label htmlFor="high_contrast">Високий контраст</label>
                      </div>
                      
                      <div className="checkbox-container">
                        <input 
                          type="checkbox"
                          id="reduce_animations"
                          checked={accessibilitySettings.reduce_animations}
                          onChange={() => handleAccessibilityToggle('reduce_animations')}
                        />
                        <label htmlFor="reduce_animations">Зменшити анімації</label>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
            
            {/* Notifications Section */}
            {activeTab === 'notifications' && (
              <>
                <div className="settings-section">
                  <div className="settings-section-header">
                    <h2>Налаштування сповіщень</h2>
                    <p>Керуйте тим, які сповіщення ви отримуєте</p>
                  </div>
                  
                  <div className="notification-settings">
                    <div className="notification-channels">
                      <h3>Канали сповіщень</h3>
                      
                      <div className="toggle-container">
                        <div className="toggle-item">
                          <div className="toggle-label">
                            <FaEnvelope /> 
                            <span>Email сповіщення</span>
                          </div>
                          <button 
                            className={`toggle-button ${notificationSettings.emailNotifications ? 'active' : ''}`}
                            onClick={() => handleNotificationToggle('emailNotifications')}
                          >
                            {notificationSettings.emailNotifications ? <FaToggleOn /> : <FaToggleOff />}
                          </button>
                        </div>
                        
                        <div className="toggle-item">
                          <div className="toggle-label">
                            <FaPhone /> 
                            <span>SMS сповіщення</span>
                          </div>
                          <button 
                            className={`toggle-button ${notificationSettings.smsNotifications ? 'active' : ''}`}
                            onClick={() => handleNotificationToggle('smsNotifications')}
                          >
                            {notificationSettings.smsNotifications ? <FaToggleOn /> : <FaToggleOff />}
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="notification-types">
                      <h3>Типи сповіщень</h3>
                      
                      <div className="toggle-container">
                        <div className="toggle-item">
                          <div className="toggle-label">
                            <FaBook /> 
                            <span>Оновлення курсів</span>
                            <p className="toggle-description">Сповіщення про нові матеріали, зміни в курсах</p>
                          </div>
                          <button 
                            className={`toggle-button ${notificationSettings.courseUpdates ? 'active' : ''}`}
                            onClick={() => handleNotificationToggle('courseUpdates')}
                          >
                            {notificationSettings.courseUpdates ? <FaToggleOn /> : <FaToggleOff />}
                          </button>
                        </div>
                        
                        <div className="toggle-item">
                          <div className="toggle-label">
                            <FaSpinner /> 
                            <span>Нагадування про завдання</span>
                            <p className="toggle-description">Нагадування про дедлайни та незавершені завдання</p>
                          </div>
                          <button 
                            className={`toggle-button ${notificationSettings.assignmentReminders ? 'active' : ''}`}
                            onClick={() => handleNotificationToggle('assignmentReminders')}
                          >
                            {notificationSettings.assignmentReminders ? <FaToggleOn /> : <FaToggleOff />}
                          </button>
                        </div>
                        
                        <div className="toggle-item">
                          <div className="toggle-label">
                            <FaBell /> 
                            <span>Оголошення платформи</span>
                            <p className="toggle-description">Важливі оголошення та оновлення платформи</p>
                          </div>
                          <button 
                            className={`toggle-button ${notificationSettings.platformAnnouncements ? 'active' : ''}`}
                            onClick={() => handleNotificationToggle('platformAnnouncements')}
                          >
                            {notificationSettings.platformAnnouncements ? <FaToggleOn /> : <FaToggleOff />}
                          </button>
                        </div>
                        
                        <div className="toggle-item">
                          <div className="toggle-label">
                            <FaEnvelope /> 
                            <span>Маркетингові email-розсилки</span>
                            <p className="toggle-description">Інформація про знижки, нові курси та спеціальні пропозиції</p>
                          </div>
                          <button 
                            className={`toggle-button ${notificationSettings.marketingEmails ? 'active' : ''}`}
                            onClick={() => handleNotificationToggle('marketingEmails')}
                          >
                            {notificationSettings.marketingEmails ? <FaToggleOn /> : <FaToggleOff />}
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <button 
                      className="btn-save-settings"
                      onClick={handleNotificationSettingsSubmit}
                    >
                      Зберегти налаштування сповіщень
                    </button>
                  </div>
                </div>
                
                <div className="settings-section">
                  <div className="settings-section-header">
                    <h2>Розклад сповіщень</h2>
                    <p>Налаштуйте час, коли ви хочете отримувати сповіщення</p>
                  </div>
                  
                  <div className="notification-schedule">
                    <div className="form-group">
                      <label htmlFor="notification_time">Час сповіщень</label>
                      <select 
                        id="notification_time"
                        name="time"
                        value={notificationSchedule.time}
                        onChange={handleNotificationScheduleChange}
                      >
                        <option value="morning">Вранці (8:00-10:00)</option>
                        <option value="afternoon">Вдень (12:00-14:00)</option>
                        <option value="evening">Ввечері (18:00-20:00)</option>
                        <option value="anytime">Будь-коли</option>
                      </select>
                    </div>
                    
                    <div className="notification-days">
                      <h4>Дні тижня</h4>
                      <div className="day-buttons">
                        {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'].map(day => (
                          <button 
                            key={day}
                            className={`day-btn ${notificationSchedule.days.includes(day) ? 'active' : ''}`}
                            onClick={() => handleDayToggle(day)}
                          >
                            {day}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <button 
                      className="btn-save-settings"
                      onClick={saveNotificationSchedule}
                    >
                      Зберегти розклад
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}

export default Settings;