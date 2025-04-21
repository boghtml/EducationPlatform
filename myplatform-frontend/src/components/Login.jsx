import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../api';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

// Іконки
import { FaGoogle, FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';

function Login() {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginMessage, setLoginMessage] = useState({ type: '', message: '' });
  const navigate = useNavigate();

  useEffect(() => {
    getCSRFToken();
  }, []);

  const getCSRFToken = () => {
    axios.get(`${API_URL}/get-csrf-token/`, { withCredentials: true })
      .then(response => {
        console.log('CSRF token set', response.data);
      })
      .catch(error => {
        console.error('Error fetching CSRF token', error);
      });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    
    // Очищення помилок при зміні поля
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username) {
      newErrors.username = 'Будь ласка, введіть email або ім\'я користувача';
    }
    
    if (!formData.password) {
      newErrors.password = 'Будь ласка, введіть пароль';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    setLoginMessage({ type: '', message: '' });
    
    const csrftoken = getCookie('csrftoken');
    
    try {
      const response = await axios.post(`${API_URL}/users/login/`, formData, {
        headers: {
          'X-CSRFToken': csrftoken,
          'Content-Type': 'application/json',
        },
        withCredentials: true
      });
      
      console.log('User logged in successfully', response.data);
      
      // Зберігання даних користувача
      sessionStorage.setItem('userName', response.data.userName);
      sessionStorage.setItem('userId', response.data.id);
      sessionStorage.setItem('userEmail', response.data.userEmail);
      sessionStorage.setItem('profileImageUrl', response.data.profileImageUrl);
      sessionStorage.setItem('userRole', response.data.role);
      
      setLoginMessage({ 
        type: 'success', 
        message: 'Успішна авторизація. Перенаправлення...' 
      });
      
      // Затримка перед перенаправленням для відображення повідомлення
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
      
    } catch (error) {
      console.error('There was an error logging in the user!', error);
      
      setLoginMessage({ 
        type: 'error', 
        message: error.response?.data?.errors || 'Помилка авторизації. Перевірте ім\'я користувача та пароль.' 
      });
      
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = (credentialResponse) => {
    setIsLoading(true);
    setLoginMessage({ type: '', message: '' });
    
    axios.post(`${API_URL}/users/login/`, {
      token: credentialResponse.credential
    })
    .then(response => {
      console.log('User logged in via Google successfully', response.data);
      
      sessionStorage.setItem('userName', response.data.userName);
      sessionStorage.setItem('userId', response.data.id);
      sessionStorage.setItem('userEmail', response.data.userEmail);
      sessionStorage.setItem('profileImageUrl', response.data.profileImageUrl);
      sessionStorage.setItem('userRole', response.data.role);
      
      setLoginMessage({ 
        type: 'success', 
        message: 'Успішна авторизація через Google. Перенаправлення...' 
      });
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    })
    .catch(error => {
      console.error('There was an error logging in via Google!', error);
      
      setLoginMessage({ 
        type: 'error', 
        message: 'Помилка авторизації через Google.' 
      });
    })
    .finally(() => {
      setIsLoading(false);
    });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="auth-container container mt-5">
      <div className="auth-form-container">
        <div className="auth-header">
          <h2>Авторизація</h2>
          <p>Увійдіть у свій обліковий запис, щоб продовжити</p>
        </div>
        
        {loginMessage.message && (
          <div className={`alert ${loginMessage.type === 'success' ? 'alert-success' : 'alert-danger'}`}>
            {loginMessage.message}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group position-relative">
            <label htmlFor="username">
              <FaEnvelope className="input-icon" />
              <span>Email або ім'я користувача</span>
            </label>
            <input 
              type="text" 
              className={`form-control ${errors.username ? 'is-invalid' : ''}`} 
              id="username" 
              name="username" 
              value={formData.username} 
              onChange={handleChange} 
              placeholder="Введіть свій email або ім'я користувача"
              disabled={isLoading}
            />
            {errors.username && <div className="invalid-feedback">{errors.username}</div>}
          </div>
          
          <div className="form-group position-relative">
            <label htmlFor="password">
              <FaLock className="input-icon" />
              <span>Пароль</span>
            </label>
            <div className="password-input-container position-relative">
              <input 
                type={showPassword ? "text" : "password"} 
                className={`form-control ${errors.password ? 'is-invalid' : ''}`} 
                id="password" 
                name="password" 
                value={formData.password} 
                onChange={handleChange} 
                placeholder="Введіть свій пароль"
                autoComplete="current-password"
                disabled={isLoading} 
              />
              <button 
                type="button" 
                className="btn password-toggle-btn" 
                onClick={togglePasswordVisibility}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.password && <div className="invalid-feedback">{errors.password}</div>}
          </div>
          
          <div className="forgot-password text-end mb-3">
            <Link to="/forgot-password">Забули пароль?</Link>
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary btn-block"
            disabled={isLoading}
          >
            {isLoading ? 'Авторизація...' : 'Увійти'}
          </button>
          
          <div className="divider">
            <span>або</span>
          </div>
          
          <div className="social-login">
            <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
              <div className="google-btn-container">
                <GoogleLogin
                  onSuccess={handleGoogleLogin}
                  onError={() => {
                    console.log('Login Failed');
                    setLoginMessage({ 
                      type: 'error', 
                      message: 'Не вдалося авторизуватися через Google' 
                    });
                  }}
                  type="standard"
                  theme="filled_blue"
                  size="large"
                  text="continue_with"
                  shape="rectangular"
                  logo_alignment="left"
                  width="100%"
                />
              </div>
            </GoogleOAuthProvider>
          </div>
          
          <div className="auth-footer">
            <p>
              Ще не маєте облікового запису? <Link to="/register">Зареєструватися</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

export default Login;