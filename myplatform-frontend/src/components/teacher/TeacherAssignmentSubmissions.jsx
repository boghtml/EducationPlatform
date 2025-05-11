import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../../api';
import TeacherSidebar from './TeacherSidebar';
import TeacherHeader from './TeacherHeader';
import '../../css/teacher/TeacherAssignmentSubmissions.css';
import { 
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationCircle,
  FaClock,
  FaUser,
  FaCalendarAlt,
  FaFileAlt,
  FaEye,
  FaDownload,
  FaSpinner,
  FaExclamationTriangle,
  FaArrowLeft,
  FaGraduationCap,
  FaClipboardList
} from 'react-icons/fa';

function TeacherAssignmentSubmissions() {
  const navigate = useNavigate();
  const { assignmentId } = useParams();
  
  const [assignment, setAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('submitted'); // 'all', 'submitted', 'graded', 'returned'
  const [sortBy, setSortBy] = useState('date'); // 'date', 'name', 'status'
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchAssignmentData();
  }, [assignmentId]);
  const fetchAssignmentData = async () => {
    try {
      setLoading(true);

      // Get CSRF token
      await axios.get(`${API_URL}/get-csrf-token/`, { withCredentials: true });
      
      // Отримуємо дані про завдання
      const assignmentResponse = await axios.get(
        `${API_URL}/assignments/${assignmentId}/`,
        { withCredentials: true }
      );
      
      setAssignment(assignmentResponse.data);
      
      // Отримуємо список надісланих робіт
      const submissionsResponse = await axios.get(
        `${API_URL}/assignments/${assignmentId}/submissions/`,
        { withCredentials: true }
      );
      
      setSubmissions(submissionsResponse.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching assignment submissions:", error);
      setError("Не вдалося завантажити дані про роботи");
      setLoading(false);
    }
  };

  const getSubmissionStatus = (submission) => {
    switch (submission.status) {
      case 'assigned':
        return { label: 'Призначено', color: '#6c757d', icon: <FaClipboardList /> };
      case 'submitted':
        return { label: 'На перевірці', color: '#007bff', icon: <FaClock /> };
      case 'graded':
        return { label: 'Оцінено', color: '#28a745', icon: <FaCheckCircle /> };
      case 'returned':
        return { label: 'Повернуто', color: '#ffc107', icon: <FaExclamationCircle /> };
      default:
        return { label: 'Невідомо', color: '#6c757d', icon: <FaClipboardList /> };
    }
  };

  const getStatusColor = (status) => {
    const statusInfo = getSubmissionStatus({ status });
    return statusInfo.color;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Не вказано';
    return new Date(dateString).toLocaleDateString('uk-UA', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isSubmissionOnTime = (submissionDate, dueDate) => {
    if (!submissionDate || !dueDate) return null;
    return new Date(submissionDate) <= new Date(dueDate);
  };

  const handleViewSubmission = (submissionId) => {
    navigate(`/teacher/assignments/${assignmentId}/submissions/${submissionId}`);
  };

  // Фільтрація і сортування
  const filteredSubmissions = submissions
    .filter(submission => {
      if (filter !== 'all' && submission.status !== filter) return false;
      
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          submission.username.toLowerCase().includes(query) ||
          submission.email.toLowerCase().includes(query)
        );
      }
      
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.username.localeCompare(b.username);
        case 'status': {
          const statusOrder = { assigned: 1, submitted: 2, graded: 3, returned: 4 };
          return (statusOrder[a.status] || 0) - (statusOrder[b.status] || 0);
        }
        case 'grade': {
          if (!a.grade && !b.grade) return 0;
          else if (!a.grade) return 1;
          else if (!b.grade) return -1;
          return b.grade - a.grade;
        }
        case 'date':
        default:
          return new Date(b.submission_date) - new Date(a.submission_date);
      }
    });

  if (loading) {
    return (
      <div className="submissions-wrapper">
        <TeacherHeader />
        <div className="submissions-container">
          <TeacherSidebar />
          <div className="submissions-loading">
            <FaSpinner className="loading-spinner" />
            <p>Завантаження робіт...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="submissions-wrapper">
        <TeacherHeader />
        <div className="submissions-container">
          <TeacherSidebar />
          <div className="submissions-error">
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
    <div className="submissions-wrapper">
      <TeacherHeader />
      
      <div className="submissions-container">
        <TeacherSidebar />
        
        <div className="submissions-content">
          <div className="submissions-header">
            <div className="header-navigation">
              <button
                onClick={() => navigate(`/teacher/assignments/${assignmentId}`)}
                className="btn-back"
              >
                <FaArrowLeft /> Назад до завдання
              </button>
            </div>
            
            <div className="assignment-info">
              <h1>Перевірка робіт</h1>
              {assignment && (
                <div className="assignment-details">
                  <div className="assignment-title">
                    <FaClipboardList /> {assignment.title}
                  </div>
                  {assignment.due_date && (
                    <div className="assignment-deadline">
                      <FaCalendarAlt /> Дедлайн: {formatDate(assignment.due_date)}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <div className="submissions-stats">
            <div className="stat-card" onClick={() => setFilter('all')}>
              <div className="stat-value">{submissions.length || 0}</div>
              <div className="stat-label">Всього робіт</div>
            </div>
            
            <div className="stat-card" onClick={() => setFilter('submitted')}>
              <div className="stat-value">
                {submissions.filter(s => s.status === 'submitted').length || 0}
              </div>
              <div className="stat-label">На перевірці</div>
            </div>
            
            <div className="stat-card" onClick={() => setFilter('graded')}>
              <div className="stat-value">
                {submissions.filter(s => s.status === 'graded').length || 0}
              </div>
              <div className="stat-label">Оцінено</div>
            </div>
            
            <div className="stat-card" onClick={() => setFilter('returned')}>
              <div className="stat-value">
                {submissions.filter(s => s.status === 'returned').length || 0}
              </div>
              <div className="stat-label">Повернуто</div>
            </div>

            {submissions.length > 0 && submissions.some(s => s.status === 'graded') && (
              <div className="stat-card">
                <div className="stat-value">
                  {Math.round(
                    submissions
                      .filter(s => s.status === 'graded')
                      .reduce((sum, s) => sum + (s.grade || 0), 0) /
                    submissions.filter(s => s.status === 'graded').length
                  ) || 0}
                </div>
                <div className="stat-label">Середня оцінка</div>
              </div>
            )}
          </div>
          
          <div className="submissions-controls">
            <div className="search-filter">
              <input
                type="text"
                placeholder="Пошук за іменем або email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
            
            <div className="filters">
              <div className="filter-group">
                <label>Статус:</label>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">Всі</option>
                  <option value="submitted">На перевірці</option>
                  <option value="graded">Оцінено</option>
                  <option value="returned">Повернуто</option>
                </select>
              </div>
              
              <div className="filter-group">
                <label>Сортування:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="filter-select"
                >
                  <option value="date">За датою</option>
                  <option value="name">За іменем</option>
                  <option value="status">За статусом</option>
                  <option value="grade">За оцінкою</option>
                </select>
              </div>
            </div>
          </div>
          
          {filteredSubmissions.length === 0 ? (
            <div className="no-submissions">
              <div className="no-submissions-content">
                <FaClipboardList className="no-submissions-icon" />
                <h3>
                  {submissions.length === 0 
                    ? 'Ще немає надісланих робіт'
                    : 'Робіт за вашим запитом не знайдено'
                  }
                </h3>
                <p>
                  {submissions.length === 0
                    ? 'Студенти ще не надіслали свої роботи для цього завдання'
                    : 'Спробуйте змінити параметри пошуку або фільтри'
                  }
                </p>
              </div>
            </div>
          ) : (
            <div className="submissions-table-container">
              <table className="submissions-table">
                <thead>
                  <tr>
                    <th>Студент</th>
                    <th>Дата подачі</th>
                    <th>Статус</th>
                    <th>Оцінка</th>
                    <th>Термін</th>
                    <th>Дії</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubmissions.map(submission => {
                    const onTime = isSubmissionOnTime(
                      submission.submission_date, 
                      assignment?.due_date
                    );
                    
                    return (
                      <tr key={submission.id}>
                        <td>
                          <div className="student-info">
                            <FaUser className="student-icon" />
                            <div>
                              <div className="student-name">{submission.username}</div>
                              <div className="student-email">{submission.email}</div>
                            </div>
                          </div>
                        </td>
                        
                        <td>
                          <span className="submission-date">
                            {formatDate(submission.submission_date)}
                          </span>
                        </td>
                        
                        <td>
                          <span className="status-badge" style={{ backgroundColor: getStatusColor(submission.status) }}>
                            {getSubmissionStatus(submission).icon} {getSubmissionStatus(submission).label}
                          </span>
                        </td>
                        
                        <td>
                          {submission.status === 'graded' ? (
                            <span className="grade" style={{ color: '#28a745' }}>{submission.grade}</span>
                          ) : (
                            <span className="no-grade">-</span>
                          )}
                        </td>
                        
                        <td>
                          {onTime !== null && (
                            <span className={`deadline-status ${onTime ? 'on-time' : 'late'}`}>
                              {onTime ? (
                                <>
                                  <FaCheckCircle /> Вчасно
                                </>
                              ) : (
                                <>
                                  <FaExclamationCircle /> Пізно
                                </>
                              )}
                            </span>
                          )}
                        </td>
                        
                        <td>
                          <div className="actions">
                            <button
                              className="btn-view"
                              onClick={() => handleViewSubmission(submission.id)}
                              title="Переглянути роботу"
                            >
                              <FaEye />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TeacherAssignmentSubmissions;