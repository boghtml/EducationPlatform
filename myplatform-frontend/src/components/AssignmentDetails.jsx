import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  FileText, 
  ClipboardList, 
  Calendar, 
  Clock, 
  Award, 
  Paperclip, 
  ChevronDown,
  Send,
  Upload,
  X,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Download,
  User,
  FileCheck,
  BookOpen
} from 'lucide-react';
import API_URL from '../api';
import '../css/WorkingWithCourse.css';

function AssignmentDetails() {
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submissionComment, setSubmissionComment] = useState('');
  const [submissionFiles, setSubmissionFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const { assignmentId } = useParams();
  const navigate = useNavigate();

  // Отримання CSRF-токену
  const getCsrfToken = async () => {
    try {
      const response = await axios.get(`${API_URL}/get-csrf-token/`, { withCredentials: true });
      if (response.data && response.data.csrftoken) {
        axios.defaults.headers.common['X-CSRFToken'] = response.data.csrftoken;
        return response.data.csrftoken;
      }
    } catch (error) {
      console.error('Помилка отримання CSRF токену:', error);
    }
    return null;
  };

  // Завантаження деталей завдання
  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        setLoading(true);
        await getCsrfToken();
        
        // Використовуємо новий ендпоінт для студентів
        const response = await axios.get(`${API_URL}/assignments/student/${assignmentId}/detail/`, { 
          withCredentials: true
        });
        
        setAssignment(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Помилка завантаження завдання:", error);
        const errorMessage = error.response?.data?.error || "Не вдалося завантажити завдання. Спробуйте знову.";
        setError(errorMessage);
        setLoading(false);
      }
    };
    
    fetchAssignment();
  }, [assignmentId]);

  // Обробник додавання файлів
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setSubmissionFiles(prev => [...prev, ...selectedFiles]);
  };

  // Видалення файлу з списку перед надсиланням
  const removeFile = (index) => {
    setSubmissionFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Відправка завдання
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (submissionFiles.length === 0) {
      setErrorMessage("Додайте хоча б один файл для подання");
      return;
    }
    
    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');
    
    try {
      await getCsrfToken();
      
      const formData = new FormData();
      formData.append('comment', submissionComment);
      submissionFiles.forEach(file => {
        formData.append('files', file);
      });
      
      const response = await axios.post(
        `${API_URL}/assignments/${assignmentId}/submit/`, 
        formData, 
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      setSuccessMessage("Завдання успішно надіслано!");
      setSubmissionComment('');
      setSubmissionFiles([]);
      
      // Оновлюємо статус завдання
      setAssignment(prev => ({
        ...prev,
        status: 'submitted',
        submission: {
          id: response.data.id || prev.id,
          comment: submissionComment,
          submission_date: new Date().toISOString(),
          files: response.data.files || []
        }
      }));
      
      // Прокручуємо до повідомлення про успіх
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error("Помилка відправлення завдання:", error);
      setErrorMessage(error.response?.data?.error || "Помилка при відправці завдання. Спробуйте знову.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Скасування подання
  const handleCancelSubmission = async () => {
    if (!window.confirm("Ви впевнені, що хочете скасувати подання? Усі файли будуть видалені.")) {
      return;
    }
    
    setIsCancelling(true);
    setErrorMessage('');
    setSuccessMessage('');
    
    try {
      await getCsrfToken();
      
      await axios.post(
        `${API_URL}/assignments/${assignmentId}/cancel_submission/`, 
        {}, 
        { withCredentials: true }
      );
      
      setSuccessMessage("Подання успішно скасовано!");
      
      // Оновлюємо статус завдання
      setAssignment(prev => ({
        ...prev,
        status: 'assigned',
        submission: null
      }));
      
      // Прокручуємо до повідомлення про успіх
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error("Помилка скасування подання:", error);
      setErrorMessage(error.response?.data?.error || "Помилка при скасуванні подання. Спробуйте знову.");
    } finally {
      setIsCancelling(false);
    }
  };

  // Допоміжні функції
  const getFileIcon = (fileType) => {
    if (!fileType) return <FileText className="course-wc-file-icon" />;
    const type = fileType.toLowerCase();
    if (type.includes('pdf')) return <FileText className="course-wc-file-icon" />;
    if (type.includes('doc')) return <FileText className="course-wc-file-icon" />;
    if (type.includes('vid') || type.includes('mp4')) return <FileText className="course-wc-file-icon" />;
    if (type.includes('xls') || type.includes('sheet')) return <FileText className="course-wc-file-icon" />;
    return <Paperclip className="course-wc-file-icon" />;
  };

  const getFilenameFromUrl = (url) => {
    if (!url) return "Файл";
    try {
      const decodedUrl = decodeURIComponent(url);
      return decodedUrl.split('/').pop();
    } catch (e) {
      return url.split('/').pop();
    }
  };

  const formatAssignmentStatus = (status) => {
    switch(status) {
      case 'assigned': 
        return { 
          label: 'Призначено', 
          color: '#6c757d', 
          icon: <ClipboardList size={16} />,
          description: 'Завдання призначено і очікує на виконання'
        };
      case 'submitted': 
        return { 
          label: 'Надіслано', 
          color: '#007bff', 
          icon: <CheckCircle size={16} />,
          description: 'Завдання надіслано на перевірку викладачу'
        };
      case 'graded': 
        return { 
          label: 'Оцінено', 
          color: '#28a745', 
          icon: <Award size={16} />,
          description: 'Завдання перевірено і оцінено викладачем'
        };
      case 'returned': 
        return { 
          label: 'Повернуто', 
          color: '#ffc107', 
          icon: <AlertTriangle size={16} />,
          description: 'Завдання повернуто викладачем з коментарями'
        };
      default: 
        return { 
          label: status, 
          color: '#6c757d', 
          icon: <ClipboardList size={16} />,
          description: 'Статус невідомий'
        };
    }
  };

  const getTimeRemaining = (dueDate) => {
    if (!dueDate) return { text: "Немає терміну", type: "none" };
    
    const due = new Date(dueDate);
    const now = new Date();
    
    if (due < now) {
      return { text: "Прострочено", type: "overdue" };
    }
    
    const diffTime = Math.abs(due - now);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return { text: "Сьогодні", type: "today" };
    } else if (diffDays === 1) {
      return { text: "Завтра", type: "tomorrow" };
    } else if (diffDays <= 3) {
      return { text: `${diffDays} днів`, type: "soon" };
    } else {
      return { text: `${diffDays} днів`, type: "normal" };
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Немає терміну";
    const date = new Date(dateString);
    return date.toLocaleDateString('uk-UA', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };
  
  const formatDateTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString('uk-UA', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Стани завантаження та помилки
  if (loading) {
    return (
      <div className="course-wc-interface-container">
        <div className="course-wc-loading-spinner">
          <div className="course-wc-spinner"></div>
          <p>Завантаження завдання...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="course-wc-interface-container">
        <div className="course-wc-error-container">
          <div className="course-wc-error-icon">!</div>
          <h3>Помилка завантаження</h3>
          <p>{error}</p>
          <button className="course-wc-btn-primary" onClick={() => navigate(-1)}>
            Повернутися назад
          </button>
        </div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="course-wc-interface-container">
        <div className="course-wc-error-container">
          <div className="course-wc-error-icon">?</div>
          <h3>Завдання не знайдено</h3>
          <p>Запитане завдання не знайдено. Можливо, його було видалено.</p>
          <button className="course-wc-btn-primary" onClick={() => navigate(-1)}>
            Повернутися назад
          </button>
        </div>
      </div>
    );
  }

  const statusInfo = formatAssignmentStatus(assignment.status);
  const timeRemaining = getTimeRemaining(assignment.due_date);

  return (
    <div className="course-wc-interface-container">
      <main className="course-wc-content">
        <div className="course-wc-assignment-details">
          <button 
            className="course-wc-back-button"
            onClick={() => navigate(-1)}
          >
            <ChevronDown className="course-wc-back-icon" /> Назад до курсу
          </button>
          
          {successMessage && (
            <div className="course-wc-success-message">
              <CheckCircle size={20} />
              <span>{successMessage}</span>
            </div>
          )}
          
          {errorMessage && (
            <div className="course-wc-error-message">
              <AlertTriangle size={20} />
              <span>{errorMessage}</span>
            </div>
          )}
          
          <div className="course-wc-content-header">
            <h2>{assignment.title}</h2>
            <div className="course-wc-content-meta">
              <span><ClipboardList className="course-wc-meta-icon" /> Завдання</span>
              <span><User className="course-wc-meta-icon" /> {assignment.teacher.first_name} {assignment.teacher.last_name}</span>
              <span><BookOpen className="course-wc-meta-icon" /> {assignment.course.title}</span>
            </div>
          </div>

          <div className="course-wc-assignment-content">
            <div className="course-wc-assignment-status-banner" style={{ borderColor: statusInfo.color }}>
              <div className="course-wc-status-icon" style={{ backgroundColor: statusInfo.color }}>
                {statusInfo.icon}
              </div>
              <div className="course-wc-status-info">
                <h4>Статус: {statusInfo.label}</h4>
                <p>{statusInfo.description}</p>
              </div>
            </div>
            
            <div className="course-wc-assignment-section">
              <h3>Опис завдання</h3>
              <p className="course-wc-assignment-description">{assignment.description || 'Немає опису.'}</p>
            </div>

            <div className="course-wc-assignment-section">
              <h3>Деталі</h3>
              <div className="course-wc-assignment-meta">
                <div className="course-wc-meta-item">
                  <Calendar className="course-wc-meta-icon" />
                  <span>Термін: {assignment.due_date ? 
                    formatDate(assignment.due_date) : 
                    'Немає терміну'
                  }</span>
                </div>
                {assignment.due_date && (
                  <div className={`course-wc-meta-item course-wc-time-remaining course-wc-time-${timeRemaining.type}`}>
                    <Clock className="course-wc-meta-icon" />
                    <span>{timeRemaining.text}</span>
                  </div>
                )}
                {assignment.status === 'graded' && assignment.submission && (
                  <div className="course-wc-meta-item course-wc-grade">
                    <Award className="course-wc-meta-icon" />
                    <span>Оцінка: {assignment.submission.grade}/100</span>
                  </div>
                )}
              </div>
            </div>

            {assignment.files && assignment.files.length > 0 && (
              <div className="course-wc-assignment-section">
                <h3>Матеріали завдання</h3>
                <div className="course-wc-files-list">
                  {assignment.files.map(file => (
                    <a 
                      key={file.id}
                      href={file.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="course-wc-file-item"
                    >
                      {getFileIcon(file.file_type)}
                      <div className="course-wc-file-info">
                        <span className="course-wc-file-name">{file.file_name || getFilenameFromUrl(file.file_url)}</span>
                        <span className="course-wc-file-type">{file.file_type?.toUpperCase() || 'FILE'} • {((file.file_size || 0) / 1024 / 1024).toFixed(2)} MB</span>
                      </div>
                      <Download size={18} className="course-wc-file-download" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {assignment.links && assignment.links.length > 0 && (
              <div className="course-wc-assignment-section">
                <h3>Посилання</h3>
                <div className="course-wc-links-list">
                  {assignment.links.map(link => (
                    <a 
                      key={link.id}
                      href={link.link_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="course-wc-link-item"
                    >
                      <ExternalLink className="course-wc-file-icon" />
                      <div className="course-wc-file-info">
                        <span className="course-wc-file-name">{link.description || link.link_url}</span>
                        <span className="course-wc-file-type">Зовнішнє посилання</span>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Відображення надісланих файлів */}
            {['submitted', 'graded', 'returned'].includes(assignment.status) && assignment.submission && (
              <div className="course-wc-assignment-section">
                <h3>Ваша робота</h3>
                
                {assignment.submission.comment && (
                  <div className="course-wc-submission-comment">
                    <h4>Ваш коментар:</h4>
                    <p>{assignment.submission.comment}</p>
                  </div>
                )}
                
                {assignment.submission.files && assignment.submission.files.length > 0 ? (
                  <div className="course-wc-files-list">
                    {assignment.submission.files.map(file => (
                      <a 
                        key={file.id}
                        href={file.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="course-wc-file-item course-wc-submission-file"
                      >
                        {getFileIcon(file.file_type)}
                        <div className="course-wc-file-info">
                          <span className="course-wc-file-name">{file.file_name || getFilenameFromUrl(file.file_url)}</span>
                          <span className="course-wc-file-type">{file.file_type?.toUpperCase() || 'FILE'} • {((file.file_size || 0) / 1024 / 1024).toFixed(2)} MB</span>
                        </div>
                        <Download size={18} className="course-wc-file-download" />
                      </a>
                    ))}
                  </div>
                ) : (
                  <p>Немає надісланих файлів.</p>
                )}
                
                {assignment.submission.submission_date && (
                  <div className="course-wc-submission-date">
                    <p>Надіслано: {formatDateTime(assignment.submission.submission_date)}</p>
                  </div>
                )}
                
                {(assignment.status === 'submitted') && (
                  <div className="course-wc-submission-actions">
                    <button 
                      className="course-wc-btn-cancel-submission" 
                      onClick={handleCancelSubmission}
                      disabled={isCancelling}
                    >
                      {isCancelling ? (
                        <>
                          <RefreshCw className="course-wc-button-icon animate-spin" size={16} />
                          <span>Скасування...</span>
                        </>
                      ) : (
                        <>
                          <X className="course-wc-button-icon" size={16} />
                          <span>Скасувати подання</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}
            
            {/* Форма надсилання завдання */}
            {assignment.status === 'assigned' && (
              <div className="course-wc-assignment-section">
                <h3>Надіслати роботу</h3>
                <form onSubmit={handleSubmit} className="course-wc-submission-form">
                  <div className="course-wc-form-group">
                    <label htmlFor="submission-comment">Коментар (необов'язково):</label>
                    <textarea
                      id="submission-comment"
                      className="course-wc-submission-comment-input"
                      placeholder="Додайте коментар до вашого подання..."
                      value={submissionComment}
                      onChange={(e) => setSubmissionComment(e.target.value)}
                    />
                  </div>
                  
                  <div className="course-wc-form-group">
                    <label>Завантажте файли:</label>
                    <div className="course-wc-file-upload-container">
                      <label className="course-wc-file-upload-label">
                        <Upload className="course-wc-upload-icon" size={20} />
                        <span>Виберіть файли</span>
                        <input 
                          type="file" 
                          multiple 
                          onChange={handleFileChange} 
                          className="course-wc-file-input" 
                        />
                      </label>
                    </div>
                    
                    {submissionFiles.length > 0 && (
                      <div className="course-wc-uploaded-files">
                        <h4>Вибрані файли:</h4>
                        <ul className="course-wc-uploaded-files-list">
                          {submissionFiles.map((file, index) => (
                            <li key={index} className="course-wc-uploaded-file-item">
                              <div className="course-wc-uploaded-file-info">
                                <Paperclip size={16} className="course-wc-uploaded-file-icon" />
                                <span className="course-wc-uploaded-file-name">{file.name}</span>
                                <span className="course-wc-uploaded-file-size">
                                  {(file.size / 1024 / 1024).toFixed(2)} MB
                                </span>
                              </div>
                              <button 
                                type="button" 
                                className="course-wc-remove-file-btn"
                                onClick={() => removeFile(index)}
                              >
                                <X size={16} />
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  
                  <div className="course-wc-form-actions">
                    <button 
                      type="submit" 
                      className="course-wc-btn-submit" 
                      disabled={isSubmitting || submissionFiles.length === 0}
                    >
                      {isSubmitting ? (
                        <>
                          <RefreshCw className="course-wc-button-icon animate-spin" size={16} />
                          <span>Надсилання...</span>
                        </>
                      ) : (
                        <>
                          <Send className="course-wc-button-icon" size={16} />
                          <span>Надіслати роботу</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Відображення оцінки і зворотнього зв'язку */}
            {assignment.status === 'graded' && assignment.submission && (
              <div className="course-wc-assignment-section course-wc-grade-section">
                <h3>Оцінка та зворотній зв'язок</h3>
                <div className="course-wc-grade-container">
                  <div className="course-wc-grade-circle">
                    <span className="course-wc-grade-value">{assignment.submission.grade}</span>
                    <span className="course-wc-grade-total">/100</span>
                  </div>
                  
                  <div className="course-wc-feedback">
                    <h4>Відгук викладача:</h4>
                    <div className="course-wc-feedback-content">
                      {assignment.submission.feedback || 'Коментарі відсутні.'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Відображення зворотнього зв'язку для повернутих завдань */}
            {assignment.status === 'returned' && assignment.submission && (
              <div className="course-wc-assignment-section course-wc-feedback-section">
                <h3>Зворотній зв'язок від викладача</h3>
                <div className="course-wc-feedback">
                  <div className="course-wc-feedback-content">
                    {assignment.submission.feedback || 'Коментарі відсутні.'}
                  </div>
                </div>
                
                <div className="course-wc-returned-actions">
                  <button 
                    className="course-wc-btn-resubmit" 
                    onClick={handleCancelSubmission}
                    disabled={isCancelling}
                  >
                    {isCancelling ? (
                      <>
                        <RefreshCw className="course-wc-button-icon animate-spin" size={16} />
                        <span>Скасування...</span>
                      </>
                    ) : (
                      <>
                        <RefreshCw className="course-wc-button-icon" size={16} />
                        <span>Скасувати подання і відправити знову</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default AssignmentDetails;