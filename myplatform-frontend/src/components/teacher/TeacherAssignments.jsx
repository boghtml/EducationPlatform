import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../../api';
import TeacherSidebar from './TeacherSidebar';
import TeacherHeader from './TeacherHeader';
import '../../css/teacher/TeacherAssignments.css';

import { 
  FaTasks, 
  FaPlus, 
  FaSearch, 
  FaFilter, 
  FaCalendarAlt, 
  FaUsers, 
  FaGraduationCap,
  FaCheckCircle,
  FaExclamationCircle,
  FaSpinner,
  FaExclamationTriangle,
  FaEdit,
  FaEye,
  FaChartBar,
  FaTrash,
  FaClock
} from 'react-icons/fa';

function TeacherAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [filteredAssignments, setFilteredAssignments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [courseFilter, setCourseFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    
    const userRole = sessionStorage.getItem('userRole');
    
    if (userRole !== 'teacher') {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        
        await axios.get(`${API_URL}/get-csrf-token/`, { withCredentials: true });
        
        const coursesResponse = await axios.get(`${API_URL}/courses/`, {
          withCredentials: true,
          params: { teacher_id: sessionStorage.getItem('userId') }
        });
        
        if (coursesResponse.data) {
          setCourses(coursesResponse.data);
        }
        
        const assignmentsResponse = await axios.get(`${API_URL}/assignments/`, {
          withCredentials: true
        });
        
        if (assignmentsResponse.data) {
          setAssignments(assignmentsResponse.data);
          setFilteredAssignments(assignmentsResponse.data);
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching teacher assignments data:", error);
        setError("Не вдалося завантажити дані. Будь ласка, спробуйте пізніше.");
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  useEffect(() => {
    if (!assignments.length) return;
    
    let results = [...assignments];
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(assignment => 
        assignment.title.toLowerCase().includes(query) ||
        assignment.description?.toLowerCase().includes(query)
      );
    }
    
    if (courseFilter !== 'all') {
      results = results.filter(assignment => assignment.course.toString() === courseFilter);
    }
    
    if (statusFilter !== 'all') {
        
      results = results.filter(assignment => {
        const dueDate = new Date(assignment.due_date);
        const today = new Date();
        
        if (statusFilter === 'active' && dueDate >= today) return true;
        if (statusFilter === 'past' && dueDate < today) return true;
        
        return false;
      });
    }
    
    setFilteredAssignments(results);
  }, [assignments, searchQuery, courseFilter, statusFilter]);

  const deleteAssignment = async (assignmentId) => {
    try {
        
      await axios.get(`${API_URL}/get-csrf-token/`, { withCredentials: true });
      
      await axios.delete(`${API_URL}/assignments/${assignmentId}/`, {
        withCredentials: true
      });
      
      setAssignments(assignments.filter(assignment => assignment.id !== assignmentId));
      setConfirmDelete(null);
      
    } catch (error) {
      console.error("Error deleting assignment:", error);
      setError("Не вдалося видалити завдання. Будь ласка, спробуйте пізніше.");
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

  const getDeadlineStatus = (dateString) => {
    if (!dateString) return 'no-deadline';
    
    const now = new Date();
    const dueDate = new Date(dateString);
    const diffDays = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'past';
    if (diffDays === 0) return 'today';
    if (diffDays <= 3) return 'approaching';
    return 'future';
  };

  const getCourseTitle = (courseId) => {
    const course = courses.find(c => c.id === parseInt(courseId));
    return course ? course.title : 'Невідомий курс';
  };

  const getSubmissionStats = (assignment) => {
    
    const total = assignment.submissions_count || 0;
    const graded = assignment.graded_submissions || 0;
    const pending = total - graded;
    
    return { total, graded, pending };
  };

  if (loading) {
    return (
      <div className="teacher-assignments-wrapper">
        <TeacherHeader />
        <div className="teacher-assignments-container">
          <TeacherSidebar />
          <div className="teacher-assignments-loading">
            <FaSpinner className="loading-spinner" />
            <p>Завантаження завдань...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="teacher-assignments-wrapper">
        <TeacherHeader />
        <div className="teacher-assignments-container">
          <TeacherSidebar />
          <div className="teacher-assignments-error">
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
    <div className="teacher-assignments-wrapper">
      <TeacherHeader />
      
      <div className="teacher-assignments-container">
        <TeacherSidebar />
        
        <div className="teacher-assignments-content">
          <div className="teacher-assignments-header">
            <h1>Управління завданнями</h1>
            
            <Link to="/teacher/assignments/create" className="btn-create-assignment">
              <FaPlus /> Створити нове завдання
            </Link>
          </div>
          
          <div className="teacher-assignments-filters">
            <div className="search-filter">
              <div className="search-input-container">
                <FaSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Пошук завдань..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
              </div>
            </div>
            
            <div className="course-filter">
              <FaGraduationCap className="filter-icon" />
              <select
                value={courseFilter}
                onChange={(e) => setCourseFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">Всі курси</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id.toString()}>
                    {course.title}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="status-filter">
              <FaFilter className="filter-icon" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">Всі завдання</option>
                <option value="active">Активні</option>
                <option value="past">Минулі</option>
              </select>
            </div>
          </div>
          
          {filteredAssignments.length === 0 ? (
            <div className="no-assignments-found">
              <FaTasks className="no-assignments-icon" />
              <h3>Завдання не знайдено</h3>
              <p>
                {assignments.length === 0
                  ? "У вас поки немає завдань. Створіть нове завдання, щоб почати."
                  : "Не знайдено завдань за вашим запитом. Спробуйте змінити параметри пошуку."}
              </p>
              {assignments.length === 0 && (
                <Link to="/teacher/assignments/create" className="btn-primary">
                  Створити завдання
                </Link>
              )}
            </div>
          ) : (
            <div className="teacher-assignments-grid">
              {filteredAssignments.map(assignment => {
                const submissionStats = getSubmissionStats(assignment);
                const deadlineStatus = getDeadlineStatus(assignment.due_date);
                
                return (
                  <div className="assignment-card" key={assignment.id}>
                    <div className="assignment-header">
                      <h3 className="assignment-title">{assignment.title}</h3>
                      <div className={`deadline-badge ${deadlineStatus}`}>
                        {deadlineStatus === 'today' && "Сьогодні"}
                        {deadlineStatus === 'past' && "Прострочено"}
                        {deadlineStatus === 'approaching' && "Скоро"}
                        {deadlineStatus === 'future' && "Майбутнє"}
                        {deadlineStatus === 'no-deadline' && "Без терміну"}
                      </div>
                    </div>
                    
                    <div className="assignment-course">
                      <FaGraduationCap />
                      <span>{getCourseTitle(assignment.course)}</span>
                    </div>
                    
                    <div className="assignment-deadline">
                      <FaCalendarAlt />
                      <span>Дедлайн: {assignment.due_date ? formatDate(assignment.due_date) : 'Не встановлено'}</span>
                    </div>
                    
                    <div className="assignment-submissions">
                      <FaUsers />
                      <span>Надіслано робіт: {submissionStats.total}</span>
                    </div>
                    
                    <div className="submission-stats">
                      <div className="submission-stat">
                        <div className="stat-value">{submissionStats.pending}</div>
                        <div className="stat-label">На перевірці</div>
                      </div>
                      
                      <div className="submission-stat">
                        <div className="stat-value">{submissionStats.graded}</div>
                        <div className="stat-label">Перевірено</div>
                      </div>
                    </div>
                    
                    <div className="assignment-description">
                      {assignment.description
                        ? assignment.description.length > 100
                          ? `${assignment.description.substring(0, 100)}...`
                          : assignment.description
                        : 'Опис відсутній'}
                    </div>
                    
                    <div className="assignment-actions">
                      <Link 
                        to={`/teacher/assignments/${assignment.id}/edit`}
                        className="btn-action edit"
                        title="Редагувати завдання"
                      >
                        <FaEdit />
                      </Link>
                      
                      <Link 
                        to={`/teacher/assignments/${assignment.id}/submissions`}
                        className="btn-action submissions"
                        title="Перевірити роботи"
                      >
                        <FaCheckCircle />
                      </Link>
                      
                      <Link 
                        to={`/teacher/assignments/${assignment.id}/analytics`}
                        className="btn-action analytics"
                        title="Аналітика"
                      >
                        <FaChartBar />
                      </Link>
                      
                      <Link
                        to={`/assignments/${assignment.id}`}
                        className="btn-action view"
                        title="Переглянути як студент"
                      >
                        <FaEye />
                      </Link>
                      
                      <button
                        className="btn-action delete"
                        onClick={() => setConfirmDelete(assignment.id)}
                        title="Видалити завдання"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      
      {confirmDelete && (
        <div className="delete-confirmation-modal">
          <div className="delete-confirmation-content">
            <h2>Видалити завдання?</h2>
            <p>Ви впевнені, що хочете видалити це завдання? Ця дія не може бути скасована. Всі надіслані роботи та оцінки також будуть видалені.</p>
            
            <div className="delete-confirmation-actions">
              <button 
                className="btn-cancel"
                onClick={() => setConfirmDelete(null)}
              >
                Скасувати
              </button>
              
              <button 
                className="btn-delete"
                onClick={() => deleteAssignment(confirmDelete)}
              >
                Видалити завдання
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TeacherAssignments;