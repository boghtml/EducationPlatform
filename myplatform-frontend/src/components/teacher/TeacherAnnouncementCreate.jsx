// src/components/teacher/TeacherAnnouncementCreate.jsx

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../../api';
import TeacherSidebar from './TeacherSidebar';
import TeacherHeader from './TeacherHeader';
import { 
  FaArrowLeft, 
  FaSave, 
  FaUpload, 
  FaSpinner, 
  FaTrash,
  FaExclamationTriangle,
  FaInfoCircle,
  FaCheck
} from 'react-icons/fa';
import '../../css/teacher/TeacherAnnouncementCreate.css';

// Налаштування axios для CSRF
axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.xsrfHeaderName = 'X-CSRFToken';
axios.defaults.withCredentials = true;

function TeacherAnnouncementCreate() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    event_type: 'event',
    status: 'published',
    start_date: '',
    end_date: '',
    location: '',
    image_url: ''
  });
  
  const [preview, setPreview] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  
  const imageInputRef = useRef(null);
  
  useEffect(() => {
    // Очищаємо повідомлення про успіх через 3 секунди
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);
  
  useEffect(() => {
    const userRole = sessionStorage.getItem('userRole');
    if (userRole !== 'teacher' && userRole !== 'admin') {
      navigate('/login');
    }
  }, [navigate]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // File type validation
    if (!file.type.startsWith('image/')) {
      setError('Будь ласка, виберіть файл зображення');
      return;
    }
    
    // File size validation (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setError('Розмір файлу не повинен перевищувати 5MB');
      return;
    }
    
    // Create preview and store file
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
      setImageFile(file);
      setError(null); // Clear any previous errors
    };
    reader.onerror = () => {
      setError('Помилка при читанні файлу');
    };
    reader.readAsDataURL(file);
  };

  // Двоетапний процес: спочатку створюємо захід, потім завантажуємо зображення  
  const createEventWithImage = async () => {
    try {
      // Get CSRF token
      const csrfResponse = await axios.get(`${API_URL}/get-csrf-token/`, { withCredentials: true });
      const csrfToken = csrfResponse.data.csrftoken;
      
      // Create event first
      const eventData = { ...formData };
      delete eventData.image_url; // Remove image_url as it will be set after upload
      
      const eventResponse = await axios.post(`${API_URL}/events/events/`, eventData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken
        }
      });
      
      console.log("Event created successfully:", eventResponse.data);
      
      // Get the newly created event ID from the API response
      const newEventId = eventResponse.data?.id;
      if (!newEventId) {
        console.error("No event ID in response:", eventResponse.data);
        throw new Error('Не вдалося отримати ID нового заходу');
      }
      
      // Handle image upload if image exists
      if (imageFile) {
        console.log("Uploading image for event:", newEventId);
        
        const imageFormData = new FormData();
        imageFormData.append('image', imageFile);
        
        try {
          const imageResponse = await axios.post(
            `${API_URL}/events/events/${newEventId}/upload_image/`,
            imageFormData,
            {
              withCredentials: true,
              headers: {
                'X-CSRFToken': csrfToken
              }
            }
          );
          
          console.log("Image upload successful:", imageResponse.data);
        } catch (imageError) {
          console.error("Failed to upload image:", imageError);
          // Continue execution even if image upload fails
          setError("Захід створено, але виникла помилка при завантаженні зображення");
          setTimeout(() => navigate('/teacher/announcements'), 2000);
          return;
        }
      }
      
      setSuccessMessage("Захід успішно створено");
      setTimeout(() => navigate('/teacher/announcements'), 1000);
    } catch (error) {
      console.error("Error:", error);
      if (error.response) {
        setError("Помилка: " + (error.response.data.message || JSON.stringify(error.response.data)));
      } else if (error.request) {
        setError("Помилка: Сервер не відповідає");
      } else {
        setError("Помилка: " + error.message);
      }
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    
    try {
      await createEventWithImage();
    } catch (error) {
      console.error("Error in form submission:", error);
      setError("Помилка під час створення заходу. Спробуйте ще раз.");
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <div className="teacher-announcement-form-wrapper">
      <TeacherHeader />
      
      <div className="teacher-announcement-form-container">
        <TeacherSidebar />
        
        <div className="teacher-announcement-form-content">
          <div className="teacher-announcement-form-header">
            <Link to="/teacher/announcements" className="announcement-back-link">
              <FaArrowLeft /> Назад до списку
            </Link>
            <h1>Створення нового заходу</h1>
          </div>
          
          {error && (
            <div className="announcement-form-error">
              <FaExclamationTriangle /> {error}
            </div>
          )}
          
          {successMessage && (
            <div className="announcement-form-success">
              <FaCheck /> {successMessage}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="announcement-form">
            <div className="announcement-form-grid">
              <div className="announcement-form-main">
                <div className="form-group">
                  <label htmlFor="title">Назва *</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="form-control"
                    placeholder="Введіть назву заходу"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="description">Короткий опис *</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    className="form-control"
                    rows="3"
                    placeholder="Введіть короткий опис заходу"
                  ></textarea>
                </div>
                
                <div className="form-group">
                  <label htmlFor="content">Повний текст</label>
                  <textarea
                    id="content"
                    name="content"
                    value={formData.content}
                    onChange={handleChange}
                    className="form-control"
                    rows="10"
                    placeholder="Детальний опис заходу. Можете використовувати HTML-теги для форматування."
                  ></textarea>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="event_type">Тип публікації *</label>
                    <select
                      id="event_type"
                      name="event_type"
                      value={formData.event_type}
                      onChange={handleChange}
                      required
                      className="form-control"
                    >
                      <option value="event">Захід</option>
                      <option value="news">Новина</option>
                      <option value="announcement">Оголошення</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="status">Статус *</label>
                    <select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      required
                      className="form-control"
                    >
                      <option value="published">Опубліковано</option>
                      <option value="draft">Чернетка</option>
                      <option value="archived">Архів</option>
                    </select>
                  </div>
                </div>
                
                {formData.event_type === 'event' && (
                  <>
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="start_date">Дата початку</label>
                        <input
                          type="datetime-local"
                          id="start_date"
                          name="start_date"
                          value={formData.start_date}
                          onChange={handleChange}
                          className="form-control"
                        />
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="end_date">Дата завершення</label>
                        <input
                          type="datetime-local"
                          id="end_date"
                          name="end_date"
                          value={formData.end_date}
                          onChange={handleChange}
                          className="form-control"
                        />
                      </div>
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="location">Місце проведення</label>
                      <input
                        type="text"
                        id="location"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        className="form-control"
                        placeholder="Введіть місце проведення заходу"
                      />
                    </div>
                  </>
                )}
              </div>
              
              <div className="announcement-form-sidebar">
                <div className="announcement-form-section">
                  <h3>Головне зображення</h3>
                  <div className="image-upload-container">
                    {preview ? (
                      <div className="image-preview-wrapper">
                        <img 
                          src={preview} 
                          alt="Preview" 
                          className="image-preview" 
                          onError={(e) => {e.target.src = 'https://via.placeholder.com/300x200?text=Попередній+перегляд'}}
                        />
                        <button 
                          type="button" 
                          className="image-remove-btn"
                          onClick={() => {
                            setPreview('');
                            setImageFile(null);
                          }}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    ) : (
                      <div 
                        className="image-upload-placeholder"
                        onClick={() => imageInputRef.current.click()}
                      >
                        <FaUpload />
                        <span>Завантажити зображення</span>
                      </div>
                    )}
                    
                    <input
                      type="file"
                      ref={imageInputRef}
                      style={{ display: 'none' }}
                      onChange={handleImageChange}
                      accept="image/*"
                    />
                    
                    <button
                      type="button"
                      className="btn-upload"
                      onClick={() => imageInputRef.current.click()}
                    >
                      <FaUpload /> {preview ? 'Змінити зображення' : 'Завантажити зображення'}
                    </button>
                    
                    <div className="form-hint">
                      <FaInfoCircle /> Рекомендований розмір: 1200x630 пікселів
                    </div>
                  </div>
                </div>
                
                <div className="form-hint-files">
                  <p>Ви зможете додати файли після створення заходу.</p>
                </div>
                
                <div className="form-actions">
                  <button
                    type="submit"
                    className="btn-save"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <><FaSpinner className="spinner" /> Створення...</>
                    ) : (
                      <><FaSave /> Створити</>
                    )}
                  </button>
                  
                  <Link to="/teacher/announcements" className="btn-cancel">
                    Скасувати
                  </Link>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default TeacherAnnouncementCreate;