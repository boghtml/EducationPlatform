import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../../api';
import TeacherHeader from './TeacherHeader';
import TeacherSidebar from './TeacherSidebar';
import '../../css/teacher/TeacherCreateModule.css';

import { 
  FaBook, 
  FaInfo,
  FaSpinner, 
  FaExclamationTriangle,
  FaArrowLeft,
  FaCheck,
  FaSave,
  FaPlus,
  FaTimes
} from 'react-icons/fa';

function TeacherCreateModule() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    course_id: null
  });
  const [errors, setErrors] = useState({});
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [createdModuleId, setCreatedModuleId] = useState(null);
  const { courseId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const userRole = sessionStorage.getItem('userRole');
    
    if (userRole !== 'teacher') {
      navigate('/login');
      return;
    }

    const fetchCourse = async () => {
      try {
        setLoading(true);
        
        // Отримуємо CSRF токен
        await axios.get(`${API_URL}/get-csrf-token/`, { withCredentials: true });
        
        // Отримуємо дані курсу
        const courseResponse = await axios.get(`${API_URL}/courses/${courseId}/`, {
          withCredentials: true
        });
        
        if (courseResponse.data) {
          setCourse(courseResponse.data);
          
          // Встановлюємо ID курсу у формі
          setFormData(prev => ({
            ...prev,
            course_id: parseInt(courseId)
          }));
        } else {
          setErrors({
            general: 'Не вдалося отримати дані курсу'
          });
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching course:", error);
        setErrors({
          general: 'Не вдалося отримати дані курсу'
        });
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Очищаємо помилку при зміні поля
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Назва модуля обов\'язкова';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Опис модуля обов\'язковий';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Отримуємо CSRF токен
      await axios.get(`${API_URL}/get-csrf-token/`, { withCredentials: true });
      
      // Створюємо новий модуль
      const moduleResponse = await axios.post(`${API_URL}/modules/create/`, formData, {
        withCredentials: true
      });
      
      if (moduleResponse.data && moduleResponse.data.id) {
        setCreatedModuleId(moduleResponse.data.id);
        setSuccess(true);
        
        // Перенаправляємо на сторінку курсу через 2 секунди
        setTimeout(() => {
          navigate(`/teacher/courses/${courseId}`);
        }, 2000);
      } else {
        throw new Error('Не вдалося створити модуль');
      }
    } catch (error) {
      console.error("Error creating module:", error);
      
      // Обробляємо помилки відповіді API
      if (error.response && error.response.data) {
        setErrors(prev => ({
          ...prev,
          submit: error.response.data.message || 'Помилка при створенні модуля. Спробуйте знову.'
        }));
      } else {
        setErrors(prev => ({
          ...prev,
          submit: 'Помилка при створенні модуля. Спробуйте знову.'
        }));
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(`/teacher/courses/${courseId}`);
  };

  if (loading) {
    return (
      <div className="teacher-create-module-wrapper">
        <TeacherHeader />
        
        <div className="teacher-create-module-container">
          <TeacherSidebar />
          
          <div className="teacher-create-module-content">
            <div className="loading-container">
              <FaSpinner className="spinner" />
              <p>Завантаження даних курсу...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (errors.general) {
    return (
      <div className="teacher-create-module-wrapper">
        <TeacherHeader />
        
        <div className="teacher-create-module-container">
          <TeacherSidebar />
          
          <div className="teacher-create-module-content">
            <div className="error-container">
              <FaExclamationTriangle className="error-icon" />
              <h2>Помилка</h2>
              <p>{errors.general}</p>
              <button 
                className="btn-primary"
                onClick={() => navigate(`/teacher/courses`)}
              >
                Повернутися до списку курсів
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="teacher-create-module-wrapper">
      <TeacherHeader />
      
      <div className="teacher-create-module-container">
        <TeacherSidebar />
        
        <div className="teacher-create-module-content">
          {success ? (
            <div className="success-container">
              <div className="success-icon">
                <FaCheck />
              </div>
              <h2>Модуль успішно створено!</h2>
              <p>Ви будете перенаправлені на сторінку курсу через кілька секунд...</p>
            </div>
          ) : (
            <>
              <div className="create-module-header">
                <button 
                  className="btn-back"
                  onClick={handleCancel}
                >
                  <FaArrowLeft /> До курсу
                </button>
                <h1>Новий модуль для курсу "{course?.title}"</h1>
              </div>
              
              <div className="create-module-form-container">
                <form onSubmit={handleSubmit} className="create-module-form">
                  <div className="form-group">
                    <label htmlFor="title">
                      <FaBook className="form-icon" />
                      Назва модуля <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className={`form-control ${errors.title ? 'is-invalid' : ''}`}
                      placeholder="Введіть назву модуля"
                      required
                    />
                    {errors.title && <div className="invalid-feedback">{errors.title}</div>}
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="description">
                      <FaInfo className="form-icon" />
                      Опис модуля <span className="required">*</span>
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                      placeholder="Введіть опис модуля"
                      rows="5"
                      required
                    ></textarea>
                    {errors.description && <div className="invalid-feedback">{errors.description}</div>}
                  </div>
                  
                  <div className="form-actions">
                    <button 
                      type="button" 
                      className="btn-secondary"
                      onClick={handleCancel}
                    >
                      <FaTimes /> Скасувати
                    </button>
                    
                    <button 
                      type="submit" 
                      className="btn-primary"
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <FaSpinner className="spinner-button" /> Створення...
                        </>
                      ) : (
                        <>
                          <FaSave /> Створити модуль
                        </>
                      )}
                    </button>
                  </div>
                  
                  {errors.submit && (
                    <div className="error-message">
                      <FaExclamationTriangle /> {errors.submit}
                    </div>
                  )}
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default TeacherCreateModule;