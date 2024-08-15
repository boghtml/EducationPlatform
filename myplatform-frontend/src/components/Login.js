import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../css/style.css';
import API_URL from '../api';

function Login() {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

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
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const csrftoken = getCookie('csrftoken');
    axios.post(`${API_URL}/users/login/`, formData, {
      headers: {
        'X-CSRFToken': csrftoken,
        'Content-Type': 'application/json',
      },
      withCredentials: true
    })
      .then(response => {
        console.log('User logged in successfully', response.data);
        sessionStorage.setItem('userName', response.data.userName);
        sessionStorage.setItem('userId', response.data.id); // Додаємо збереження userId
        sessionStorage.setItem('userEmail', response.data.userEmail);
        sessionStorage.setItem('profileImageUrl', response.data.profileImageUrl);
        window.location.href = '/dashboard';
      })
      .catch(error => {
        console.error('There was an error logging in the user!', error);
        if (error.response && error.response.data) {
          console.log('Error in form:', error.response.data);
        }
      });
  };

  return (
    <div className="auth-container dashboard__auth-container">
    <h2 className="dashboard__auth-title">Авторизація</h2>
    <form onSubmit={handleSubmit} className="dashboard__auth-form">
      <div className="dashboard__form-group">
        <label htmlFor="username" className="dashboard__form-label">Email або ім'я користувача</label>
        <input
          type="text"
          className="dashboard__form-control"
          id="username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          required
        />
      </div>
      <div className="dashboard__form-group">
        <label htmlFor="password" className="dashboard__form-label">Пароль</label>
        <input
          type="password"
          className="dashboard__form-control"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
        />
      </div>
      <button type="submit" className="dashboard__btn dashboard__btn--primary">Увійти</button>
    </form>
    <div className="dashboard__auth-buttons">
      <button className="dashboard__btn dashboard__btn--secondary" onClick={() => window.location.href = '/forgot-password'}>
        Забули пароль?
      </button>
      <button className="dashboard__btn dashboard__btn--danger">Увійти через Google</button>
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