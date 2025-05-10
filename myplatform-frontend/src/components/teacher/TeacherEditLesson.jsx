import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../../api';
import TeacherHeader from './TeacherHeader';
import TeacherSidebar from './TeacherSidebar';
import '../../css/teacher/TeacherCreateLesson.css';
import { 
  FaBookOpen, 
  FaFileAlt, 
  FaLink, 
  FaClipboard, 
  FaClock,
  FaSpinner, 
  FaExclamationTriangle,
  FaArrowLeft,
  FaCheck,
  FaSave,
  FaTimes,
  FaPlus,
  FaTrash,
  FaUpload,
  FaFile,
  FaFilePdf,
  FaFileVideo,
  FaFileWord,
  FaFileArchive,
  FaImage
} from 'react-icons/fa';

function TeacherEditLesson() {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    duration: 60,
    module_id: null
  });
  const [errors, setErrors] = useState({});
  const [module, setModule] = useState(null);
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [lessonFiles, setLessonFiles] = useState([]);
  const [tempFiles, setTempFiles] = useState([]);
  const [lessonLinks, setLessonLinks] = useState([]);
  const [newLink, setNewLink] = useState('');
  const [fileUploading, setFileUploading] = useState(false);
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
        
        const lessonResponse = await axios.get(`${API_URL}/lessons/${lessonId}/`, {
          withCredentials: true
        });
        
        if (lessonResponse.data) {
          const lessonData = lessonResponse.data;
          setLesson(lessonData);
          setFormData({
            title: lessonData.title,
            content: lessonData.content,
            duration: lessonData.duration,
            module_id: lessonData.module
          });
          setLessonFiles(lessonData.files || []);
          setLessonLinks(lessonData.links || []);
          setModule(lessonData.module);
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching lesson details:", error);
        setLoading(false);
        setErrors({
          general: 'Не вдалося завантажити дані уроку'
        });
      }
    };

    fetchLessonDetails();
  }, [lessonId, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: name === 'duration' ? parseInt(value) || '' : value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    
    if (!file) return;
    
    if (file.size > 50 * 1024 * 1024) {
      setErrors(prev => ({
        ...prev,
        fileUpload: 'Файл занадто великий. Максимальний розмір: 50MB'
      }));
      return;
    }

    setFileUploading(true);
    
    try {
      await axios.get(`${API_URL}/get-csrf-token/`, { withCredentials: true });
      
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await axios.post(`${API_URL}/lessons/upload-file/${lessonId}/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        withCredentials: true
      });
      
      if (response.data) {
        setLessonFiles(prev => [...prev, { ...response.data, name: file.name, type: file.type }]);
      }
    } catch (error) {
      console.error("Помилка завантаження файлу:", error);
      setErrors(prev => ({
        ...prev,
        fileUpload: 'Помилка при завантаженні файлу'
      }));
    } finally {
      setFileUploading(false);
    }
  };

  const handleRemoveFile = async (fileId) => {
    try {
      await axios.get(`${API_URL}/get-csrf-token/`, { withCredentials: true });
      
      await axios.delete(`${API_URL}/lessons/delete-file/${fileId}/`, {
        withCredentials: true
      });
      
      setLessonFiles(prev => prev.filter(file => file.id !== fileId));
    } catch (error) {
      console.error("Помилка видалення файлу:", error);
      setErrors(prev => ({
        ...prev,
        fileRemove: 'Помилка при видаленні файлу'
      }));
    }
  };

  const handleAddLink = () => {
    if (!newLink.trim()) {
      setErrors(prev => ({
        ...prev,
        link: 'Введіть URL посилання'
      }));
      return;
    }
    
    try {
      new URL(newLink);
      setLessonLinks(prev => [...prev, { url: newLink, id: Date.now() }]);
      setNewLink('');
      if (errors.link) {
        setErrors(prev => ({
          ...prev,
          link: ''
        }));
      }
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        link: 'Введіть коректний URL'
      }));
    }
  };

  const handleRemoveLink = (id) => {
    setLessonLinks(prev => prev.filter(link => link.id !== id));
  };

  const getFileIcon = (fileType) => {
    if (!fileType) return <FaFile />;
    
    const type = fileType.toLowerCase();
    
    if (type.includes('pdf')) return <FaFilePdf />;
    if (type.includes('video') || type.includes('mp4')) return <FaFileVideo />;
    if (type.includes('word') || type.includes('doc')) return <FaFileWord />;
    if (type.includes('zip') || type.includes('rar')) return <FaFileArchive />;
    if (type.includes('image') || type.includes('jpg') || type.includes('png')) return <FaImage />;
    
    return <FaFile />;
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = "Назва уроку обов'язкова";
    }
    
    if (!formData.content.trim()) {
      newErrors.content = "Контент уроку обов'язковий";
    }
    
    if (!formData.duration || formData.duration <= 0) {
      newErrors.duration = 'Тривалість уроку має бути більше 0 хвилин';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setSubmitting(true);
    
    try {
      await axios.get(`${API_URL}/get-csrf-token/`, { withCredentials: true });
        await axios.put(`${API_URL}/lessons/lesson/update/${lessonId}/`, {
        ...formData,
        links: lessonLinks.map(link => link.url)
      }, {
        withCredentials: true
      });
      
      setSuccess(true);
      setTimeout(() => {
        navigate(`/teacher/modules/${module.id}`);
      }, 2000);
      
    } catch (error) {
      console.error("Error updating lesson:", error);
      setErrors(prev => ({
        ...prev,
        submit: 'Не вдалося оновити урок. Будь ласка, спробуйте пізніше.'
      }));
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(`/teacher/modules/${module?.id}`);
  };

  if (loading) {
    return (
      <div className="teacher-create-lesson-wrapper">
        <TeacherHeader />
        <div className="teacher-create-lesson-container">
          <TeacherSidebar />
          <div className="teacher-create-lesson-content">
            <div className="loading-container">
              <FaSpinner className="spinner" />
              <p>Завантаження даних...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (errors.general) {
    return (
      <div className="teacher-create-lesson-wrapper">
        <TeacherHeader />
        <div className="teacher-create-lesson-container">
          <TeacherSidebar />
          <div className="teacher-create-lesson-content">
            <div className="error-container">
              <FaExclamationTriangle className="error-icon" />
              <h2>Помилка</h2>
              <p>{errors.general}</p>
              <button 
                className="btn-primary"
                onClick={() => navigate(`/teacher/courses`)}
              >
                Повернутися до списку курсів
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="teacher-create-lesson-wrapper">
      <TeacherHeader />
      <div className="teacher-create-lesson-container">
        <TeacherSidebar />
        <div className="teacher-create-lesson-content">
          {success ? (
            <div className="success-container">
              <div className="success-icon">
                <FaCheck />
              </div>
              <h2>Урок успішно оновлено!</h2>
              <p>Ви будете перенаправлені на сторінку модуля через кілька секунд...</p>
            </div>
          ) : (
            <>
              <div className="create-lesson-header">
                <button 
                  className="btn-back"
                  onClick={handleCancel}
                >
                  <FaArrowLeft /> До модуля
                </button>
                <h1>Редагування уроку</h1>
                <div className="course-path">
                  Курс: {module?.course?.title} &gt; Модуль: {module?.title}
                </div>
              </div>
              
              <div className="create-lesson-form-container">
                {errors.submit && (
                  <div className="error-message">
                    <FaExclamationTriangle />
                    <span>{errors.submit}</span>
                  </div>
                )}
                
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label htmlFor="title">
                      <FaBookOpen /> Назва уроку
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className={errors.title ? 'error' : ''}
                      placeholder="Введіть назву уроку"
                    />
                    {errors.title && <div className="error-text">{errors.title}</div>}
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="content">
                      <FaClipboard /> Контент уроку
                    </label>
                    <textarea
                      id="content"
                      name="content"
                      value={formData.content}
                      onChange={handleInputChange}
                      className={errors.content ? 'error' : ''}
                      placeholder="Опишіть зміст уроку..."
                      rows="10"
                    />
                    {errors.content && <div className="error-text">{errors.content}</div>}
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="duration">
                      <FaClock /> Тривалість (хвилини)
                    </label>
                    <input
                      type="number"
                      id="duration"
                      name="duration"
                      value={formData.duration}
                      onChange={handleInputChange}
                      className={errors.duration ? 'error' : ''}
                      min="1"
                      placeholder="Введіть тривалість уроку в хвилинах"
                    />
                    {errors.duration && <div className="error-text">{errors.duration}</div>}
                  </div>
                  
                  <div className="form-actions">
                    <button
                      type="submit"
                      className="btn-submit"
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <FaSpinner className="spinner" />
                          Збереження...
                        </>
                      ) : (
                        <>
                          <FaSave /> Зберегти зміни
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      className="btn-cancel"
                      onClick={handleCancel}
                    >
                      <FaTimes /> Скасувати
                    </button>
                  </div>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default TeacherEditLesson;