import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../api';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

import { 
  FaEnvelope, 
  FaLock, 
  FaEye, 
  FaEyeSlash, 
  FaUser, 
  FaUserTag, 
  FaPhone, 
  FaImage,
  FaArrowLeft
} from 'react-icons/fa';

function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    phone_number: '',
    profile_image_url: '',
    password1: '',
    password2: '',
    role: 'student'
  });
  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword1, setShowPassword1] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [registrationMessage, setRegistrationMessage] = useState({ type: '', message: '' });
  const [step, setStep] = useState(1); 
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
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const validateStep1 = () => {
    const newErrors = {};
    
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    
    if (!formData.password1) {
      newErrors.password1 = 'Password is required';
    } else if (formData.password1.length < 8) {
      newErrors.password1 = 'Password must be at least 8 characters';
    }
    
    if (!formData.password2) {
      newErrors.password2 = 'Password confirmation is required';
    } else if (formData.password1 !== formData.password2) {
      newErrors.password2 = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  const prevStep = () => {
    setStep(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (step === 1) {
      nextStep();
      return;
    }
    
    if (!validateStep2()) return;
    
    setIsLoading(true);
    setRegistrationMessage({ type: '', message: '' });
    
    const csrftoken = getCookie('csrftoken');
    
    try {
      const response = await axios.post(`${API_URL}/users/register/`, formData, {
        headers: {
          'X-CSRFToken': csrftoken,
          'Content-Type': 'application/json',
        },
        withCredentials: true
      });
      
      console.log('User registered successfully', response.data);
      
      setRegistrationMessage({ 
        type: 'success', 
        message: 'Registration successful! Redirecting to login page...' 
      });
      
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      
    } catch (error) {
      console.error('Registration error:', error);
      
      if (error.response && error.response.data && error.response.data.errors) {
        setErrors(error.response.data.errors);
      } else {
        setRegistrationMessage({ 
          type: 'error', 
          message: 'Registration failed. Please check your information.' 
        });
      }
      
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleRegister = async (credentialResponse) => {
    setIsLoading(true);
    setRegistrationMessage({ type: '', message: '' });
    
    try {
      const response = await axios.post(`${API_URL}/users/register/`, {
        token: credentialResponse.credential
      }, { withCredentials: true });
      
      console.log('User registered via Google successfully', response.data);
      
      setRegistrationMessage({ 
        type: 'success', 
        message: 'Google registration successful! Redirecting to login page...' 
      });
      
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      console.error('Google registration error:', error);
      
      setRegistrationMessage({ 
        type: 'error', 
        message: 'Google registration failed: ' + (error.response?.data?.errors || error.message)
      });
    } finally {
      setIsLoading(false);
    }
  };

  const togglePassword1Visibility = () => {
    setShowPassword1(!showPassword1);
  };

  const togglePassword2Visibility = () => {
    setShowPassword2(!showPassword2);
  };

  const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

  const renderStep1 = () => (
    <>
      <div className="form-group position-relative">
        <label htmlFor="username">
          <FaUserTag className="input-icon" />
          <span>Username*</span>
        </label>
        <input 
          type="text" 
          className={`form-control ${errors.username ? 'is-invalid' : ''}`} 
          id="username" 
          name="username" 
          value={formData.username} 
          onChange={handleChange} 
          placeholder="Enter username"
          disabled={isLoading} 
        />
        {errors.username && <div className="invalid-feedback">{errors.username}</div>}
      </div>
      
      <div className="form-group position-relative">
        <label htmlFor="email">
          <FaEnvelope className="input-icon" />
          <span>Email*</span>
        </label>
        <input 
          type="email" 
          className={`form-control ${errors.email ? 'is-invalid' : ''}`} 
          id="email" 
          name="email" 
          value={formData.email} 
          onChange={handleChange} 
          placeholder="Enter email"
          disabled={isLoading} 
        />
        {errors.email && <div className="invalid-feedback">{errors.email}</div>}
      </div>
      
      <div className="form-group position-relative">
        <label htmlFor="first_name">
          <FaUser className="input-icon" />
          <span>First Name</span>
        </label>
        <input 
          type="text" 
          className="form-control" 
          id="first_name" 
          name="first_name" 
          value={formData.first_name} 
          onChange={handleChange} 
          placeholder="Enter your first name"
          disabled={isLoading} 
        />
      </div>
      
      <div className="form-group position-relative">
        <label htmlFor="last_name">
          <FaUser className="input-icon" />
          <span>Last Name</span>
        </label>
        <input 
          type="text" 
          className="form-control" 
          id="last_name" 
          name="last_name" 
          value={formData.last_name} 
          onChange={handleChange} 
          placeholder="Enter your last name"
          disabled={isLoading} 
        />
      </div>
      
      <div className="form-group position-relative">
        <label htmlFor="phone_number">
          <FaPhone className="input-icon" />
          <span>Phone Number</span>
        </label>
        <input 
          type="text" 
          className="form-control" 
          id="phone_number" 
          name="phone_number" 
          value={formData.phone_number} 
          onChange={handleChange} 
          placeholder="Enter phone number"
          disabled={isLoading} 
        />
      </div>
      
      <div className="form-group position-relative">
        <label htmlFor="profile_image_url">
          <FaImage className="input-icon" />
          <span>Profile Image URL</span>
        </label>
        <input 
          type="text" 
          className="form-control" 
          id="profile_image_url" 
          name="profile_image_url" 
          value={formData.profile_image_url} 
          onChange={handleChange} 
          placeholder="Enter image URL"
          disabled={isLoading} 
        />
      </div>
      
      <div className="form-group">
        <label>Role</label>
        <div className="role-selection">
          <div className="form-check form-check-inline">
            <input
              className="form-check-input"
              type="radio"
              name="role"
              id="role-student"
              value="student"
              checked={formData.role === 'student'}
              onChange={handleChange}
              disabled={isLoading}
            />
            <label className="form-check-label" htmlFor="role-student">
              Student
            </label>
          </div>
          <div className="form-check form-check-inline">
            <input
              className="form-check-input"
              type="radio"
              name="role"
              id="role-teacher"
              value="teacher"
              checked={formData.role === 'teacher'}
              onChange={handleChange}
              disabled={isLoading}
            />
            <label className="form-check-label" htmlFor="role-teacher">
              Teacher
            </label>
          </div>
        </div>
      </div>
      
      <button 
        type="button" 
        className="btn btn-primary btn-block"
        onClick={nextStep}
        disabled={isLoading}
      >
        Continue
      </button>
    </>
  );

  const renderStep2 = () => (
    <>
      <div className="form-group position-relative">
        <label htmlFor="password1">
          <FaLock className="input-icon" />
          <span>Password*</span>
        </label>
        <div className="password-input-container">
          <input 
            type={showPassword1 ? "text" : "password"} 
            className={`form-control ${errors.password1 ? 'is-invalid' : ''}`} 
            id="password1" 
            name="password1" 
            value={formData.password1} 
            onChange={handleChange} 
            placeholder="Enter password"
            disabled={isLoading} 
          />
          <button 
            type="button" 
            className="btn password-toggle-btn" 
            onClick={togglePassword1Visibility}
          >
            {showPassword1 ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>
        {errors.password1 && <div className="invalid-feedback">{errors.password1}</div>}
      </div>
      
      <div className="form-group position-relative">
        <label htmlFor="password2">
          <FaLock className="input-icon" />
          <span>Confirm Password*</span>
        </label>
        <div className="password-input-container">
          <input 
            type={showPassword2 ? "text" : "password"} 
            className={`form-control ${errors.password2 ? 'is-invalid' : ''}`} 
            id="password2" 
            name="password2" 
            value={formData.password2} 
            onChange={handleChange} 
            placeholder="Confirm password"
            disabled={isLoading} 
          />
          <button 
            type="button" 
            className="btn password-toggle-btn" 
            onClick={togglePassword2Visibility}
          >
            {showPassword2 ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>
        {errors.password2 && <div className="invalid-feedback">{errors.password2}</div>}
      </div>
      
      <div className="form-buttons">
        <button 
          type="button" 
          className="btn btn-secondary"
          onClick={prevStep}
          disabled={isLoading}
        >
          <FaArrowLeft className="mr-2" /> Back
        </button>
        <button 
          type="submit" 
          className="btn btn-primary ml-2"
          disabled={isLoading}
        >
          {isLoading ? 'Registering...' : 'Register'}
        </button>
      </div>
    </>
  );

  return (
    <div className="auth-container container mt-5">
      <div className="auth-form-container">
        <div className="auth-header">
          <h2>Register</h2>
          <p>Create your account</p>
          <div className="step-indicator">
            <div className={`step ${step === 1 ? 'active' : ''}`}>
              <span className="step-number">1</span>
              <span className="step-text">Personal Information</span>
            </div>
            <div className="step-divider"></div>
            <div className={`step ${step === 2 ? 'active' : ''}`}>
              <span className="step-number">2</span>
              <span className="step-text">Security</span>
            </div>
          </div>
        </div>
        
        {registrationMessage.message && (
          <div className={`alert ${registrationMessage.type === 'success' ? 'alert-success' : 'alert-danger'}`}>
            {registrationMessage.message}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="auth-form">
          {step === 1 ? renderStep1() : renderStep2()}
        </form>
        
        {step === 1 && (
          <>
            <div className="divider">
              <span>or</span>
            </div>
            
            <div className="social-login">
              {GOOGLE_CLIENT_ID ? (
                <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
                  <div className="google-btn-container">
                    <GoogleLogin
                      onSuccess={handleGoogleRegister}
                      onError={(error) => {
                        console.error('Google registration failed:', error);
                        setRegistrationMessage({ 
                          type: 'error', 
                          message: 'Google registration failed. Please try again.' 
                        });
                      }}
                      useOneTap
                      type="standard"
                      theme="filled_blue"
                      size="large"
                      text="signup_with"
                      shape="rectangular"
                      logo_alignment="left"
                      width="100%"
                    />
                  </div>
                </GoogleOAuthProvider>
              ) : (
                <div className="alert alert-warning">
                  Google registration is not available. Please contact the administrator.
                </div>
              )}
            </div>
          </>
        )}
        
        <div className="auth-footer">
          <p>
            Already have an account? <Link to="/login">Login</Link>
          </p>
          <p className="mt-2">
            <small>
              By registering, you agree to our 
              <Link to="/terms-of-service" className="mx-1">Terms of Service</Link>
              and
              <Link to="/privacy-policy" className="mx-1">Privacy Policy</Link>
            </small>
          </p>
        </div>
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

export default Register;