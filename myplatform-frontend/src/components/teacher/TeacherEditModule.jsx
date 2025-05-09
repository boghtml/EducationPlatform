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
  FaArrowLeft,
  FaSpinner,
  FaExclamationTriangle,
  FaCheck
} from 'react-icons/fa';

function TeacherEditModule() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    course_id: null
  });
  const [errors, setErrors] = useState({});
  const [module, setModule] = useState(null);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const { moduleId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const userRole = sessionStorage.getItem('userRole');
    if (userRole !== 'teacher') {
      navigate('/login');
      return;
    }

    const fetchModuleDetails = async () => {
      try {
        setLoading(true);
        
        await axios.get(`${API_URL}/get-csrf-token/`, { withCredentials: true });
        
        // Change from /modules/update/ to /modules/detail/
        const moduleResponse = await axios.get(`${API_URL}/modules/detail/${moduleId}/`, {
          withCredentials: true
        });
        
        if (moduleResponse.data) {
          const moduleData = moduleResponse.data;
          setModule(moduleData);
          setFormData({
            title: moduleData.title,
            description: moduleData.description,
            course_id: moduleData.course
          });
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching module data:", error);
        setLoading(false);
        setErrors({
          general: 'Не вдалося завантажити дані модуля'
        });
      }
    };

    fetchModuleDetails();
  }, [moduleId, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
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
      await axios.get(`${API_URL}/get-csrf-token/`, { withCredentials: true });
      
      // Update module with correct endpoint
      await axios.put(`${API_URL}/modules/update/${moduleId}/`, formData, {
        withCredentials: true
      });
      
      setSuccess(true);
      setTimeout(() => {
        navigate(`/teacher/courses/${formData.course_id}`);
      }, 2000);
      
    } catch (error) {
      console.error("Error updating module:", error);
      setErrors(prev => ({
        ...prev,
        submit: 'Не вдалося оновити модуль. Будь ласка, спробуйте пізніше.'
      }));
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(`/teacher/courses/${formData.course_id}`);
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
              <p>Завантаження даних модуля...</p>
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

  if (success) {
    return (
      <div className="teacher-create-module-wrapper">
        <TeacherHeader />
        <div className="teacher-create-module-container">
          <TeacherSidebar />
          <div className="teacher-create-module-content">
            <div className="success-container">
              <div className="success-icon">
                <FaCheck />
              </div>
              <h2>Модуль успішно оновлено!</h2>
              <p>Ви будете перенаправлені на сторінку курсу через кілька секунд...</p>
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
          <div className="create-module-header">
            <button 
              className="btn-back"
              onClick={handleCancel}
            >
              <FaArrowLeft /> До курсу
            </button>
            <h1>Редагування модуля для курсу "{course?.title}"</h1>
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
                  placeholder="Введіть детальний опис модуля"
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
                  Скасувати
                </button>
                <button 
                  type="submit" 
                  className="btn-primary"
                  disabled={submitting}
                >
                  {submitting ? 'Збереження...' : 'Зберегти зміни'}
                </button>
              </div>
              
              {errors.submit && (
                <div className="submit-error">
                  <FaExclamationTriangle /> {errors.submit}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TeacherEditModule;