import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../api';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';

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

  const getCSRFToken = async () => {
    try {
      await axios.get(`${API_URL}/get-csrf-token/`, { withCredentials: true });
      console.log('CSRF token fetched successfully');
    } catch (error) {
      console.error('Error fetching CSRF token', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    
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
      newErrors.username = 'Please enter email or username';
    }
    
    if (!formData.password) {
      newErrors.password = 'Please enter password';
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
      
      sessionStorage.setItem('userName', response.data.userName);
      sessionStorage.setItem('userId', response.data.id);
      sessionStorage.setItem('userEmail', response.data.userEmail);
      sessionStorage.setItem('profileImageUrl', response.data.profileImageUrl);
      sessionStorage.setItem('userRole', response.data.role);
      
      setLoginMessage({ 
        type: 'success', 
        message: 'Login successful. Redirecting...' 
      });
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
      
    } catch (error) {
      console.error('Login error:', error);
      
      setLoginMessage({ 
        type: 'error', 
        message: error.response?.data?.errors || 'Login failed. Check your username and password.' 
      });
      
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async (credentialResponse) => {
    setIsLoading(true);
    setLoginMessage({ type: '', message: '' });
    
    try {
      const response = await axios.post(`${API_URL}/users/login/`, {
        token: credentialResponse.credential
      }, { withCredentials: true });
      
      console.log('User logged in via Google successfully', response.data);
      
      sessionStorage.setItem('userName', response.data.userName);
      sessionStorage.setItem('userId', response.data.id);
      sessionStorage.setItem('userEmail', response.data.userEmail);
      sessionStorage.setItem('profileImageUrl', response.data.profileImageUrl);
      sessionStorage.setItem('userRole', response.data.role);
      
      setLoginMessage({ 
        type: 'success', 
        message: 'Google login successful. Redirecting...' 
      });
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } catch (error) {
      console.error('Google login error:', error);
      
      setLoginMessage({ 
        type: 'error', 
        message: 'Google login failed: ' + (error.response?.data?.errors || error.message)
      });
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;
  console.log('Google Client ID:', GOOGLE_CLIENT_ID);

  return (
    <div className="auth-container container mt-5">
      <div className="auth-form-container">
        <div className="auth-header">
          <h2>Login</h2>
          <p>Log in to your account to continue</p>
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
              <span>Email or Username</span>
            </label>
            <input 
              type="text" 
              className={`form-control ${errors.username ? 'is-invalid' : ''}`} 
              id="username" 
              name="username" 
              value={formData.username} 
              onChange={handleChange} 
              placeholder="Enter your email or username"
              disabled={isLoading}
            />
            {errors.username && <div className="invalid-feedback">{errors.username}</div>}
          </div>
          
          <div className="form-group position-relative">
            <label htmlFor="password">
              <FaLock className="input-icon" />
              <span>Password</span>
            </label>
            <div className="password-input-container position-relative">
              <input 
                type={showPassword ? "text" : "password"} 
                className={`form-control ${errors.password ? 'is-invalid' : ''}`} 
                id="password" 
                name="password" 
                value={formData.password} 
                onChange={handleChange} 
                placeholder="Enter your password"
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
            <Link to="/forgot-password">Forgot password?</Link>
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary btn-block"
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
          
          <div className="divider">
            <span>or</span>
          </div>
          
          <div className="social-login">
            {GOOGLE_CLIENT_ID ? (
              <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
                <div className="google-btn-container">
                  <GoogleLogin
                    onSuccess={handleGoogleLogin}
                    onError={(error) => {
                      console.error('Google login failed:', error);
                      setLoginMessage({ 
                        type: 'error', 
                        message: 'Google login failed. Please try again.' 
                      });
                    }}
                    useOneTap
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
            ) : (
              <div className="alert alert-warning">
                Google login is not available. Please contact the administrator.
              </div>
            )}
          </div>
          
          <div className="auth-footer">
            <p>
              Don't have an account yet? <Link to="/register">Register</Link>
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