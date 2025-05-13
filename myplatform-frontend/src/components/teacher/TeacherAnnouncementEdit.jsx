// src/components/teacher/TeacherAnnouncementEdit.jsx

import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  FaCheck,
  FaFilePdf,
  FaFileWord,
  FaFileImage,
  FaFileVideo,
  FaFile,
  FaPlus,
  FaTimes
} from 'react-icons/fa';
import '../../css/teacher/TeacherAnnouncementEdit.css';

// Налаштування axios для CSRF
axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.xsrfHeaderName = 'X-CSRFToken';
axios.defaults.withCredentials = true;

// Компоненти для поліпшення структури
const LoadingSpinner = ({ text = "Завантаження..." }) => (
  <div className="loading-container">
    <FaSpinner className="spinner" />
    <p>{text}</p>
  </div>
);

const ErrorMessage = ({ message }) => (
  <div className="error-message">
    <FaExclamationTriangle className="error-icon" /> {message}
  </div>
);

const SuccessMessage = ({ message }) => (
  <div className="success-message">
    <FaCheck className="success-icon" /> {message}
  </div>
);

const FileTypeIcon = ({ fileType }) => {
  switch(fileType?.toLowerCase()) {
    case 'pdf': return <FaFilePdf className="file-type-icon pdf" />;
    case 'doc':
    case 'docx': return <FaFileWord className="file-type-icon doc" />;
    case 'jpg':
    case 'jpeg': 
    case 'png': return <FaFileImage className="file-type-icon image" />;
    case 'mp4':
    case 'avi':
    case 'mov': return <FaFileVideo className="file-type-icon video" />;
    default: return <FaFile className="file-type-icon default" />;
  }
};

const INITIAL_FORM_STATE = {
  title: '',
  description: '',
  content: '',
  event_type: 'event',
  status: 'published',
  start_date: '',
  end_date: '',
  location: '',
  image_url: ''
};

function TeacherAnnouncementEdit() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [preview, setPreview] = useState('');
  const [files, setFiles] = useState([]);
  const [newFile, setNewFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [deletingFile, setDeletingFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [confirmationDialog, setConfirmationDialog] = useState({ show: false, fileId: null });
  
  const imageInputRef = useRef(null);
  const fileInputRef = useRef(null);

  // Helper function for getting CSRF token
  const getCsrfToken = async () => {
    try {
      const response = await axios.get(`${API_URL}/get-csrf-token/`, { withCredentials: true });
      axios.defaults.headers.common['X-CSRFToken'] = response.data.csrftoken;
      return response.data.csrftoken;
    } catch (error) {
      console.error("Failed to get CSRF token:", error);
      setError("Помилка автентифікації. Спробуйте перезавантажити сторінку.");
      return null;
    }
  };
  
  // Показує повідомлення про успіх і автоматично його прибирає
  const showSuccessMessage = useCallback((message) => {
    setSuccessMessage(message);
    setError(null);
    
    setTimeout(() => {
      setSuccessMessage('');
    }, 3000);
  }, []);
  
  // Функція для обробки помилок
  const handleError = useCallback((error, defaultMessage) => {
    console.error(defaultMessage, error);
    
    if (error.response) {
      console.error("Error status:", error.response.status);
      console.error("Error data:", error.response.data);
      setError(`${defaultMessage}: ${JSON.stringify(error.response.data)}`);
    } else if (error.request) {
      console.error("No response received:", error.request);
      setError(`${defaultMessage}: сервер не відповідає`);
    } else {
      console.error("Error message:", error.message);
      setError(defaultMessage);
    }
  }, []);
  
  // Перевірка автентифікації користувача та завантаження даних заходу
  useEffect(() => {
    const userRole = sessionStorage.getItem('userRole');
    if (userRole !== 'teacher' && userRole !== 'admin') {
      navigate('/login');
      return;
    }
    
    const fetchEventData = async () => {
      try {
        setLoading(true);
        
        // Отримання CSRF-токену
        await getCsrfToken();
        
        console.log(`Fetching event data for ID: ${eventId}`);
        const response = await axios.get(`${API_URL}/events/events/${eventId}/`, { withCredentials: true });
        
        console.log("Event data received:", response.data);
        
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
      } catch (error) {
        handleError(error, "Не вдалося завантажити дані про захід");
      } finally {
        setLoading(false);
      }
    };
    
    fetchEventData();
  }, [eventId, navigate, handleError]);
  
  // Обробка змін у формі
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Обробка вибору зображення
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    console.log("Selected image file:", file.name, file.type, file.size);
    
    // Валідація розміру файлу
    if (file.size > 5 * 1024 * 1024) { // 5MB
      setError("Зображення занадто велике. Максимальний розмір: 5MB");
      return;
    }
    
    // Валідація типу файлу
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError("Непідтримуваний формат зображення. Використовуйте JPEG, PNG або GIF.");
      return;
    }
    
    // Створюємо превью для відображення 
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
    
    // Відразу завантажуємо зображення
    handleImageUpload(file);
  };
  
  // Завантаження зображення на сервер
  const handleImageUpload = async (file) => {
    try {
      setUploadingImage(true);
      setError(null);
      
      // Отримання CSRF-токену перед завантаженням зображення
      await getCsrfToken();
      
      const imageFormData = new FormData();
      imageFormData.append('image', file);
      
      console.log(`Uploading image for event: ${eventId}`);
      
      const response = await axios.post(
        `${API_URL}/events/events/${eventId}/upload_image/`, 
        imageFormData, 
        {
          withCredentials: true,
          headers: { 'Content-Type': 'multipart/form-data' }
        }
      );
      
      console.log("Image upload response:", response.data);
      
      if (response.data && response.data.image_url) {
        setFormData(prev => ({ ...prev, image_url: response.data.image_url }));
        setPreview(response.data.image_url);
        showSuccessMessage("Зображення успішно завантажено");
      }
    } catch (error) {
      handleError(error, "Не вдалося завантажити зображення");
      setPreview(''); // Скидаємо превью у разі помилки
    } finally {
      setUploadingImage(false);
    }
  };
  
  // Обробка вибору файлу
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Валідація розміру файлу
    if (file.size > 50 * 1024 * 1024) { // 50MB
      setError("Файл занадто великий. Максимальний розмір: 50MB");
      return;
    }
    
    setNewFile(file);
    // Автоматично завантажуємо файл після вибору
    handleFileUpload(file);
  };
  
  // Завантаження файлу на сервер
  const handleFileUpload = async (file) => {
    const fileToUpload = file || newFile;
    if (!fileToUpload) return;

    try {
      setUploadingFile(true);
      setError(null);
      setUploadProgress(0);
      
      // Отримання CSRF-токену перед завантаженням файлу
      await getCsrfToken();
      
      const fileFormData = new FormData();
      fileFormData.append('file', fileToUpload);
      
      console.log(`Uploading file for event: ${eventId}, File: ${fileToUpload.name}`);
      
      const response = await axios.post(
        `${API_URL}/events/events/${eventId}/upload_file/`, 
        fileFormData,
        {
          withCredentials: true,
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percentCompleted);
          }
        }
      );
      
      console.log("File upload response:", response.data);
      
      if (response.data && response.data.file) {
        setFiles(prev => [...prev, response.data.file]);
        showSuccessMessage("Файл успішно завантажено");
      }
    } catch (error) {
      handleError(error, "Не вдалося завантажити файл");
    } finally {
      setUploadingFile(false);
      setNewFile(null);
      setUploadProgress(0);
      
      if (fileInputRef.current) {
        fileInputRef.current.value = null;
      }
    }
  };

  // Підтвердження видалення файлу
  const confirmFileDelete = (fileId) => {
    setConfirmationDialog({ show: true, fileId });
  };
  
  // Закриття діалогу підтвердження
  const closeConfirmationDialog = () => {
    setConfirmationDialog({ show: false, fileId: null });
  };

  // Видалення файлу з сервера
  const handleFileDelete = async (fileId) => {
    closeConfirmationDialog();
    setDeletingFile(fileId);
    
    try {
      await getCsrfToken();
      
      await axios.delete(`${API_URL}/events/events/${eventId}/files/${fileId}/`, {
        withCredentials: true
      });
      
      setFiles(prev => prev.filter(file => file.id !== fileId));
      showSuccessMessage("Файл успішно видалено");
    } catch (error) {
      handleError(error, "Не вдалося видалити файл");
    } finally {
      setDeletingFile(null);
    }
  };
  
  // Відправка форми на сервер
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      setError(null);
      
      // Валідація форми
      if (!formData.title.trim()) {
        setError("Назва заходу є обов'язковою");
        setSubmitting(false);
        return;
      }

      if (!formData.description.trim()) {
        setError("Опис заходу є обов'язковим");
        setSubmitting(false);
        return;
      }
      
      // Перевірка дат для типу "event"
      if (formData.event_type === 'event') {
        if (formData.start_date && formData.end_date) {
          const startDate = new Date(formData.start_date);
          const endDate = new Date(formData.end_date);
          
          if (endDate < startDate) {
            setError("Дата завершення не може бути раніше за дату початку");
            setSubmitting(false);
            return;
          }
        }
      }
      
      // Отримання CSRF-токену перед оновленням заходу
      await getCsrfToken();
      
      console.log("Updating event with ID:", eventId, "Data:", formData);
      
      const response = await axios.put(`${API_URL}/events/events/${eventId}/`, formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'application/json' }
      });
      
      console.log("Update response:", response.data);
      
      showSuccessMessage("Захід успішно оновлено");
      
      // Переходимо на сторінку списку заходів
      setTimeout(() => {
        navigate('/teacher/announcements');
      }, 1500);
    } catch (error) {
      handleError(error, "Не вдалося оновити захід");
      setSubmitting(false);
    }
  };
  
  // Форматування розміру файлу
  const formatFileSize = (sizeInBytes) => {
    if (!sizeInBytes) return 'Невідомо';
    
    const kb = sizeInBytes / 1024;
    if (kb < 1024) {
      return `${Math.round(kb)} KB`;
    }
    
    const mb = kb / 1024;
    return `${mb.toFixed(2)} MB`;
  };
  
  // Отримання розширення файлу
  const getFileExtension = (fileName) => {
    if (!fileName) return 'unknown';
    return fileName.split('.').pop().toLowerCase();
  };
  
  // Повернення відповідної іконки для типу файлу
  const getFileIcon = (fileName) => {
    const extension = getFileExtension(fileName);
    
    switch(extension) {
      case 'pdf': return <FaFilePdf className="file-icon pdf" />;
      case 'doc':
      case 'docx': return <FaFileWord className="file-icon doc" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif': return <FaFileImage className="file-icon image" />;
      case 'mp4':
      case 'avi':
      case 'mov': return <FaFileVideo className="file-icon video" />;
      default: return <FaFile className="file-icon default" />;
    }
  };
  
  // Відображення завантаження
  if (loading) {
    return (
      <div className="announcement-edit-wrapper">
        <TeacherHeader />
        <div className="announcement-edit-container">
          <TeacherSidebar />
          <div className="announcement-edit-loading">
            <LoadingSpinner text="Завантаження даних..." />
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="announcement-edit-wrapper">
      <TeacherHeader />
      
      <div className="announcement-edit-container">
        <TeacherSidebar />
        
        <div className="announcement-edit-content">
          <div className="announcement-edit-header">
            <Link to="/teacher/announcements" className="back-link">
              <FaArrowLeft /> Назад до списку
            </Link>
            <h1>Редагування заходу</h1>
          </div>
          
          {error && <ErrorMessage message={error} />}
          {successMessage && <SuccessMessage message={successMessage} />}
          
          <form onSubmit={handleSubmit} className="edit-form">
            <div className="form-layout">
              <div className="form-main">
                <div className="input-group">
                  <label htmlFor="title">Назва *</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="text-input"
                    placeholder="Введіть назву заходу"
                  />
                </div>
                
                <div className="input-group">
                  <label htmlFor="description">Короткий опис *</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    className="text-input"
                    rows="3"
                    placeholder="Введіть короткий опис заходу"
                  ></textarea>
                </div>
                
                <div className="input-group">
                  <label htmlFor="content">Повний текст</label>
                  <textarea
                    id="content"
                    name="content"
                    value={formData.content}
                    onChange={handleChange}
                    className="text-input"
                    rows="10"
                    placeholder="Детальний опис заходу. Можете використовувати HTML-теги для форматування."
                  ></textarea>
                  <small className="form-hint">Підтримується форматування HTML.</small>
                </div>
                
                <div className="input-row">
                  <div className="input-group">
                    <label htmlFor="event_type">Тип публікації *</label>
                    <select
                      id="event_type"
                      name="event_type"
                      value={formData.event_type}
                      onChange={handleChange}
                      required
                      className="select-input"
                    >
                      <option value="event">Захід</option>
                      <option value="news">Новина</option>
                      <option value="announcement">Оголошення</option>
                    </select>
                  </div>
                  
                  <div className="input-group">
                    <label htmlFor="status">Статус *</label>
                    <select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      required
                      className="select-input"
                    >
                      <option value="published">Опубліковано</option>
                      <option value="draft">Чернетка</option>
                      <option value="archived">Архів</option>
                    </select>
                  </div>
                </div>
                
                {formData.event_type === 'event' && (
                  <>
                    <div className="input-row">
                      <div className="input-group">
                        <label htmlFor="start_date">Дата початку</label>
                        <input
                          type="datetime-local"
                          id="start_date"
                          name="start_date"
                          value={formData.start_date}
                          onChange={handleChange}
                          className="date-input"
                        />
                      </div>
                      
                      <div className="input-group">
                        <label htmlFor="end_date">Дата завершення</label>
                        <input
                          type="datetime-local"
                          id="end_date"
                          name="end_date"
                          value={formData.end_date}
                          onChange={handleChange}
                          className="date-input"
                        />
                      </div>
                    </div>
                    
                    <div className="input-group">
                      <label htmlFor="location">Місце проведення</label>
                      <input
                        type="text"
                        id="location"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        className="text-input"
                        placeholder="Введіть місце проведення заходу"
                      />
                    </div>
                  </>
                )}
              </div>
              
              <div className="form-sidebar">
                <div className="sidebar-section">
                  <h3>Головне зображення</h3>
                  <div className="upload-container">
                    {preview ? (
                      <div className="preview-wrapper">
                        <img 
                          src={preview} 
                          alt="Попередній перегляд зображення" 
                          className="preview-image" 
                          onError={(e) => {e.target.src = 'https://via.placeholder.com/300x200?text=Попередній+перегляд'}}
                        />
                        <button 
                          type="button" 
                          className="delete-button"
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
                        className="upload-placeholder"
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
                      className="upload-button"
                      onClick={() => imageInputRef.current.click()}
                      disabled={uploadingImage}
                    >
                      {uploadingImage ? (
                        <><FaSpinner className="spinner" /> Завантаження...</>
                      ) : (
                        <><FaUpload /> {preview ? 'Змінити зображення' : 'Завантажити зображення'}</>
                      )}
                    </button>
                    
                    <div className="upload-hint">
                      <FaInfoCircle /> Рекомендований розмір: 1200x630 пікселів
                    </div>
                  </div>
                </div>
                
                <div className="files-section">
                  <h3>Прикріплені файли</h3>
                  
                  <div className="files-list">
                    {files.length > 0 ? (
                      files.map((file, index) => (
                        <div key={file.id || index} className="file-item">
                          <div className="file-info">
                            {getFileIcon(file.file_name)}
                            <div className="file-details">
                              <div className="file-name">{file.file_name || `Файл ${index + 1}`}</div>
                              {file.file_size && <div className="file-size">{formatFileSize(file.file_size)}</div>}
                            </div>
                          </div>
                          <div className="file-actions">
                            <a 
                              href={file.file_url} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="file-action-btn download"
                              title="Завантажити"
                            >
                              <FaUpload />
                            </a>
                            <button 
                              type="button"
                              className="file-action-btn delete"
                              onClick={() => confirmFileDelete(file.id)}
                              disabled={deletingFile === file.id}
                              title="Видалити"
                            >
                              {deletingFile === file.id ? <FaSpinner className="spinner" /> : <FaTrash />}
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="no-files">
                        <div className="no-files-icon">
                          <FaPaperclip />
                        </div>
                        <p className="no-files-text">Немає прикріплених файлів</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="file-upload-container">
                    <div className="file-upload-input-wrapper">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="file-input"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.mp4,.avi,.mov"
                      />
                      <button
                        type="button"
                        className="file-select-btn"
                        onClick={() => fileInputRef.current.click()}
                        disabled={uploadingFile}
                      >
                        {uploadingFile ? (
                          <><FaSpinner className="spinner" /> Завантаження файлу...</>
                        ) : (
                          <><FaPaperclip /> Обрати файл</>
                        )}
                      </button>
                    </div>
                    
                    {uploadingFile && (
                      <div className="progress-bar-container">
                        <div 
                          className="progress-bar" 
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                        <div className="progress-info">
                          <span>{uploadProgress}%</span>
                        </div>
                      </div>
                    )}
                    
                    <div className="file-upload-hint">
                      <FaInfoCircle /> Підтримуються формати: PDF, DOC, DOCX, JPG, PNG, MP4, AVI. Максимальний розмір: 50MB
                    </div>
                  </div>
                </div>
                
                <div className="action-buttons">
                  <button
                    type="submit"
                    className="save-button"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <><FaSpinner className="spinner" /> Збереження...</>
                    ) : (
                      <><FaSave /> Зберегти зміни</>
                    )}
                  </button>
                  
                  <Link to="/teacher/announcements" className="cancel-button">
                    Скасувати
                  </Link>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
      
      {/* Діалог підтвердження видалення файлу */}
      {confirmationDialog.show && (
        <div className="confirmation-dialog">
          <div className="confirmation-content">
            <div className="confirmation-header">
              <h4 className="confirmation-title">Підтвердження видалення</h4>
              <button 
                className="close-button" 
                onClick={closeConfirmationDialog}
              >
                <FaTimes />
              </button>
            </div>
            <p className="confirmation-message">
              Ви впевнені, що хочете видалити цей файл? Ця дія не може бути скасована.
            </p>
            <div className="confirmation-actions">
              <button 
                className="confirmation-btn cancel" 
                onClick={closeConfirmationDialog}
              >
                Скасувати
              </button>
              <button 
                className="confirmation-btn delete" 
                onClick={() => handleFileDelete(confirmationDialog.fileId)}
              >
                Видалити
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TeacherAnnouncementEdit