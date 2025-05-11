import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../../api';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import '../../css/teacher/StudentAssignmentDetail.css';
import { 
  FaArrowLeft,
  FaCalendarAlt,
  FaClock,
  FaFileUpload,
  FaDownload,
  FaFileAlt,
  FaExternalLinkAlt,
  FaCheckCircle,
  FaExclamationCircle,
  FaTimesCircle,
  FaUndo,
  FaEdit,
  FaSpinner,
  FaExclamationTriangle,
  FaSave,
  FaTimes
} from 'react-icons/fa';

function StudentAssignmentDetail() {
  const navigate = useNavigate();
  const { assignmentId } = useParams();
  
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [submissionComment, setSubmissionComment] = useState('');
  const [submissionFiles, setSubmissionFiles] = useState([]);

  useEffect(() => {
    fetchAssignmentData();
  }, [assignmentId]);

  const fetchAssignmentData = async () => {
    try {
      setLoading(true);
      
      const response = await axios.get(
        `${API_URL}/assignments/student/${assignmentId}/detail/`,
        { withCredentials: true }
      );
      
      setAssignment(response.data);
      
      // Якщо є збережений коментар, заповнюємо його
      if (response.data.submission && response.data.submission.comment) {
        setSubmissionComment(response.data.submission.comment);
      }
      
      setLoading(false);
    } catch (error) {
      console.error("Error fetching assignment data:", error);
      setError("Не вдалося завантажити дані про завдання");
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

  const getTimeLeft = (dueDate) => {
    if (!dueDate) return null;
    
    const now = new Date();
    const due = new Date(dueDate);
    const diff = due - now;
    
    if (diff <= 0) return { expired: true, text: 'Термін минув' };
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) {
      return { expired: false, text: `${days}д ${hours}г ${minutes}х` };
    } else if (hours > 0) {
      return { expired: false, text: `${hours}г ${minutes}х` };
    } else {
      return { expired: false, text: `${minutes}х` };
    }
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    const validFiles = files.filter(file => file.size <= 50 * 1024 * 1024); // Макс 50MB
    
    if (validFiles.length !== files.length) {
      setError('Деякі файли перевищують 50MB і були пропущені');
    }
    
    setSubmissionFiles(prev => [...prev, ...validFiles]);
    event.target.value = '';
  };

  const handleRemoveFile = (index) => {
    setSubmissionFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmitAssignment = async () => {
    if (!submissionComment.trim() && submissionFiles.length === 0) {
      setError('Будь ласка, додайте коментар або файл');
      return;
    }
    
    setSubmitting(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('comment', submissionComment);
      
      submissionFiles.forEach(file => {
        formData.append('files', file);
      });
      
      await axios.post(
        `${API_URL}/assignments/${assignmentId}/submit/`,
        formData,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      // Оновлюємо дані
      await fetchAssignmentData();
      setShowSubmitForm(false);
      setSubmissionFiles([]);
      
    } catch (error) {
      console.error("Error submitting assignment:", error);
      setError('Помилка при надсиланні роботи: ' + (error.response?.data?.error || error.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelSubmission = async () => {
    try {
      await axios.post(
        `${API_URL}/assignments/${assignmentId}/cancel_submission/`,
        {},
        { withCredentials: true }
      );
      
      // Оновлюємо дані
      await fetchAssignmentData();
      
    } catch (error) {
      console.error("Error canceling submission:", error);
      setError('Помилка при скасуванні роботи');
    }
  };

  if (loading) {
    return (
      <div className="student-assignment-wrapper">
        <Header />
        <div className="student-assignment-loading">
          <FaSpinner className="loading-spinner" />
          <p>Завантаження завдання...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error && !assignment) {
    return (
      <div className="student-assignment-wrapper">
        <Header />
        <div className="student-assignment-error">
          <FaExclamationTriangle />
          <h3>Помилка завантаження</h3>
          <p>{error}</p>
          <button 
            className="btn-primary"
            onClick={() => navigate(-1)}
          >
            Повернутися назад
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  const timeLeft = getTimeLeft(assignment.due_date);
  const canSubmit = assignment.status === 'assigned' || assignment.status === 'returned';
  const isSubmitted = assignment.status === 'submitted';
  const isGraded = assignment.status === 'graded';

  return (
    <div className="student-assignment-wrapper">
      <Header />
      
      <div className="student-assignment-container">
        <div className="assignment-header">
          <button
            onClick={() => navigate(-1)}
            className="btn-back"
          >
            <FaArrowLeft /> Назад
          </button>
          
          <div className="assignment-title-section">
            <h1>{assignment.title}</h1>
            <div className="assignment-course">
              Курс: {assignment.course.title}
            </div>
          </div>
          
          <div className="assignment-status">
            {isGraded ? (
              <span className="status-badge graded">
                <FaCheckCircle /> Оцінено: {assignment.submission.grade}
              </span>
            ) : isSubmitted ? (
              <span className="status-badge submitted">
                <FaClock /> На перевірці
              </span>
            ) : assignment.status === 'returned' ? (
              <span className="status-badge returned">
                <FaUndo /> Повернуто
              </span>
            ) : (
              <span className="status-badge pending">
                <FaEdit /> Не здано
              </span>
            )}
          </div>
        </div>
        
        {error && (
          <div className="error-message">
            <FaExclamationTriangle />
            <span>{error}</span>
          </div>
        )}
        
        <div className="assignment-content">
          <div className="assignment-details">
            <div className="detail-item">
              <div className="detail-label">
                <FaCalendarAlt /> Дедлайн:
              </div>
              <div className="detail-value">
                {assignment.due_date ? formatDate(assignment.due_date) : 'Не встановлено'}
              </div>
            </div>
            
            {timeLeft && (
              <div className="detail-item">
                <div className="detail-label">
                  <FaClock /> Часу залишилось:
                </div>
                <div className={`detail-value ${timeLeft.expired ? 'expired' : ''}`}>
                  {timeLeft.text}
                </div>
              </div>
            )}
            
            <div className="detail-item">
              <div className="detail-label">Викладач:</div>
              <div className="detail-value">
                {assignment.teacher.first_name} {assignment.teacher.last_name}
              </div>
            </div>
          </div>
          
          <div className="assignment-description">
            <h2>Опис завдання</h2>
            <div className="description-text">
              {assignment.description || 'Опис відсутній'}
            </div>
          </div>
          
          {assignment.files && assignment.files.length > 0 && (
            <div className="assignment-materials">
              <h2>Матеріали завдання</h2>
              <div className="materials-list">
                {assignment.files.map(file => (
                  <div key={file.id} className="material-item">
                    <div className="material-info">
                      <FaFileAlt className="material-icon" />
                      <div className="material-details">
                        <span className="material-name">{file.file_name}</span>
                        <span className="material-size">{formatFileSize(file.file_size)}</span>
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
          
          {assignment.links && assignment.links.length > 0 && (
            <div className="assignment-links">
              <h2>Корисні посилання</h2>
              <div className="links-list">
                {assignment.links.map(link => (
                  <a
                    key={link.id}
                    href={link.link_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-item"
                  >
                    <FaExternalLinkAlt />
                    <span>{link.link_url}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
          
          <div className="submission-section">
            <h2>Ваша робота</h2>
            
            {canSubmit && !showSubmitForm && (
              <div className="submit-prompt">
                <p>Ви ще не надіслали роботу для цього завдання</p>
                <button
                  onClick={() => setShowSubmitForm(true)}
                  className="btn-submit"
                >
                  <FaFileUpload /> Надіслати роботу
                </button>
              </div>
            )}
            
            {showSubmitForm && (
              <div className="submit-form">
                <div className="form-group">
                  <label htmlFor="comment">Коментар:</label>
                  <textarea
                    id="comment"
                    value={submissionComment}
                    onChange={(e) => setSubmissionComment(e.target.value)}
                    placeholder="Додайте коментар до вашої роботи (опціонально)"
                    rows="4"
                  />
                </div>
                
                <div className="form-group">
                  <label>Файли:</label>
                  <div className="file-upload-area">
                    <input
                      type="file"
                      id="file-upload"
                      multiple
                      onChange={handleFileUpload}
                      accept=".pdf,.doc,.docx,.txt,.zip,.rar"
                      style={{ display: 'none' }}
                    />
                    <label htmlFor="file-upload" className="upload-button">
                      {uploading ? (
                        <>
                          <FaSpinner className="uploading-spinner" />
                          Завантаження...
                        </>
                      ) : (
                        <>
                          <FaFileUpload />
                          Додати файли
                        </>
                      )}
                    </label>
                    <small className="upload-hint">
                      Підтримувані формати: PDF, DOC, DOCX, TXT, ZIP, RAR (макс. 50MB на файл)
                    </small>
                  </div>
                  
                  {submissionFiles.length > 0 && (
                    <div className="uploaded-files">
                      {submissionFiles.map((file, index) => (
                        <div key={index} className="uploaded-file">
                          <div className="file-info">
                            <FaFileAlt />
                            <span>{file.name}</span>
                            <span className="file-size">({formatFileSize(file.size)})</span>
                          </div>
                          <button
                            onClick={() => handleRemoveFile(index)}
                            className="btn-remove"
                          >
                            <FaTimes />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="form-actions">
                  <button
                    onClick={() => {
                      setShowSubmitForm(false);
                      setSubmissionFiles([]);
                      setSubmissionComment('');
                      setError(null);
                    }}
                    className="btn-cancel"
                    disabled={submitting}
                  >
                    Скасувати
                  </button>
                  
                  <button
                    onClick={handleSubmitAssignment}
                    className="btn-confirm"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <FaSpinner className="spinner" />
                        Надсилання...
                      </>
                    ) : (
                      <>
                        <FaSave /> Надіслати
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
            
            {(isSubmitted || isGraded) && assignment.submission && (
              <div className="submitted-work">
                <div className="submission-info">
                  <div className="info-item">
                    <span className="info-label">Дата надсилання:</span>
                    <span className="info-value">
                      {formatDate(assignment.submission.submission_date)}
                    </span>
                  </div>
                  
                  {assignment.submission.comment && (
                    <div className="submission-comment">
                      <h3>Ваш коментар:</h3>
                      <p>{assignment.submission.comment}</p>
                    </div>
                  )}
                  
                  {assignment.submission.files && assignment.submission.files.length > 0 && (
                    <div className="submission-files">
                      <h3>Надіслані файли:</h3>
                      <div className="files-list">
                        {assignment.submission.files.map(file => (
                          <div key={file.id} className="file-item">
                            <div className="file-info">
                              <FaFileAlt />
                              <div>
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
                              <FaDownload />
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {isGraded && (
                    <div className="grading-section">
                      <div className="grade-info">
                        <span className="grade-label">Оцінка:</span>
                        <span className="grade-value">{assignment.submission.grade}</span>
                      </div>
                      
                      {assignment.submission.feedback && (
                        <div className="feedback-section">
                          <h3>Відгук викладача:</h3>
                          <p className="feedback-text">{assignment.submission.feedback}</p>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {assignment.status === 'returned' && (
                    <div className="returned-feedback">
                      <h3>Повернуто на доопрацювання:</h3>
                      <p className="feedback-text">{assignment.submission.feedback}</p>
                      
                      <div className="returned-actions">
                        <button
                          onClick={() => setShowSubmitForm(true)}
                          className="btn-resubmit"
                        >
                          <FaUndo /> Відправити знову
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {isSubmitted && !isGraded && (
                    <div className="submission-actions">
                      <button
                        onClick={handleCancelSubmission}
                        className="btn-cancel-submission"
                      >
                        <FaTimesCircle /> Скасувати надсилання
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}

export default StudentAssignmentDetail;