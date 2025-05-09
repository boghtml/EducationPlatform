import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../../api';
import TeacherSidebar from './TeacherSidebar';
import TeacherHeader from './TeacherHeader';
import '../../css/teacher/TeacherCourses.css';

import { 
  FaGraduationCap, 
  FaUsers, 
  FaCalendarAlt, 
  FaSpinner, 
  FaExclamationTriangle, 
  FaPlus,
  FaSearch,
  FaFilter,
  FaSortAmountDown,
  FaSortAmountUp,
  FaEdit,
  FaChartLine,
  FaTrash,
  FaCopy,
  FaEye,
  FaLock,
  FaClock,
  FaBook,
  FaBookOpen
} from 'react-icons/fa';

function TeacherCourses() {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [courseFilter, setCourseFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortField, setSortField] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseModules, setCourseModules] = useState([]);
  const [loadingModules, setLoadingModules] = useState(false);
  const navigate = useNavigate();
  const { courseId } = useParams();

  useEffect(() => {
    
    const userRole = sessionStorage.getItem('userRole');
    
    if (userRole !== 'teacher') {
      navigate('/login');
      return;
    }

    const fetchCourses = async () => {
      try {
        setLoading(true);
        
        await axios.get(`${API_URL}/get-csrf-token/`, { withCredentials: true });
        
        const response = await axios.get(`${API_URL}/courses/`, {
          withCredentials: true,
          params: { teacher_id: sessionStorage.getItem('userId') }
        });
        
        if (response.data) {
          setCourses(response.data);
          setFilteredCourses(response.data);
        }
        
        // Якщо є параметр courseId, завантажити деталі курсу і його модулі
        if (courseId) {
          await fetchCourseDetails(courseId);
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching courses:", error);
        setError("Не вдалося завантажити курси. Будь ласка, спробуйте пізніше.");
        setLoading(false);
      }
    };

    fetchCourses();
  }, [navigate, courseId]);

  const fetchCourseDetails = async (id) => {
    try {
      setLoadingModules(true);
      
      // Отримуємо деталі курсу
      const courseResponse = await axios.get(`${API_URL}/courses/${id}/`, {
        withCredentials: true
      });
      
      if (courseResponse.data) {
        setSelectedCourse(courseResponse.data);
      }
      
      // Отримуємо модулі курсу
      const modulesResponse = await axios.get(`${API_URL}/modules/get_modules/${id}/`, {
        withCredentials: true
      });
      
      if (modulesResponse.data) {
        setCourseModules(modulesResponse.data);
      }
      
      setLoadingModules(false);
    } catch (error) {
      console.error("Error fetching course details:", error);
      setError("Не вдалося завантажити деталі курсу.");
      setLoadingModules(false);
    }
  };

  useEffect(() => {
    if (!courses.length) return;
    
    let results = [...courses];
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(course => 
        course.title.toLowerCase().includes(query) || 
        course.description.toLowerCase().includes(query)
      );
    }
    
    if (statusFilter !== 'all') {
      results = results.filter(course => course.status === statusFilter);
    }
    
    results.sort((a, b) => {
        
      switch (sortField) {
        case 'title':
          return sortDirection === 'asc' 
            ? a.title.localeCompare(b.title) 
            : b.title.localeCompare(a.title);
        
        case 'students':
          const studentsA = a.students_count || 0;
          const studentsB = b.students_count || 0;
          return sortDirection === 'asc' 
            ? studentsA - studentsB 
            : studentsB - studentsA;
        
        case 'created_at':
        default:
          const dateA = new Date(a.created_at);
          const dateB = new Date(b.created_at);
          return sortDirection === 'asc' 
            ? dateA - dateB 
            : dateB - dateA;
      }
    });
    
    setFilteredCourses(results);
  }, [courses, searchQuery, statusFilter, sortField, sortDirection]);

  const handleSort = (field) => {
    if (sortField === field) {
        
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
        
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleCourseClick = (courseId) => {
    navigate(`/teacher/courses/${courseId}`);
  };

  const deleteCourse = async (courseId) => {
    try {
        
      await axios.get(`${API_URL}/get-csrf-token/`, { withCredentials: true });
      
      await axios.delete(`${API_URL}/courses/${courseId}/`, {
        withCredentials: true
      });
      
      setCourses(courses.filter(course => course.id !== courseId));
      setConfirmDelete(null);
      
      // Якщо видаляється поточний вибраний курс, перенаправляємо на загальну сторінку курсів
      if (selectedCourse && selectedCourse.id === courseId) {
        setSelectedCourse(null);
        navigate('/teacher/courses');
      }
      
    } catch (error) {
      console.error("Error deleting course:", error);
      setError("Не вдалося видалити курс. Будь ласка, спробуйте пізніше.");
    }
  };

  const duplicateCourse = async (courseId) => {
    try {
        
      await axios.get(`${API_URL}/get-csrf-token/`, { withCredentials: true });
      
      const courseResponse = await axios.get(`${API_URL}/courses/${courseId}/`, {
        withCredentials: true
      });
      
      const course = courseResponse.data;
      
      const duplicateCourseData = {
        title: `${course.title} (копія)`,
        description: course.description,
        status: course.status,
        price: course.price,
        start_date: course.start_date,
        end_date: course.end_date,
        duration: course.duration,
        batch_number: course.batch_number,
        category_ids: course.categories.map(cat => cat.id)
      };
      
      const response = await axios.post(`${API_URL}/courses/`, duplicateCourseData, {
        withCredentials: true
      });
      
      setCourses([...courses, response.data.course]);
      
    } catch (error) {
      console.error("Error duplicating course:", error);
      setError("Не вдалося дублювати курс. Будь ласка, спробуйте пізніше.");
    }
  };

  const handleCreateModule = (courseId) => {
    navigate(`/teacher/courses/${courseId}/create-module`);
  };

  const handleCreateLesson = (moduleId) => {
    navigate(`/teacher/modules/${moduleId}/create-lesson`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Не вказано';
    return new Date(dateString).toLocaleDateString('uk-UA', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Якщо вибрано конкретний курс, показуємо деталі цього курсу
  if (selectedCourse) {
    return (
      <div className="teacher-courses-wrapper">
        <TeacherHeader />
        
        <div className="teacher-courses-container">
          <TeacherSidebar />
          
          <div className="teacher-courses-content">
            <div className="course-details-header">
              <button 
                className="btn-back"
                onClick={() => {
                  setSelectedCourse(null);
                  navigate('/teacher/courses');
                }}
              >
                <FaArrowLeft /> Назад до списку курсів
              </button>
              
              <h1>{selectedCourse.title}</h1>
              
              <div className="course-details-actions">
                <button 
                  className="btn-edit"
                  onClick={() => handleEditCourse(selectedCourse.id)}
                >
                  <FaEdit /> Редагувати курс
                </button>
                
                <button 
                  className="btn-create-module"
                  onClick={() => handleCreateModule(selectedCourse.id)}
                >
                  <FaPlus /> Додати модуль
                </button>
              </div>
            </div>
            
            <div className="course-details-content">
              <div className="course-details-section">
                <h3>Інформація про курс</h3>
                
                <div className="course-info-grid">
                  <div className="course-info-item">
                    <span className="info-label">Статус:</span>
                    <span className={`course-status ${selectedCourse.status}`}>
                      {selectedCourse.status === 'free' ? 'Безкоштовний' : 'Преміум'}
                    </span>
                  </div>
                  
                  <div className="course-info-item">
                    <span className="info-label">Студенти:</span>
                    <span>{selectedCourse.students_count || 0}</span>
                  </div>
                  
                  <div className="course-info-item">
                    <span className="info-label">Дата початку:</span>
                    <span>{formatDate(selectedCourse.start_date)}</span>
                  </div>
                  
                  <div className="course-info-item">
                    <span className="info-label">Тривалість:</span>
                    <span>{selectedCourse.duration} тижнів</span>
                  </div>
                  
                  <div className="course-info-item">
                    <span className="info-label">Дата створення:</span>
                    <span>{formatDate(selectedCourse.created_at)}</span>
                  </div>
                  
                  <div className="course-info-item">
                    <span className="info-label">Останнє оновлення:</span>
                    <span>{formatDate(selectedCourse.updated_at)}</span>
                  </div>
                </div>
              </div>
              
              <div className="course-details-section">
                <h3>Опис курсу</h3>
                <div className="course-description">
                  {selectedCourse.description}
                </div>
              </div>
              
              <div className="course-details-section">
                <div className="section-header">
                  <h3>Модулі курсу</h3>
                  <button 
                    className="btn-add-module"
                    onClick={() => handleCreateModule(selectedCourse.id)}
                  >
                    <FaPlus /> Додати модуль
                  </button>
                </div>
                
                {loadingModules ? (
                  <div className="modules-loading">
                    <FaSpinner className="spinner" />
                    <p>Завантаження модулів...</p>
                  </div>
                ) : courseModules.length === 0 ? (
                  <div className="no-modules">
                    <p>У цього курсу поки немає модулів. Додайте перший модуль, щоб почати наповнювати курс.</p>
                    <button 
                      className="btn-create-first-module"
                      onClick={() => handleCreateModule(selectedCourse.id)}
                    >
                      <FaPlus /> Створити перший модуль
                    </button>
                  </div>
                ) : (
                  <div className="modules-list">
                    {courseModules.map(module => (
                      <div key={module.id} className="module-item">
                        <div className="module-header">
                          <h4 className="module-title">{module.title}</h4>
                          
                          <div className="module-actions">
                            <button 
                              className="module-action-btn"
                              onClick={() => handleEditModule(module.id)}
                              title="Редагувати модуль"
                            >
                              <FaEdit />
                            </button>
                            
                            <button 
                              className="module-action-btn"
                              onClick={() => handleCreateLesson(module.id)}
                              title="Додати урок"
                            >
                              <FaPlus />
                            </button>
                            
                            <button 
                              className="module-action-btn delete"
                              onClick={() => handleDeleteModule(module.id)}
                              title="Видалити модуль"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </div>
                        
                        <div className="module-content">
                          <p className="module-description">{module.description}</p>
                          
                          {module.lessons && module.lessons.length > 0 ? (
                            <div className="lessons-list">
                              <h5>Уроки модуля:</h5>
                              {module.lessons.map(lesson => (
                                <div key={lesson.id} className="lesson-item">
                                  <div className="lesson-icon">
                                    <FaBookOpen />
                                  </div>
                                  <span className="lesson-title">{lesson.title}</span>
                                  <div className="lesson-actions">
                                    <button 
                                      className="lesson-action-btn"
                                      onClick={() => handleEditLesson(lesson.id)}
                                      title="Редагувати урок"
                                    >
                                      <FaEdit />
                                    </button>
                                    
                                    <button 
                                      className="lesson-action-btn delete"
                                      onClick={() => handleDeleteLesson(lesson.id)}
                                      title="Видалити урок"
                                    >
                                      <FaTrash />
                                    </button>
                                  </div>
                                </div>
                              ))}
                              <button 
                                className="btn-add-lesson"
                                onClick={() => handleCreateLesson(module.id)}
                              >
                                <FaPlus /> Додати урок
                              </button>
                            </div>
                          ) : (
                            <div className="no-lessons">
                              <p>У цього модуля поки немає уроків.</p>
                              <button 
                                className="btn-create-first-lesson"
                                onClick={() => handleCreateLesson(module.id)}
                              >
                                <FaPlus /> Створити перший урок
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="teacher-courses-wrapper">
        <TeacherHeader />
        <div className="teacher-courses-container">
          <TeacherSidebar />
          <div className="teacher-courses-loading">
            <FaSpinner className="loading-spinner" />
            <p>Завантаження курсів...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="teacher-courses-wrapper">
        <TeacherHeader />
        <div className="teacher-courses-container">
          <TeacherSidebar />
          <div className="teacher-courses-error">
            <FaExclamationTriangle />
            <h3>Помилка завантаження</h3>
            <p>{error}</p>
            <button 
              className="btn-primary"
              onClick={() => window.location.reload()}
            >
              Спробувати знову
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="teacher-courses-wrapper">
      <TeacherHeader />
      
      <div className="teacher-courses-container">
        <TeacherSidebar />
        
        <div className="teacher-courses-content">
          <div className="teacher-courses-header">
            <h1>Мої курси</h1>
            
            <Link to="/teacher/courses/create" className="btn-create-course">
              <FaPlus /> Створити новий курс
            </Link>
          </div>
          
          <div className="teacher-courses-filters">
            <div className="search-filter">
              <div className="search-input-container">
                <FaSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Пошук курсів..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
              </div>
            </div>
            
            <div className="status-filter">
              <FaFilter className="filter-icon" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">Всі курси</option>
                <option value="free">Безкоштовні</option>
                <option value="premium">Преміум</option>
              </select>
            </div>
            
            <div className="sort-controls">
              <span>Сортувати за:</span>
              <button
                className={`sort-button ${sortField === 'title' ? 'active' : ''}`}
                onClick={() => handleSort('title')}
              >
                Назвою
                {sortField === 'title' && (
                  sortDirection === 'asc' ? <FaSortAmountUp /> : <FaSortAmountDown />
                )}
              </button>
              
              <button
                className={`sort-button ${sortField === 'students' ? 'active' : ''}`}
                onClick={() => handleSort('students')}
              >
                Студентами
                {sortField === 'students' && (
                  sortDirection === 'asc' ? <FaSortAmountUp /> : <FaSortAmountDown />
                )}
              </button>
              
              <button
                className={`sort-button ${sortField === 'created_at' ? 'active' : ''}`}
                onClick={() => handleSort('created_at')}
              >
                Датою створення
                {sortField === 'created_at' && (
                  sortDirection === 'asc' ? <FaSortAmountUp /> : <FaSortAmountDown />
                )}
              </button>
            </div>
          </div>
          
          {filteredCourses.length === 0 ? (
            <div className="no-courses-found">
              <FaGraduationCap className="no-courses-icon" />
              <h3>Курси не знайдено</h3>
              <p>
                {courses.length === 0
                  ? "У вас поки немає курсів. Створіть ваш перший курс, щоб почати викладання!"
                  : "Не знайдено курсів за вашим запитом. Спробуйте змінити параметри пошуку."}
              </p>
              {courses.length === 0 && (
                <Link to="/teacher/courses/create" className="btn-primary">
                  Створити курс
                </Link>
              )}
            </div>
          ) : (
            <div className="teacher-courses-table-container">
              <table className="teacher-courses-table">
                <thead>
                  <tr>
                    <th>Курс</th>
                    <th>Статус</th>
                    <th>Студенти</th>
                    <th>Створено</th>
                    <th>Дії</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCourses.map(course => (
                    <tr key={course.id}>
                      <td className="course-info-cell">
                        <img
                          src={course.image_url || 'https://via.placeholder.com/80x45?text=Курс'}
                          alt={course.title}
                          className="course-thumbnail"
                        />
                        <div className="course-details">
                          <div className="course-title">{course.title}</div>
                          <div className="course-duration">
                            <FaClock /> {course.duration} тижнів
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`course-status ${course.status}`}>
                          {course.status === 'free' ? 'Безкоштовний' : 'Преміум'}
                        </span>
                      </td>
                      <td>
                        <div className="course-students">
                          <FaUsers />
                          <span>{course.students_count || 0}</span>
                        </div>
                      </td>
                      <td>
                        <div className="course-date">
                          <FaCalendarAlt />
                          <span>{formatDate(course.created_at)}</span>
                        </div>
                      </td>
                      <td>
                        <div className="course-actions">
                          <button 
                            onClick={() => handleCourseClick(course.id)} 
                            className="action-button edit"
                            title="Управління курсом"
                          >
                            <FaEdit />
                          </button>
                          
                          <Link 
                            to={`/teacher/courses/${course.id}/analytics`} 
                            className="action-button analytics"
                            title="Аналітика"
                          >
                            <FaChartLine />
                          </Link>
                          
                          <button 
                            className="action-button duplicate"
                            onClick={() => duplicateCourse(course.id)}
                            title="Дублювати курс"
                          >
                            <FaCopy />
                          </button>
                          
                          <Link 
                            to={`/courses/${course.id}`}
                            className="action-button view"
                            title="Переглянути як студент"
                          >
                            <FaEye />
                          </Link>
                          
                          <button 
                            className="action-button delete"
                            onClick={() => setConfirmDelete(course.id)}
                            title="Видалити курс"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      
      {confirmDelete && (
        <div className="delete-confirmation-modal">
          <div className="delete-confirmation-content">
            <h2>Видалити курс?</h2>
            <p>Ви впевнені, що хочете видалити цей курс? Ця дія не може бути скасована. Всі дані курсу, включаючи завдання, матеріали та прогрес студентів будуть видалені.</p>
            
            <div className="delete-confirmation-actions">
              <button 
                className="btn-cancel"
                onClick={() => setConfirmDelete(null)}
              >
                Скасувати
              </button>
              
              <button 
                className="btn-delete"
                onClick={() => deleteCourse(confirmDelete)}
              >
                Видалити курс
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Додаємо потрібні але відсутні раніше функції
const FaArrowLeft = (props) => <span {...props}>←</span>; // Заміна для імпорту FaArrowLeft

const handleEditCourse = (courseId) => {
  // Функція для редагування курсу
  console.log(`Редагування курсу з ID: ${courseId}`);
  // Тут буде логіка для переходу на сторінку редагування курсу
};

const handleEditModule = (moduleId) => {
  // Функція для редагування модуля
  console.log(`Редагування модуля з ID: ${moduleId}`);
  // Тут буде логіка для переходу на сторінку редагування модуля
};

const handleDeleteModule = (moduleId) => {
  // Функція для видалення модуля
  console.log(`Видалення модуля з ID: ${moduleId}`);
  // Тут буде логіка для видалення модуля
};

const handleEditLesson = (lessonId) => {
  // Функція для редагування уроку
  console.log(`Редагування уроку з ID: ${lessonId}`);
  // Тут буде логіка для переходу на сторінку редагування уроку
};

const handleDeleteLesson = (lessonId) => {
  // Функція для видалення уроку
  console.log(`Видалення уроку з ID: ${lessonId}`);
  // Тут буде логіка для видалення уроку
};

export default TeacherCourses;