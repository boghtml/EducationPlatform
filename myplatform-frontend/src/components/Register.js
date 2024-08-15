
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../api';

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
    console.log('Form data before submission:', formData);  // Новий рядок для логування
    axios.post(`${API_URL}/users/register/`, formData, {
      headers: {
        'X-CSRFToken': csrftoken,
        'Content-Type': 'application/x-www-form-urlencoded',  // Змінено з 'application/json'
      },
      withCredentials: true
    })
      .then(response => {
        console.log('User registered successfully', response.data);
        window.location.href = '/login';
      })
      .catch(error => {
        console.error('There was an error registering the user!', error);
        if (error.response && error.response.data) {
          console.log('Error in form:', error.response.data);
        }
      });
  };

  return (
    <div className="registration__container">
    <h2 className="registration__title">Реєстрація</h2>
    <form onSubmit={handleSubmit} className="registration__form">
      <div className="registration__form-group">
        <label htmlFor="username" className="registration__form-label">Ім'я користувача</label>
        <input
          type="text"
          className="registration__form-control"
          id="username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          required
        />
      </div>
      <div className="registration__form-group">
        <label htmlFor="email" className="registration__form-label">Email</label>
        <input
          type="email"
          className="registration__form-control"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </div>
      <div className="registration__form-group">
        <label htmlFor="first_name" className="registration__form-label">Ім'я</label>
        <input
          type="text"
          className="registration__form-control"
          id="first_name"
          name="first_name"
          value={formData.first_name}
          onChange={handleChange}
        />
      </div>
      <div className="registration__form-group">
        <label htmlFor="last_name" className="registration__form-label">Прізвище</label>
        <input
          type="text"
          className="registration__form-control"
          id="last_name"
          name="last_name"
          value={formData.last_name}
          onChange={handleChange}
        />
      </div>
      <div className="registration__form-group">
        <label htmlFor="phone_number" className="registration__form-label">Номер телефону</label>
        <input
          type="text"
          className="registration__form-control"
          id="phone_number"
          name="phone_number"
          value={formData.phone_number}
          onChange={handleChange}
        />
      </div>
      <div className="registration__form-group">
        <label htmlFor="profile_image_url" className="registration__form-label">URL зображення профілю</label>
        <input
          type="text"
          className="registration__form-control"
          id="profile_image_url"
          name="profile_image_url"
          value={formData.profile_image_url}
          onChange={handleChange}
        />
      </div>
      <div className="registration__form-group">
        <label htmlFor="password1" className="registration__form-label">Пароль</label>
        <input
          type="password"
          className="registration__form-control"
          id="password1"
          name="password1"
          value={formData.password1}
          onChange={handleChange}
          required
        />
      </div>
      <div className="registration__form-group">
        <label htmlFor="password2" className="registration__form-label">Підтвердіть пароль</label>
        <input
          type="password"
          className="registration__form-control"
          id="password2"
          name="password2"
          value={formData.password2}
          onChange={handleChange}
          required
        />
      </div>
      <button type="submit" className="registration__btn registration__btn--primary">Зареєструватися</button>
    </form>
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
