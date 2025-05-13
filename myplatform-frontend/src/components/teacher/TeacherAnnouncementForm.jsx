// src/components/teacher/TeacherAnnouncementForm.jsx

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../../api';
import TeacherSidebar from './TeacherSidebar';
import TeacherHeader from './TeacherHeader';
import { 
  FaArrowLeft, 
  FaSave, 
  FaUpload, 
  FaSpinner, 
  FaPaperclip,
  FaTrash,
  FaExclamationTriangle,
  FaInfoCircle,
  FaCheck
} from 'react-icons/fa';
import '../../css/teacher/TeacherAnnouncementForm.css';

function TeacherAnnouncementForm() {
  const { eventId } = useParams();
  const isEditMode = !!eventId;
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
  const [files, setFiles] = useState([]);
  const [newFile, setNewFile] = useState(null);
  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  
  const imageInputRef = useRef(null);
  const fileInputRef = useRef(null);
  
  // Функція для перевірки валідності URL
  const isValidUrl = (url) => {
    if (!url) return false;
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };
  
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
      return;
    }
    
    if (isEditMode) {
      const fetchEventData = async () => {
        try {
          setLoading(true);
          
          await axios.get(`${API_URL}/get-csrf-token/`, { withCredentials: true });
          
          const response = await axios.get(`${API_URL}/events/events/${eventId}/`, {
            withCredentials: true
          });
          
          console.log("Event data:", response.data);
          
          if (response.data) {
            const event = response.data;
            
            const startDate = event.start_date ? new Date(event.start_date) : null;
            const endDate = event.end_date ? new Date(event.end_date) : null;
            
            setFormData({
              title: event.title || '',
              description: event.description || '',
              content: event.content || '',
              event_type: event.event_type || 'event',
              status: event.status || 'published',
              start_date: startDate ? startDate.toISOString().slice(0, 16) : '',
              end_date: endDate ? endDate.toISOString().slice(0, 16) : '',
              location: event.location || '',
              image_url: event.image_url || ''
            });
            
            setPreview(event.image_url || '');
            setFiles(event.files || []);
          }
          
          setLoading(false);
        } catch (error) {
          console.error("Error fetching event data:", error);
          setError("Не вдалося завантажити дані про захід. Будь ласка, спробуйте пізніше.");
          setLoading(false);
        }
      };
      
      fetchEventData();
    }
  }, [eventId, isEditMode, navigate]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
    
    if (isEditMode) {
      handleImageUpload(file);
    } else {
      // Для нового заходу зберігаємо превью, але не завантажуємо на сервер
      // до моменту збереження всього заходу
      setFormData(prev => ({ ...prev, image_url: '' }));
    }
  };
  
  const handleImageUpload = async (file) => {
    try {
      setUploadingImage(true);
      setError(null);
      
      await axios.get(`${API_URL}/get-csrf-token/`, { withCredentials: true });
      
      const formData = new FormData();
      formData.append('image', file);
      
      console.log("Uploading image for event:", eventId);
      
      const response = await axios.post(`${API_URL}/events/events/${eventId}/upload_image/`, formData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      console.log("Image upload response:", response.data);
      
      if (response.data && response.data.image_url) {
        setFormData(prev => ({ ...prev, image_url: response.data.image_url }));
        setPreview(response.data.image_url);
        setSuccessMessage("Зображення успішно завантажено");
      }
      
      setUploadingImage(false);
    } catch (error) {
      console.error("Error uploading image:", error);
      setError("Не вдалося завантажити зображення. Будь ласка, спробуйте пізніше.");
      setUploadingImage(false);
    }
  };
  
  const handleFileChange = (e) => {
    setNewFile(e.target.files[0]);
  };
  
  const handleFileUpload = async () => {
    if (!newFile || !isEditMode) return;
    
    try {
      setUploadingFile(true);
      setError(null);
      
      await axios.get(`${API_URL}/get-csrf-token/`, { withCredentials: true });
      
      const formData = new FormData();
      formData.append('file', newFile);
      
      console.log("Uploading file for event:", eventId, "File:", newFile.name);
      
      const response = await axios.post(`${API_URL}/events/events/${eventId}/upload_file/`, formData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      console.log("File upload response:", response.data);
      
      if (response.data && response.data.file) {
        setFiles(prev => [...prev, response.data.file]);
        setSuccessMessage("Файл успішно завантажено");
      }
      
      setUploadingFile(false);
      setNewFile(null);
      
      if (fileInputRef.current) {
        fileInputRef.current.value = null;
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      setError("Не вдалося завантажити файл. Будь ласка, спробуйте пізніше.");
      setUploadingFile(false);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      setError(null);
      
      await axios.get(`${API_URL}/get-csrf-token/`, { withCredentials: true });
      
      let response;
      
      if (isEditMode) {
        // Оновлюємо захід
        console.log("Updating event with ID:", eventId, "Data:", formData);
        response = await axios.put(`${API_URL}/events/events/${eventId}/`, formData, {
          withCredentials: true
        });
        
        console.log("Update response:", response.data);
      } else {
        // Створюємо новий захід
        console.log("Creating new event. Data:", formData);
        response = await axios.post(`${API_URL}/events/events/`, formData, {
          withCredentials: true
        });
        
        console.log("Create response:", response.data);
        
        // Якщо зображення було додано локально (preview), завантажуємо його на сервер
        if (response.data && response.data.id && preview && preview.startsWith('data:image')) {
          const newEventId = response.data.id;
          
          const byteString = atob(preview.split(',')[1]);
          const mimeString = preview.split(',')[0].split(':')[1].split(';')[0];
          const ab = new ArrayBuffer(byteString.length);
          const ia = new Uint8Array(ab);
          for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
          }
          const blob = new Blob([ab], { type: mimeString });
          const file = new File([blob], 'image.jpg', { type: mimeString });
          
          const imageFormData = new FormData();
          imageFormData.append('image', file);
          
          console.log("Uploading image for new event:", newEventId);
          
          try {
            const imageResponse = await axios.post(`${API_URL}/events/events/${newEventId}/upload_image/`, imageFormData, {
              withCredentials: true,
              headers: {
                'Content-Type': 'multipart/form-data'
              }
            });
            
            console.log("New event image upload response:", imageResponse.data);
          } catch (imageError) {
            console.error("Error uploading image for new event:", imageError);
          }
        }
      }
      
      setSubmitting(false);
      setSuccessMessage(isEditMode ? "Захід успішно оновлено" : "Захід успішно створено");
      
      // Затримка перед переходом до списку
      setTimeout(() => {
        navigate('/teacher/announcements');
      }, 1000);
    } catch (error) {
      console.error("Error saving event:", error);
      
      if (error.response && error.response.data) {
        console.error("Server error details:", error.response.data);
        setError("Не вдалося зберегти захід: " + JSON.stringify(error.response.data));
      } else {
        setError("Не вдалося зберегти захід. Будь ласка, перевірте введені дані та спробуйте знову.");
      }
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="teacher-announcement-form-wrapper">
        <TeacherHeader />
        <div className="teacher-announcement-form-container">
          <TeacherSidebar />
          <div className="teacher-announcement-form-loading">
            <FaSpinner className="spinner" />
            <p>Завантаження даних...</p>
          </div>
        </div>
      </div>
    );
  }
  
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
            <h1>{isEditMode ? 'Редагування заходу' : 'Створення нового заходу'}</h1>
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
                            setFormData(prev => ({ ...prev, image_url: '' }));
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
                      disabled={uploadingImage}
                    >
                      {uploadingImage ? (
                        <><FaSpinner className="spinner" /> Завантаження...</>
                      ) : (
                        <><FaUpload /> {preview ? 'Змінити зображення' : 'Завантажити зображення'}</>
                      )}
                    </button>
                    
                    <div className="form-hint">
                      <FaInfoCircle /> Рекомендований розмір: 1200x630 пікселів
                    </div>
                  </div>
                </div>
                
                {isEditMode && (
                  <div className="announcement-form-section">
                    <h3>Прикріплені файли</h3>
                    
                    <div className="files-list">
                      {files.length > 0 ? (
                        <ul className="attached-files">
                          {files.map((file, index) => (
                            <li key={index} className="file-item">
                              <a 
                                href={file.file_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="file-link"
                              >
                                {file.file_name || `Файл ${index + 1}`}
                              </a>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="no-files">Файли не прикріплені</p>
                      )}
                    </div>
                    
                    <div className="file-upload-container">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="file-input"
                      />
                      
                      <button
                        type="button"
                        className="btn-upload"
                        onClick={handleFileUpload}
                        disabled={!newFile || uploadingFile}
                      >
                        {uploadingFile ? (
                          <><FaSpinner className="spinner" /> Завантаження...</>
                        ) : (
                          <><FaPaperclip /> Завантажити файл</>
                        )}
                      </button>
                    </div>
                  </div>
                )}
                
                <div className="form-actions">
                  <button
                    type="submit"
                    className="btn-save"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <><FaSpinner className="spinner" /> Збереження...</>
                    ) : (
                      <><FaSave /> {isEditMode ? 'Зберегти зміни' : 'Створити'}</>
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

export default TeacherAnnouncementForm;