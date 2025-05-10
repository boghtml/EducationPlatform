import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../../api';
import TeacherHeader from './TeacherHeader';
import TeacherSidebar from './TeacherSidebar';
import { 
  FaBookOpen,
  FaFileAlt,
  FaLink,
  FaClock,
  FaCalendar,
  FaEdit,
  FaTrash,
  FaSpinner,
  FaExclamationTriangle,
  FaArrowLeft
} from 'react-icons/fa';
import '../../css/teacher/TeacherLessonDetail.css';

function TeacherLessonDetail() {
  const [lesson, setLesson] = useState(null);
  const [moduleId, setModuleId] = useState(null);
  const [files, setFiles] = useState([]);
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { lessonId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const userRole = sessionStorage.getItem('userRole');
    if (userRole !== 'teacher') {
      navigate('/login');
      return;
    }

    const fetchLessonDetails = async () => {
      try {
        setLoading(true);
        await axios.get(`${API_URL}/get-csrf-token/`, { withCredentials: true });
          // Fetch lesson details
        const lessonResponse = await axios.get(`${API_URL}/lessons/${lessonId}/`, {
          withCredentials: true
        });

        // Store the moduleId from the lesson response
        if (lessonResponse.data && lessonResponse.data.module) {
          setModuleId(lessonResponse.data.module);
        }

        // Fetch lesson files
        const filesResponse = await axios.get(`${API_URL}/lessons/${lessonId}/files/`, {
          withCredentials: true
        });

        // Fetch lesson links
        const linksResponse = await axios.get(`${API_URL}/lessons/${lessonId}/links/`, {
          withCredentials: true
        });

        setLesson(lessonResponse.data);
        setFiles(filesResponse.data);
        setLinks(linksResponse.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching lesson details:', error);
        setError('Не вдалося завантажити дані уроку');
        setLoading(false);
      }
    };

    fetchLessonDetails();
  }, [lessonId, navigate]);

  const handleEdit = () => {
    navigate(`/teacher/lessons/${lessonId}/edit`);
  };

  const handleDelete = async () => {
    if (window.confirm('Ви впевнені, що хочете видалити цей урок?')) {
      try {
        await axios.get(`${API_URL}/get-csrf-token/`, { withCredentials: true });
        await axios.delete(`${API_URL}/lessons/lesson/delete/${lessonId}/`, {
          withCredentials: true
        });
        navigate(`/teacher/modules/${lesson.module.id}`);
      } catch (error) {
        console.error('Error deleting lesson:', error);
        setError('Не вдалося видалити урок');
      }
    }
  };

  const handleFilesManage = () => {
    navigate(`/teacher/lessons/${lessonId}/files`);
  };

  const handleLinksManage = () => {
    navigate(`/teacher/lessons/${lessonId}/links`);
  };

  if (loading) {
    return (
      <div className="teacher-lesson-detail-wrapper">
        <TeacherHeader />
        <div className="teacher-lesson-detail-container">
          <TeacherSidebar />
          <div className="teacher-lesson-detail-content">
            <div className="loading-container">
              <FaSpinner className="spinner" />
              <p>Завантаження даних уроку...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="teacher-lesson-detail-wrapper">
        <TeacherHeader />
        <div className="teacher-lesson-detail-container">
          <TeacherSidebar />
          <div className="teacher-lesson-detail-content">
            <div className="error-container">
              <FaExclamationTriangle className="error-icon" />
              <h2>Помилка</h2>
              <p>{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="teacher-lesson-detail-wrapper">
      <TeacherHeader />
      <div className="teacher-lesson-detail-container">
        <TeacherSidebar />
        <div className="teacher-lesson-detail-content">
          <div className="lesson-detail-header">            <button
              className="btn-back"
              onClick={() => moduleId ? navigate(`/teacher/modules/${moduleId}`) : null}
            >
              <FaArrowLeft /> До модуля
            </button>
            
            <div className="lesson-actions">
              <button className="btn-edit" onClick={handleEdit}>
                <FaEdit /> Редагувати
              </button>
              <button className="btn-delete" onClick={handleDelete}>
                <FaTrash /> Видалити
              </button>
              <button className="btn-files" onClick={handleFilesManage}>
                <FaFileAlt /> Управління файлами
              </button>
              <button className="btn-links" onClick={handleLinksManage}>
                <FaLink /> Управління посиланнями
              </button>
            </div>
          </div>

          <div className="lesson-info">
            <h1><FaBookOpen /> {lesson.title}</h1>
            
            <div className="lesson-meta">
              <span><FaClock /> {lesson.duration} хвилин</span>
              <span><FaCalendar /> Створено: {new Date(lesson.created_at).toLocaleDateString('uk-UA')}</span>
              <span><FaCalendar /> Оновлено: {new Date(lesson.updated_at).toLocaleDateString('uk-UA')}</span>
            </div>

            <div className="lesson-content">
              <h3>Зміст уроку</h3>
              <p>{lesson.content}</p>
            </div>

            {files.length > 0 && (
              <div className="lesson-files">
                <h3><FaFileAlt /> Файли</h3>
                <div className="files-list">
                  {files.map(file => (
                    <div key={file.id} className="file-item">
                      <a href={file.file_url} target="_blank" rel="noopener noreferrer">
                        {file.file_url.split('/').pop()}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {links.length > 0 && (
              <div className="lesson-links">
                <h3><FaLink /> Посилання</h3>
                <div className="links-list">
                  {links.map(link => (
                    <div key={link.id} className="link-item">
                      <a href={link.link_url} target="_blank" rel="noopener noreferrer">
                        {link.description || link.link_url}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TeacherLessonDetail;
