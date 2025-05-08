import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  FaClock
} from 'react-icons/fa';

function TeacherCourses() {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortField, setSortField] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const navigate = useNavigate();

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
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching courses:", error);
        setError("Не вдалося завантажити курси. Будь ласка, спробуйте пізніше.");
        setLoading(false);
      }
    };

    fetchCourses();
  }, [navigate]);

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

  const deleteCourse = async (courseId) => {
    try {
        
      await axios.get(`${API_URL}/get-csrf-token/`, { withCredentials: true });
      
      await axios.delete(`${API_URL}/courses/${courseId}/`, {
        withCredentials: true
      });
      
      setCourses(courses.filter(course => course.id !== courseId));
      setConfirmDelete(null);
      
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

  const formatDate = (dateString) => {
    if (!dateString) return 'Не вказано';
    return new Date(dateString).toLocaleDateString('uk-UA', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

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
                          <Link 
                            to={`/teacher/courses/${course.id}`} 
                            className="action-button edit"
                            title="Редагувати курс"
                          >
                            <FaEdit />
                          </Link>
                          
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

export default TeacherCourses;