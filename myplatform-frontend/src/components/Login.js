import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
    <div className="container mt-5">
      <h2>Авторизація</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">Email або ім'я користувача</label>
          <input type="text" className="form-control" id="username" name="username" value={formData.username} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="password">Пароль</label>
          <input type="password" className="form-control" id="password" name="password" value={formData.password} onChange={handleChange} required />
        </div>
        <button type="submit" className="btn btn-primary">Увійти</button>
      </form>
      <div className="mt-3">
        <button className="btn btn-secondary" onClick={() => window.location.href = '/forgot-password'}>Забули пароль?</button>
        <button className="btn btn-danger ml-2">Увійти через Google</button>
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