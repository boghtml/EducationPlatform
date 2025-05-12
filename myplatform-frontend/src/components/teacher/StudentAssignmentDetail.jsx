import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../../api';
import TeacherSidebar from './TeacherSidebar';
import TeacherHeader from './TeacherHeader';
import '../../css/teacher/TeacherSubmissionDetail.css';
import { 
  FaArrowLeft,
  FaCalendarAlt,
  FaClock,
  FaUser,
  FaFileAlt,
  FaDownload,
  FaCheck,
  FaUndo,
  FaExclamationTriangle,
  FaSpinner,
  FaChartLine,
  FaSave,
  FaTrash,
  FaEdit,
  FaTimes,
  FaCheckCircle,
  FaExclamationCircle
} from 'react-icons/fa';

function TeacherSubmissionDetail() {
  const navigate = useNavigate();
  const { assignmentId, submissionId } = useParams();
  
  const [assignment, setAssignment] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    grade: '',
    feedback: ''
  });
  
  const [showGradeForm, setShowGradeForm] = useState(false);
  const [showReturnForm, setShowReturnForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    fetchSubmissionData();
  }, [submissionId]);
  
  const fetchSubmissionData = async () => {
    try {
      setLoading(true);
      
      // Get CSRF token
      await axios.get(`${API_URL}/get-csrf-token/`, { withCredentials: true });
      
      // Get submission details
      const submissionResponse = await axios.get(
        `${API_URL}/assignments/submission/${submissionId}/detail/`,
        { withCredentials: true }
      );
      
      setSubmission(submissionResponse.data);
      
      // Set form data based on existing submission
      if (submissionResponse.data.grade) {
        setFormData({
          grade: submissionResponse.data.grade,
          feedback: submissionResponse.data.feedback || ''
        });
      }
      
      // Store student information
      setStudent(submissionResponse.data.student);
      
      // Get assignment details
      const assignmentResponse = await axios.get(
        `${API_URL}/assignments/${submissionResponse.data.assignment}/`, 
        { withCredentials: true }
      );
      
      setAssignment(assignmentResponse.data);
      setLoading(false);
      
    } catch (error) {
      console.error("Error fetching submission details:", error);
      setError("Не вдалося завантажити деталі роботи");
      setLoading(false);
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleGradeSubmission = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.grade) {
      setError("Будь ласка, вкажіть оцінку");
      return;
    }
    
    const gradeValue = parseFloat(formData.grade);
    if (isNaN(gradeValue) || gradeValue < 0 || gradeValue > 100) {
      setError("Оцінка повинна бути числом від 0 до 100");
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      await axios.post(
        `${API_URL}/assignments/${assignment.id}/submissions/${student.id}/grade/`,
        {
          grade: gradeValue,
          feedback: formData.feedback
        },
        { withCredentials: true }
      );
      
      // Refresh data after successful submission
      await fetchSubmissionData();
      setShowGradeForm(false);
      
    } catch (error) {
      console.error("Error grading submission:", error);
      setError("Помилка при оцінюванні роботи: " + (error.response?.data?.error || "Спробуйте пізніше"));
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleReturnSubmission = async (e) => {
    e.preventDefault();
    
    if (!formData.feedback) {
      setError("Будь ласка, додайте відгук перед поверненням роботи");
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      await axios.post(
        `${API_URL}/assignments/${assignment.id}/submissions/${student.id}/return/`,
        {
          feedback: formData.feedback
        },
        { withCredentials: true }
      );
      
      // Refresh data after successful return
      await fetchSubmissionData();
      setShowReturnForm(false);
      
    } catch (error) {
      console.error("Error returning submission:", error);
      setError("Помилка при поверненні роботи: " + (error.response?.data?.error || "Спробуйте пізніше"));
    } finally {
      setIsSubmitting(false);
    }
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
  
  const formatFileSize = (bytes) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  const isSubmissionOnTime = () => {
    if (!submission?.submission_date || !assignment?.due_date) return null;
    return new Date(submission.submission_date) <= new Date(assignment.due_date);
  };
  
  if (loading) {
    return (
      <div className="submission-detail-wrapper">
        <TeacherHeader />
        <div className="submission-detail-container">
          <TeacherSidebar />
          <div className="submission-detail-loading">
            <FaSpinner className="loading-spinner" />
            <p>Завантаження деталей роботи...</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (error && !submission) {
    return (
      <div className="submission-detail-wrapper">
        <TeacherHeader />
        <div className="submission-detail-container">
          <TeacherSidebar />
          <div className="submission-detail-error">
            <FaExclamationTriangle />
            <h3>Помилка завантаження</h3>
            <p>{error}</p>
            <button
              className="btn-primary"
              onClick={() => navigate(`/teacher/assignments/${assignmentId}/submissions`)}
            >
              Повернутися до списку робіт
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  const onTime = isSubmissionOnTime();
  
  return (
    <div className="submission-detail-wrapper">
      <TeacherHeader />
      
      <div className="submission-detail-container">
        <TeacherSidebar />
        
        <div className="submission-detail-content">
          <div className="submission-detail-header">
            <div className="header-navigation">
              <button
                onClick={() => navigate(`/teacher/assignments/${assignmentId}/submissions`)}
                className="btn-back"
              >
                <FaArrowLeft /> Назад до списку робіт
              </button>
            </div>
            
            <div className="submission-detail-title">
              <h1>Робота студента</h1>
              {assignment && (
                <div className="assignment-title">
                  {assignment.title}
                </div>
              )}
            </div>
          </div>
          
          {error && (
            <div className="error-message">
              <FaExclamationTriangle />
              <span>{error}</span>
              <button 
                onClick={() => setError(null)}
                className="close-error"
              >
                <FaTimes />
              </button>
            </div>
          )}
          
          <div className="submission-detail-main">
            <div className="student-info-section">
              <h2>Інформація про студента</h2>
              <div className="student-info-card">
                <div className="student-avatar">
                  <FaUser />
                </div>
                <div className="student-details">
                  <h3>{student.first_name} {student.last_name}</h3>
                  <p>{student.email}</p>
                </div>
              </div>
            </div>
            
            <div className="submission-info-section">
              <h2>Деталі подачі</h2>
              <div className="info-grid">
                <div className="info-item">
                  <div className="info-label">
                    <FaCalendarAlt /> Дата подачі:
                  </div>
                  <div className="info-value">
                    {submission.submission_date ? formatDate(submission.submission_date) : 'Не вказано'}
                  </div>
                </div>
                
                <div className="info-item">
                  <div className="info-label">
                    <FaClock /> Статус:
                  </div>
                  <div className="info-value status">
                    {submission.status === 'submitted' && (
                      <span className="status-badge submitted">
                        <FaClock /> На перевірці
                      </span>
                    )}
                    
                    {submission.status === 'graded' && (
                      <span className="status-badge graded">
                        <FaCheck /> Оцінено
                      </span>
                    )}
                    
                    {submission.status === 'returned' && (
                      <span className="status-badge returned">
                        <FaUndo /> Повернуто
                      </span>
                    )}
                  </div>
                </div>
                
                {onTime !== null && (
                  <div className="info-item">
                    <div className="info-label">
                      <FaCalendarAlt /> Термін:
                    </div>
                    <div className="info-value">
                      {onTime ? (
                        <span className="on-time">
                          <FaCheckCircle /> Вчасно
                        </span>
                      ) : (
                        <span className="late">
                          <FaExclamationCircle /> Пізно
                        </span>
                      )}
                    </div>
                  </div>
                )}
                
                {submission.status === 'graded' && (
                  <div className="info-item">
                    <div className="info-label">
                      <FaChartLine /> Оцінка:
                    </div>
                    <div className="info-value grade">
                      {submission.grade}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {submission.comment && (
              <div className="submission-comment-section">
                <h2>Коментар студента</h2>
                <div className="comment-text">
                  {submission.comment}
                </div>
              </div>
            )}
            
            {submission.files && submission.files.length > 0 && (
              <div className="submission-files-section">
                <h2>Файли</h2>
                <div className="files-list">
                  {submission.files.map(file => (
                    <div key={file.id} className="file-item">
                      <div className="file-info">
                        <FaFileAlt className="file-icon" />
                        <div className="file-details">
                          <span className="file-name">{file.file_name}</span>
                          <span className="file-size">{formatFileSize(file.file_size)}</span>
                        </div>
                      </div>
                      <a
                        href={file.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-download"
                      >
                        <FaDownload /> Завантажити
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {submission.status === 'graded' && (
              <div className="grading-section">
                <h2>Оцінка та відгук</h2>
                <div className="grade-display">
                  <div className="grade-value">{submission.grade}</div>
                  <div className="grade-label">Оцінка</div>
                </div>
                
                {submission.feedback && (
                  <div className="feedback-section">
                    <h3>Відгук:</h3>
                    <div className="feedback-text">
                      {submission.feedback}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {submission.status === 'returned' && (
              <div className="return-section">
                <h2>Повернуто на доопрацювання</h2>
                <div className="feedback-section">
                  <h3>Відгук:</h3>
                  <div className="feedback-text">
                    {submission.feedback}
                  </div>
                </div>
              </div>
            )}
            
            {/* Grade Form */}
            {showGradeForm && (
              <div className="grade-form-section">
                <h2>Оцінити роботу</h2>
                <form onSubmit={handleGradeSubmission}>
                  <div className="form-group">
                    <label htmlFor="grade">Оцінка (0-100):</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.5"
                      id="grade"
                      name="grade"
                      value={formData.grade}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="feedback">Відгук:</label>
                    <textarea
                      id="feedback"
                      name="feedback"
                      value={formData.feedback}
                      onChange={handleInputChange}
                      rows="4"
                    />
                  </div>
                  
                  <div className="form-actions">
                    <button
                      type="button"
                      className="btn-cancel"
                      onClick={() => setShowGradeForm(false)}
                      disabled={isSubmitting}
                    >
                      Скасувати
                    </button>
                    
                    <button
                      type="submit"
                      className="btn-grade"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <FaSpinner className="spinner" />
                          Збереження...
                        </>
                      ) : (
                        <>
                          <FaSave /> Оцінити роботу
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
            
            {/* Return Form */}
            {showReturnForm && (
              <div className="return-form-section">
                <h2>Повернути на доопрацювання</h2>
                <form onSubmit={handleReturnSubmission}>
                  <div className="form-group">
                    <label htmlFor="feedback">Відгук (обов'язково):</label>
                    <textarea
                      id="feedback"
                      name="feedback"
                      value={formData.feedback}
                      onChange={handleInputChange}
                      rows="4"
                      required
                    />
                  </div>
                  
                  <div className="form-actions">
                    <button
                      type="button"
                      className="btn-cancel"
                      onClick={() => setShowReturnForm(false)}
                      disabled={isSubmitting}
                    >
                      Скасувати
                    </button>
                    
                    <button
                      type="submit"
                      className="btn-return"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <FaSpinner className="spinner" />
                          Збереження...
                        </>
                      ) : (
                        <>
                          <FaUndo /> Повернути на доопрацювання
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
            
            {/* Action buttons */}
            {!showGradeForm && !showReturnForm && submission.status === 'submitted' && (
              <div className="submission-actions">
                <button
                  className="btn-grade-submission"
                  onClick={() => setShowGradeForm(true)}
                >
                  <FaCheck /> Оцінити роботу
                </button>
                
                <button
                  className="btn-return-submission"
                  onClick={() => setShowReturnForm(true)}
                >
                  <FaUndo /> Повернути на доопрацювання
                </button>
              </div>
            )}
            
            {/* Edit buttons for already graded/returned submissions */}
            {!showGradeForm && !showReturnForm && (submission.status === 'graded' || submission.status === 'returned') && (
              <div className="submission-edit-actions">
                <button
                  className="btn-edit"
                  onClick={() => {
                    setShowGradeForm(submission.status === 'graded');
                    setShowReturnForm(submission.status === 'returned');
                  }}
                >
                  <FaEdit /> Редагувати відгук
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TeacherSubmissionDetail;