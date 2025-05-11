import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../../api';
import TeacherSidebar from './TeacherSidebar';
import TeacherHeader from './TeacherHeader';
import '../../css/teacher/TeacherSubmissionDetail.css';
import { 
  FaArrowLeft,
  FaDownload,
  FaFileAlt,
  FaUser,
  FaCalendarAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationCircle,
  FaSave,
  FaUndo,
  FaSpinner,
  FaExclamationTriangle
} from 'react-icons/fa';

function TeacherSubmissionDetail() {
  const navigate = useNavigate();
  const { assignmentId, submissionId } = useParams();
  
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [grading, setGrading] = useState(false);
  const [returning, setReturning] = useState(false);
  const [showGradeForm, setShowGradeForm] = useState(false);
  const [showReturnForm, setShowReturnForm] = useState(false);
  const [gradeData, setGradeData] = useState({
    grade: '',
    feedback: ''
  });
  const [returnData, setReturnData] = useState({
    feedback: ''
  });

  useEffect(() => {
    fetchSubmissionData();
  }, [submissionId]);

  const fetchSubmissionData = async () => {
    try {
      setLoading(true);
      
      const response = await axios.get(
        `${API_URL}/assignments/submission/${submissionId}/detail/`,
        { withCredentials: true }
      );
      
      setSubmission(response.data);
      
      // Якщо вже є оцінка, заповнюємо форму
      if (response.data.grade !== null || response.data.feedback) {
        setGradeData({
          grade: response.data.grade || '',
          feedback: response.data.feedback || ''
        });
      }
      
      setLoading(false);
    } catch (error) {
      console.error("Error fetching submission data:", error);
      setError("Не вдалося завантажити дані про роботу");
      setLoading(false);
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

  const handleGradeSubmit = async (e) => {
    e.preventDefault();
    
    if (!gradeData.grade || isNaN(gradeData.grade)) {
      setError('Введіть коректну оцінку');
      return;
    }
    
    setGrading(true);
    setError(null);
    
    try {
      await axios.post(
        `${API_URL}/assignments/${assignmentId}/submissions/${submission.student_id}/grade/`,
        {
          grade: parseFloat(gradeData.grade),
          feedback: gradeData.feedback
        },
        { withCredentials: true }
      );
      
      // Оновлюємо дані про роботу
      await fetchSubmissionData();
      setShowGradeForm(false);
      
    } catch (error) {
      console.error("Error grading submission:", error);
      setError('Помилка при оцінці роботи: ' + (error.response?.data?.error || error.message));
    } finally {
      setGrading(false);
    }
  };

  const handleReturnSubmit = async (e) => {
    e.preventDefault();
    
    if (!returnData.feedback.trim()) {
      setError('Введіть повідомлення для повернення роботи');
      return;
    }
    
    setReturning(true);
    setError(null);
    
    try {
      await axios.post(
        `${API_URL}/assignments/${assignmentId}/submissions/${submission.student_id}/return/`,
        {
          feedback: returnData.feedback
        },
        { withCredentials: true }
      );
      
      // Оновлюємо дані про роботу
      await fetchSubmissionData();
      setShowReturnForm(false);
      
    } catch (error) {
      console.error("Error returning submission:", error);
      setError('Помилка при поверненні роботи: ' + (error.response?.data?.error || error.message));
    } finally {
      setReturning(false);
    }
  };

  if (loading) {
    return (
      <div className="submission-detail-wrapper">
        <TeacherHeader />
        <div className="submission-detail-container">
          <TeacherSidebar />
          <div className="submission-detail-loading">
            <FaSpinner className="loading-spinner" />
            <p>Завантаження роботи...</p>
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
              Повернутися до списку
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="submission-detail-wrapper">
      <TeacherHeader />
      
      <div className="submission-detail-container">
        <TeacherSidebar />
        
        <div className="submission-detail-content">
          <div className="submission-detail-header">
            <button
              onClick={() => navigate(`/teacher/assignments/${assignmentId}/submissions`)}
              className="btn-back"
            >
              <FaArrowLeft /> Назад до списку
            </button>
            
            <h1>Деталі роботи</h1>
          </div>
          
          {error && (
            <div className="error-message">
              <FaExclamationTriangle />
              <span>{error}</span>
            </div>
          )}
          
          {submission && (
            <div className="submission-details">
              <div className="student-section">
                <div className="section-header">
                  <h2>Інформація про студента</h2>
                </div>
                
                <div className="student-info">
                  <div className="info-item">
                    <FaUser className="info-icon" />
                    <div>
                      <label>Ім'я студента:</label>
                      <span>{submission.username}</span>
                    </div>
                  </div>
                  
                  <div className="info-item">
                    <label>Email:</label>
                    <span>{submission.email}</span>
                  </div>
                  
                  <div className="info-item">
                    <FaCalendarAlt className="info-icon" />
                    <div>
                      <label>Дата подачі:</label>
                      <span>{formatDate(submission.submission_date)}</span>
                    </div>
                  </div>
                  
                  <div className="info-item">
                    <label>Статус:</label>
                    <span className={`status-indicator ${submission.on_time === 'вчасно' ? 'on-time' : 'late'}`}>
                      {submission.on_time === 'вчасно' ? (
                        <>
                          <FaCheckCircle /> Здано вчасно
                        </>
                      ) : (
                        <>
                          <FaExclamationCircle /> Здано пізно
                        </>
                      )}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="submission-section">
                <div className="section-header">
                  <h2>Робота студента</h2>
                </div>
                
                {submission.comment && (
                  <div className="submission-comment">
                    <label>Коментар студента:</label>
                    <div className="comment-text">{submission.comment}</div>
                  </div>
                )}
                
                {submission.files && submission.files.length > 0 && (
                  <div className="files-section">
                    <h3>Файли роботи:</h3>
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
              </div>
              
              <div className="grading-section">
                <div className="section-header">
                  <h2>Оцінка та відгук</h2>
                  
                  {!showGradeForm && !showReturnForm && (
                    <div className="action-buttons">
                      <button
                        className="btn-grade"
                        onClick={() => {
                          setShowGradeForm(true);
                          setShowReturnForm(false);
                        }}
                      >
                        <FaCheckCircle /> Оцінити
                      </button>
                      
                      <button
                        className="btn-return"
                        onClick={() => {
                          setShowReturnForm(true);
                          setShowGradeForm(false);
                          setReturnData({ feedback: gradeData.feedback || '' });
                        }}
                      >
                        <FaUndo /> Повернути
                      </button>
                    </div>
                  )}
                </div>
                
                {showGradeForm ? (
                  <form onSubmit={handleGradeSubmit} className="grade-form">
                    <div className="form-group">
                      <label htmlFor="grade">Оцінка:</label>
                      <input
                        type="number"
                        id="grade"
                        value={gradeData.grade}
                        onChange={(e) => setGradeData(prev => ({ ...prev, grade: e.target.value }))}
                        placeholder="Введіть оцінку"
                        step="0.1"
                        min="0"
                        max="100"
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="feedback">Відгук:</label>
                      <textarea
                        id="feedback"
                        value={gradeData.feedback}
                        onChange={(e) => setGradeData(prev => ({ ...prev, feedback: e.target.value }))}
                        placeholder="Введіть відгук про роботу"
                        rows="4"
                      />
                    </div>
                    
                    <div className="form-actions">
                      <button
                        type="button"
                        className="btn-cancel"
                        onClick={() => setShowGradeForm(false)}
                      >
                        Скасувати
                      </button>
                      
                      <button
                        type="submit"
                        className="btn-submit"
                        disabled={grading}
                      >
                        {grading ? (
                          <>
                            <FaSpinner className="spinner" />
                            Збереження...
                          </>
                        ) : (
                          <>
                            <FaSave /> Зберегти оцінку
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                ) : showReturnForm ? (
                  <form onSubmit={handleReturnSubmit} className="return-form">
                    <div className="form-group">
                      <label htmlFor="return-feedback">Повідомлення для студента:</label>
                      <textarea
                        id="return-feedback"
                        value={returnData.feedback}
                        onChange={(e) => setReturnData(prev => ({ ...prev, feedback: e.target.value }))}
                        placeholder="Поясніть, чому робота повертається на доопрацювання"
                        rows="4"
                        required
                      />
                    </div>
                    
                    <div className="form-actions">
                      <button
                        type="button"
                        className="btn-cancel"
                        onClick={() => setShowReturnForm(false)}
                      >
                        Скасувати
                      </button>
                      
                      <button
                        type="submit"
                        className="btn-submit return"
                        disabled={returning}
                      >
                        {returning ? (
                          <>
                            <FaSpinner className="spinner" />
                            Повернення...
                          </>
                        ) : (
                          <>
                            <FaUndo /> Повернути роботу
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="current-grading">
                    {submission.grade !== null || submission.feedback ? (
                      <div className="existing-grade">
                        {submission.grade !== null && (
                          <div className="grade-info">
                            <label>Поточна оцінка:</label>
                            <span className="grade-value">{submission.grade}</span>
                          </div>
                        )}
                        
                        {submission.feedback && (
                          <div className="feedback-info">
                            <label>Відгук викладача:</label>
                            <div className="feedback-text">{submission.feedback}</div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="no-grade">
                        <p>Роботу ще не оцінено</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TeacherSubmissionDetail;