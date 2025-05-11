import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../../api';
import TeacherSidebar from './TeacherSidebar';
import TeacherHeader from './TeacherHeader';
import '../../css/teacher/TeacherAssignmentAnalytics.css';
import { 
  FaArrowLeft,
  FaUsers,
  FaCheckCircle,
  FaExclamationCircle,
  FaClock,
  FaChartBar,
  FaCalendarAlt,
  FaSpinner,
  FaExclamationTriangle,
  FaFileDownload
} from 'react-icons/fa';

function TeacherAssignmentAnalytics() {
  const navigate = useNavigate();
  const { assignmentId } = useParams();
  
  const [assignment, setAssignment] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exportLoading, setExportLoading] = useState(false);

  useEffect(() => {
    fetchAnalyticsData();
  }, [assignmentId]);
  const fetchAnalyticsData = async () => {
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
      
      // Генеруємо аналітику на основі існуючих даних
      const submissionsResponse = await axios.get(
        `${API_URL}/assignments/${assignmentId}/submissions/`,
        { withCredentials: true }
      );
      
      const submissions = submissionsResponse.data;
      
      // Розраховуємо статистику
      const analytics = calculateAnalytics(submissions, assignmentResponse.data);
      setAnalytics(analytics);
      
      setLoading(false);
    } catch (error) {
      console.error("Error fetching analytics data:", error);
      setError("Не вдалося завантажити аналітику");
      setLoading(false);
    }
  };

  const calculateAnalytics = (submissions, assignment) => {
    const total = submissions.length;
    const submitted = submissions.filter(s => s.status === 'submitted').length;
    const graded = submissions.filter(s => s.status === 'graded').length;
    const returned = submissions.filter(s => s.status === 'returned').length;
    
    // Розрахунок середньої оцінки
    const gradedSubmissions = submissions.filter(s => s.status === 'graded' && s.grade !== null);
    const averageGrade = gradedSubmissions.length > 0
      ? gradedSubmissions.reduce((sum, s) => sum + s.grade, 0) / gradedSubmissions.length
      : 0;
    
    // Розрахунок вчасності подачі
    const onTimeSubmissions = submissions.filter(s => s.on_time === 'вчасно').length;
    const lateSubmissions = submissions.filter(s => s.on_time === 'пізно').length;
    
    // Розподіл за датами подачі
    const submissionsByDate = submissions.reduce((acc, submission) => {
      if (submission.submission_date) {
        const date = new Date(submission.submission_date).toISOString().split('T')[0];
        acc[date] = (acc[date] || 0) + 1;
      }
      return acc;
    }, {});
    
    return {
      overview: {
        total,
        submitted,
        graded,
        returned,
        averageGrade: Math.round(averageGrade * 10) / 10,
        onTimeSubmissions,
        lateSubmissions,
        submissionRate: total > 0 ? Math.round((submitted / total) * 100) : 0,
        gradeRate: total > 0 ? Math.round((graded / total) * 100) : 0
      },
      submissionsByDate,
      gradeDistribution: calculateGradeDistribution(gradedSubmissions),
      submissionTimeData: calculateSubmissionTimeData(submissions, assignment)
    };
  };

  const calculateGradeDistribution = (gradedSubmissions) => {
    if (gradedSubmissions.length === 0) return {};
    
    return gradedSubmissions.reduce((acc, submission) => {
      const gradeRange = Math.floor(submission.grade / 10) * 10;
      const rangeKey = `${gradeRange}-${gradeRange + 9}`;
      acc[rangeKey] = (acc[rangeKey] || 0) + 1;
      return acc;
    }, {});
  };

  const calculateSubmissionTimeData = (submissions, assignment) => {
    if (!assignment.due_date) return {};
    
    const dueDate = new Date(assignment.due_date);
    
    return submissions.reduce((acc, submission) => {
      if (submission.submission_date) {
        const submissionDate = new Date(submission.submission_date);
        const timeDiff = submissionDate - dueDate;
        const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
        
        if (daysDiff <= 0) {
          // Здано вчасно або раніше
          const key = daysDiff === 0 ? 'on-due-date' : `${Math.abs(daysDiff)}-days-early`;
          acc[key] = (acc[key] || 0) + 1;
        } else {
          // Здано пізно
          const key = `${daysDiff}-days-late`;
          acc[key] = (acc[key] || 0) + 1;
        }
      }
      return acc;
    }, {});
  };

  const exportToCSV = async () => {
    setExportLoading(true);
    
    try {
      const submissionsResponse = await axios.get(
        `${API_URL}/assignments/${assignmentId}/submissions/`,
        { withCredentials: true }
      );
      
      const submissions = submissionsResponse.data;
      
      // Створюємо CSV контент
      const csvContent = [
        ['Student Name', 'Email', 'Submission Date', 'Status', 'Grade', 'On Time', 'Feedback'],
        ...submissions.map(submission => [
          submission.username,
          submission.email,
          submission.submission_date || 'Not submitted',
          submission.status,
          submission.grade || 'Not graded',
          submission.on_time || 'N/A',
          (submission.feedback || '').replace(/\n/g, ' ')
        ])
      ];
      
      // Конвертуємо у CSV
      const csvString = csvContent
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');
      
      // Створюємо і завантажуємо файл
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `assignment_${assignmentId}_analytics.csv`;
      link.click();
      
    } catch (error) {
      console.error("Error exporting data:", error);
      setError('Помилка при експорті даних');
    } finally {
      setExportLoading(false);
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
      <div className="analytics-wrapper">
        <TeacherHeader />
        <div className="analytics-container">
          <TeacherSidebar />
          <div className="analytics-loading">
            <FaSpinner className="loading-spinner" />
            <p>Завантаження аналітики...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !assignment || !analytics) {
    return (
      <div className="analytics-wrapper">
        <TeacherHeader />
        <div className="analytics-container">
          <TeacherSidebar />
          <div className="analytics-error">
            <FaExclamationTriangle />
            <h3>Помилка завантаження</h3>
            <p>{error}</p>
            <button 
              className="btn-primary"
              onClick={() => navigate(`/teacher/assignments/${assignmentId}`)}
            >
              Повернутися до завдання
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-wrapper">
      <TeacherHeader />
      
      <div className="analytics-container">
        <TeacherSidebar />
        
        <div className="analytics-content">
          <div className="analytics-header">
            <div className="header-navigation">
              <button
                onClick={() => navigate(`/teacher/assignments/${assignmentId}`)}
                className="btn-back"
              >
                <FaArrowLeft /> Назад до завдання
              </button>
            </div>
            
            <div className="analytics-title">
              <h1>Аналітика завдання</h1>
              <div className="assignment-info">
                <h2>{assignment.title}</h2>
                {assignment.due_date && (
                  <span className="due-date">
                    <FaCalendarAlt /> Дедлайн: {formatDate(assignment.due_date)}
                  </span>
                )}
              </div>
            </div>
            
            <button
              onClick={exportToCSV}
              className="btn-export"
              disabled={exportLoading}
            >
              {exportLoading ? (
                <>
                  <FaSpinner className="spinner" />
                  Експорт...
                </>
              ) : (
                <>
                  <FaFileDownload /> Експорт CSV
                </>
              )}
            </button>
          </div>
          
          {/* Overview Statistics */}
          <div className="analytics-overview">
            <div className="stat-card">
              <div className="stat-icon total">
                <FaUsers />
              </div>
              <div className="stat-content">
                <div className="stat-value">{analytics.overview.total}</div>
                <div className="stat-label">Всього студентів</div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon submitted">
                <FaCheckCircle />
              </div>
              <div className="stat-content">
                <div className="stat-value">{analytics.overview.submitted}</div>
                <div className="stat-label">Подано робіт</div>
                <div className="stat-percentage">{analytics.overview.submissionRate}%</div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon graded">
                <FaChartBar />
              </div>
              <div className="stat-content">
                <div className="stat-value">{analytics.overview.graded}</div>
                <div className="stat-label">Оцінено</div>
                <div className="stat-percentage">{analytics.overview.gradeRate}%</div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon average">
                <FaChartBar />
              </div>
              <div className="stat-content">
                <div className="stat-value">{analytics.overview.averageGrade}</div>
                <div className="stat-label">Середня оцінка</div>
              </div>
            </div>
          </div>
          
          {/* Timeliness Statistics */}
          <div className="analytics-section">
            <h3>Вчасність подачі</h3>
            <div className="timeliness-stats">
              <div className="timeliness-item on-time">
                <div className="timeliness-value">{analytics.overview.onTimeSubmissions}</div>
                <div className="timeliness-label">
                  <FaCheckCircle /> Вчасно
                </div>
              </div>
              
              <div className="timeliness-item late">
                <div className="timeliness-value">{analytics.overview.lateSubmissions}</div>
                <div className="timeliness-label">
                  <FaExclamationCircle /> Пізно
                </div>
              </div>
            </div>
          </div>
          
          {/* Grade Distribution */}
          {Object.keys(analytics.gradeDistribution).length > 0 && (
            <div className="analytics-section">
              <h3>Розподіл оцінок</h3>
              <div className="grade-distribution">
                {Object.entries(analytics.gradeDistribution).map(([range, count]) => (
                  <div key={range} className="grade-bar">
                    <div className="grade-label">{range}</div>
                    <div className="grade-progress">
                      <div 
                        className="grade-fill"
                        style={{ 
                          width: `${(count / analytics.overview.graded) * 100}%`,
                          backgroundColor: getGradeColor(parseInt(range.split('-')[0]))
                        }}
                      >
                        <span className="grade-count">{count}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Submission Timeline */}
          {Object.keys(analytics.submissionsByDate).length > 0 && (
            <div className="analytics-section">
              <h3>Графік подачі робіт</h3>
              <div className="submission-timeline">
                {Object.entries(analytics.submissionsByDate)
                  .sort(([a], [b]) => new Date(a) - new Date(b))
                  .map(([date, count]) => (
                    <div key={date} className="timeline-item">
                      <div className="timeline-date">{formatDate(date)}</div>
                      <div className="timeline-bar">
                        <div 
                          className="timeline-fill"
                          style={{ height: `${(count / Math.max(...Object.values(analytics.submissionsByDate))) * 100}%` }}
                        >
                          <span className="timeline-count">{count}</span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function getGradeColor(grade) {
  if (grade >= 90) return '#059669'; // green
  if (grade >= 80) return '#65a30d'; // lime
  if (grade >= 70) return '#ca8a04'; // yellow
  if (grade >= 60) return '#ea580c'; // orange
  return '#dc2626'; // red
}

export default TeacherAssignmentAnalytics;