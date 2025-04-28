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
  ChevronDown 
} from 'lucide-react';
import API_URL from '../api';
import '../css/WorkingWithCourse.css';

function AssignmentDetails() {
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { assignmentId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/assignments/${assignmentId}/`, { withCredentials: true });
        setAssignment(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching assignment:", error);
        setError("Не вдалося завантажити завдання. Спробуйте знову.");
        setLoading(false);
      }
    };
    fetchAssignment();
  }, [assignmentId]);

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
      case 'assigned': return { label: 'Призначено', color: '#6c757d' };
      case 'submitted': return { label: 'Надіслано', color: '#007bff' };
      case 'graded': return { label: 'Оцінено', color: '#28a745' };
      case 'returned': return { label: 'Повернуто', color: '#ffc107' };
      default: return { label: status, color: '#6c757d' };
    }
  };

  const getTimeRemaining = (dueDate) => {
    if (!dueDate) return "Немає терміну";
    const due = new Date(dueDate);
    const now = new Date();
    if (due < now) return "Прострочено";
    const diffTime = Math.abs(due - now);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Сьогодні";
    if (diffDays === 1) return "Завтра";
    return `${diffDays} днів`;
  };

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

  if (error || !assignment) {
    return (
      <div className="course-wc-interface-container">
        <div className="course-wc-error-container">
          <div className="course-wc-error-icon">!</div>
          <h3>{error ? 'Помилка завантаження' : 'Завдання не знайдено'}</h3>
          <p>{error || 'Запитане завдання не знайдено. Можливо, його було видалено.'}</p>
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
          
          <div className="course-wc-content-header">
            <h2>{assignment.title}</h2>
            <div className="course-wc-content-meta">
              <span><ClipboardList className="course-wc-meta-icon" /> Завдання</span>
              <span 
                className="course-wc-assignment-status" 
                style={{ backgroundColor: statusInfo.color }}
              >
                {statusInfo.label}
              </span>
            </div>
          </div>

          <div className="course-wc-assignment-content">
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
                    new Date(assignment.due_date).toLocaleDateString('uk-UA') : 
                    'Немає терміну'
                  }</span>
                </div>
                <div className="course-wc-meta-item course-wc-time-remaining">
                  <Clock className="course-wc-meta-icon" />
                  <span>{timeRemaining}</span>
                </div>
                {assignment.status === 'graded' && (
                  <div className="course-wc-meta-item course-wc-grade">
                    <Award className="course-wc-meta-icon" />
                    <span>Оцінка: {assignment.grade}/100</span>
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
                    </a>
                  ))}
                </div>
              </div>
            )}

            <div className="course-wc-assignment-section">
              <h3>Надсилання</h3>
              <p>Тут буде форма для надсилання файлів або відповідей (реалізується окремо).</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AssignmentDetails;