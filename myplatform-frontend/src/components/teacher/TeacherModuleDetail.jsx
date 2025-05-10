import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../../api';
import TeacherHeader from './TeacherHeader';
import TeacherSidebar from './TeacherSidebar';
import '../../css/teacher/TeacherModuleDetail.css';
import { 
  FaArrowLeft, 
  FaEdit, 
  FaTrash, 
  FaPlus,
  FaSpinner,
  FaExclamationTriangle,
  FaBook,
  FaClock,
  FaGraduationCap
} from 'react-icons/fa';

function TeacherModuleDetail() {
  const [module, setModule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
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
        
        const response = await axios.get(`${API_URL}/modules/detail/${moduleId}/`, {
          withCredentials: true
        });
        
        if (response.data) {
          setModule(response.data);
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching module details:", error);
        setLoading(false);
        setError('Не вдалося завантажити дані модуля');
      }
    };

    fetchModuleDetails();
  }, [moduleId, navigate]);

  const handleEdit = () => {
    navigate(`/teacher/modules/${moduleId}/edit`);
  };

  const handleCreateLesson = () => {
    navigate(`/teacher/modules/${moduleId}/create-lesson`);
  };

  const handleDeleteModule = async () => {
    try {
      const courseId = module.course; // Store courseId before deletion
      await axios.get(`${API_URL}/get-csrf-token/`, { withCredentials: true });
      
      await axios.delete(`${API_URL}/modules/delete/${moduleId}/`, {
        withCredentials: true
      });
      
      navigate(`/teacher/courses/${courseId}`);
    } catch (error) {
      console.error("Error deleting module:", error);
      setError('Не вдалося видалити модуль');
    }
  };

  const handleLessonClick = (lessonId) => {
    navigate(`/teacher/lessons/${lessonId}`);
  };

  const handleDeleteLesson = async (lessonId) => {
    try {
      await axios.get(`${API_URL}/get-csrf-token/`, { withCredentials: true });
      
      await axios.delete(`${API_URL}/lessons/lesson/delete/${lessonId}/`, {
        withCredentials: true
      });

      // Update the lessons list in the module state
      setModule(prev => ({
        ...prev,
        lessons: prev.lessons.filter(lesson => lesson.id !== lessonId)
      }));
    } catch (error) {
      console.error("Error deleting lesson:", error);
      setError('Не вдалося видалити урок');
    }
  };

  const handleEditLesson = (lessonId) => {
    navigate(`/teacher/lessons/${lessonId}/edit`);
  };

  if (loading) {
    return (
      <div className="teacher-module-detail-wrapper">
        <TeacherHeader />
        <div className="teacher-module-detail-container">
          <TeacherSidebar />
          <div className="teacher-module-detail-content">
            <div className="loading-container">
              <FaSpinner className="spinner" />
              <p>Завантаження даних модуля...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="teacher-module-detail-wrapper">
        <TeacherHeader />
        <div className="teacher-module-detail-container">
          <TeacherSidebar />
          <div className="teacher-module-detail-content">
            <div className="error-container">
              <FaExclamationTriangle className="error-icon" />
              <h2>Помилка</h2>
              <p>{error}</p>
              <button 
                className="btn-primary"
                onClick={() => navigate('/teacher/courses')}
              >
                Повернутися до списку курсів
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!module) {
    return (
      <div className="teacher-module-detail-wrapper">
        <TeacherHeader />
        <div className="teacher-module-detail-container">
          <TeacherSidebar />
          <div className="teacher-module-detail-content">
            <div className="error-container">
              <FaExclamationTriangle className="error-icon" />
              <h2>Модуль не знайдено</h2>
              <p>Запитаний модуль не існує або ви не маєте до нього доступу.</p>
              <button 
                className="btn-primary"
                onClick={() => navigate('/teacher/courses')}
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
    <div className="teacher-module-detail-wrapper">
      <TeacherHeader />
      <div className="teacher-module-detail-container">
        <TeacherSidebar />
        <div className="teacher-module-detail-content">
          <div className="module-detail-header">
            <button 
              className="btn-back"
              onClick={() => navigate(`/teacher/courses/${module.course}`)}
            >
              <FaArrowLeft /> До курсу
            </button>
            
            <div className="module-actions">
              <button 
                className="btn-edit"
                onClick={handleEdit}
              >
                <FaEdit /> Редагувати модуль
              </button>
              <button 
                className="btn-delete"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <FaTrash /> Видалити модуль
              </button>
              <button 
                className="btn-create"
                onClick={handleCreateLesson}
              >
                <FaPlus /> Додати урок
              </button>
            </div>
          </div>

          <div className="module-detail-content">
            <h1>{module.title}</h1>
            
            <div className="module-info">
              <div className="info-item">
                <FaBook className="icon" />
                <span className="label">Опис:</span>
                <p>{module.description}</p>
              </div>
              
              {module.lessons && module.lessons.length > 0 ? (
                <div className="module-lessons">
                  <h2>Уроки модуля</h2>
                  <div className="lessons-list">
                    {module.lessons.map(lesson => (
                      <div 
                        key={lesson.id} 
                        className="lesson-item"
                        onClick={() => handleLessonClick(lesson.id)}
                      >
                        <div className="lesson-info">
                          <h3>{lesson.title}</h3>
                          <div className="lesson-meta">
                            <span className="duration">
                              <FaClock /> {lesson.duration} хв
                            </span>
                            <span className="students-completed">
                              <FaGraduationCap /> {lesson.students_completed || 0} студентів завершили
                            </span>
                          </div>
                          <div className="lesson-actions">
                            <button 
                              className="btn-edit"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditLesson(lesson.id);
                              }}
                              title="Редагувати урок"
                            >
                              <FaEdit />
                            </button>
                            <button 
                              className="btn-delete"
                              onClick={(e) => {
                                e.stopPropagation();
                                if(window.confirm('Ви впевнені, що хочете видалити цей урок?')) {
                                  handleDeleteLesson(lesson.id);
                                }
                              }}
                              title="Видалити урок"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </div>
                        <FaArrowLeft className="icon-right" />
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="no-lessons">
                  <p>У цьому модулі поки немає уроків</p>
                  <button 
                    className="btn-create"
                    onClick={handleCreateLesson}
                  >
                    <FaPlus /> Створити перший урок
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="delete-confirmation-modal">
          <div className="delete-confirmation-content">
            <h2>Видалити модуль?</h2>
            <p>
              Ви впевнені, що хочете видалити цей модуль? 
              Всі уроки та матеріали модуля також будуть видалені. 
              Цю дію не можна буде скасувати.
            </p>
            
            <div className="delete-confirmation-actions">
              <button 
                className="btn-cancel"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Скасувати
              </button>
              <button 
                className="btn-delete"
                onClick={handleDeleteModule}
              >
                Видалити модуль
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TeacherModuleDetail;