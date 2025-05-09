import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../../api';
import TeacherHeader from './TeacherHeader';
import TeacherSidebar from './TeacherSidebar';
import { 
  FaArrowLeft,
  FaEdit,
  FaPlus,
  FaSpinner,
  FaExclamationTriangle,
  FaClock,
  FaUsers,
  FaCalendarAlt,
  FaTrash,
  FaBookOpen,
  FaArrowRight,
  FaGraduationCap
} from 'react-icons/fa';
import '../../css/teacher/TeacherCourseDetail.css';

function TeacherCourseDetail() {
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const navigate = useNavigate();
  const { courseId } = useParams();

  useEffect(() => {
    const userRole = sessionStorage.getItem('userRole');
    if (userRole !== 'teacher') {
      navigate('/login');
      return;
    }

    const fetchCourseDetails = async () => {
      try {
        setLoading(true);
        await axios.get(`${API_URL}/get-csrf-token/`, { withCredentials: true });
        
        const courseResponse = await axios.get(`${API_URL}/courses/${courseId}/`, {
          withCredentials: true
        });
        
        if (courseResponse.data) {
          setCourse(courseResponse.data);
        }

        const modulesResponse = await axios.get(`${API_URL}/modules/get_modules/${courseId}/`, {
          withCredentials: true
        });
        
        if (modulesResponse.data) {
          setModules(modulesResponse.data);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching course details:", error);
        setError("Не вдалося завантажити деталі курсу.");
        setLoading(false);
      }
    };

    fetchCourseDetails();
  }, [courseId, navigate]);

  const formatDate = (dateString) => {
    if (!dateString) return 'Не вказано';
    return new Date(dateString).toLocaleDateString('uk-UA', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const handleEditCourse = () => {
    navigate(`/teacher/courses/${courseId}/edit`);
  };

  const handleCreateModule = () => {
    navigate(`/teacher/courses/${courseId}/create-module`);
  };

  const handleCreateLesson = (moduleId) => {
    navigate(`/teacher/modules/${moduleId}/create-lesson`);
  };

  const handleEditModule = (moduleId) => {
    navigate(`/teacher/modules/${moduleId}/edit`);
  };

  const handleDeleteModule = async (moduleId) => {
    try {
      await axios.get(`${API_URL}/get-csrf-token/`, { withCredentials: true });
      
      // Use correct endpoint for deletion
      await axios.delete(`${API_URL}/modules/delete/${moduleId}/`, {
        withCredentials: true
      });
      
      // Remove module from state
      setModules(prevModules => prevModules.filter(module => module.id !== moduleId));
      setConfirmDelete(null);
      
    } catch (error) {
      console.error("Error deleting module:", error);
      setError("Не вдалося видалити модуль. Будь ласка, спробуйте пізніше.");
    }
  };

  const handleModuleClick = (moduleId) => {
    navigate(`/teacher/modules/${moduleId}`);
  };

  if (loading) {
    return (
      <div className="teacher-course-detail-wrapper">
        <TeacherHeader />
        <div className="teacher-course-detail-container">
          <TeacherSidebar />
          <div className="teacher-course-detail-loading">
            <FaSpinner className="loading-spinner" />
            <p>Завантаження даних курсу...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="teacher-course-detail-wrapper">
        <TeacherHeader />
        <div className="teacher-course-detail-container">
          <TeacherSidebar />
          <div className="teacher-course-detail-error">
            <FaExclamationTriangle />
            <h3>Помилка завантаження</h3>
            <p>{error}</p>
            <button className="btn-primary" onClick={() => window.location.reload()}>
              Спробувати знову
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="teacher-course-detail-wrapper">
        <TeacherHeader />
        <div className="teacher-course-detail-container">
          <TeacherSidebar />
          <div className="teacher-course-detail-error">
            <FaExclamationTriangle />
            <h3>Курс не знайдено</h3>
            <p>Запитаний курс не існує або ви не маєте до нього доступу.</p>
            <button className="btn-primary" onClick={() => navigate('/teacher/courses')}>
              Повернутися до списку курсів
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="teacher-course-detail-wrapper">
      <TeacherHeader />
      <div className="teacher-course-detail-container">
        <TeacherSidebar />
        <div className="teacher-course-detail-content">
          <div className="course-detail-header">
            <button className="btn-back" onClick={() => navigate('/teacher/courses')}>
              <FaArrowLeft /> Назад до списку курсів
            </button>
            <h1>{course.title}</h1>
            <div className="course-detail-actions">
              <button className="btn-edit" onClick={handleEditCourse}>
                <FaEdit /> Редагувати курс
              </button>
              <button className="btn-create-module" onClick={handleCreateModule}>
                <FaPlus /> Додати модуль
              </button>
            </div>
          </div>

          <div className="course-detail-body">
            <div className="course-info-section">
              <h3>Інформація про курс</h3>
              <div className="course-info-grid">
                <div className="info-item">
                  <span className="info-label">Статус:</span>
                  <span className={`course-status ${course.status}`}>
                    {course.status === 'free' ? 'Безкоштовний' : 'Преміум'}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Студенти:</span>
                  <span><FaUsers /> {course.students_count || 0}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Початок:</span>
                  <span><FaCalendarAlt /> {formatDate(course.start_date)}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Тривалість:</span>
                  <span><FaClock /> {course.duration} тижнів</span>
                </div>
              </div>
            </div>

            <div className="course-description-section">
              <h3>Опис курсу</h3>
              <p>{course.description}</p>
            </div>

            <div className="modules-section">
              <div className="section-header">
                <h2>Модулі курсу</h2>
                <button
                  className="btn-create"
                  onClick={() => navigate(`/teacher/courses/${courseId}/create-module`)}
                >
                  <FaPlus /> Додати модуль
                </button>
              </div>
              
              {modules.length > 0 ? (
                <div className="modules-list">
                  {modules.map((module) => (
                    <div 
                      key={module.id} 
                      className="module-item"
                    >
                      <div className="module-info" onClick={() => handleModuleClick(module.id)}>
                        <h3>{module.title}</h3>
                        <p>{module.description}</p>
                        <div className="module-meta">
                          <span>
                            <FaBookOpen /> {module.lessons?.length || 0} уроків
                          </span>
                          {module.students_completed > 0 && (
                            <span>
                              <FaGraduationCap /> {module.students_completed} студентів завершили
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="module-actions">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditModule(module.id);
                          }}
                          className="action-button edit"
                          title="Редагувати модуль"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmDelete(module.id);
                          }}
                          className="action-button delete"
                          title="Видалити модуль"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-modules">
                  <p>У цьому курсі поки немає модулів</p>
                  <button 
                    className="btn-create"
                    onClick={() => navigate(`/teacher/courses/${courseId}/create-module`)}
                  >
                    <FaPlus /> Створити перший модуль
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {confirmDelete && (
        <div className="delete-confirmation-modal">
          <div className="delete-confirmation-content">
            <h2>Видалити модуль?</h2>
            <p>Ви впевнені, що хочете видалити цей модуль? Всі уроки та матеріали модуля також будуть видалені. Цю дію не можна буде скасувати.</p>
            
            <div className="delete-confirmation-actions">
              <button 
                className="btn-cancel"
                onClick={() => setConfirmDelete(null)}
              >
                Скасувати
              </button>
              <button 
                className="btn-delete"
                onClick={() => handleDeleteModule(confirmDelete)}
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

export default TeacherCourseDetail;