import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../../api';
import TeacherHeader from './TeacherHeader';
import TeacherSidebar from './TeacherSidebar';
import '../../../css/TeacherCreateLesson.css';
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

function TeacherCreateLesson() {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    duration: 60,
    module_id: null
  });
  const [errors, setErrors] = useState({});
  const [module, setModule] = useState(null);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [createdLessonId, setCreatedLessonId] = useState(null);
  const [lessonFiles, setLessonFiles] = useState([]);
  const [tempFiles, setTempFiles] = useState([]); // Temporary storage for files before lesson creation
  const [lessonLinks, setLessonLinks] = useState([]);
  const [newLink, setNewLink] = useState('');
  const [fileUploading, setFileUploading] = useState(false);
  const { moduleId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const userRole = sessionStorage.getItem('userRole');
    
    if (userRole !== 'teacher') {
      navigate('/login');
      return;
    }

    const fetchModuleAndCourse = async () => {
      try {
        setLoading(true);
        
        // Fetch CSRF token
        await axios.get(`${API_URL}/get-csrf-token/`, { withCredentials: true });
        
        // Fetch module data
        const moduleResponse = await axios.get(`${API_URL}/modules/update/${moduleId}/`, {
          withCredentials: true
        });
        
        if (moduleResponse.data) {
          setModule(moduleResponse.data);
          
          // Set module_id in formData
          setFormData(prev => ({
            ...prev,
            module_id: parseInt(moduleId)
          }));
          
          // Fetch course data
          const courseResponse = await axios.get(`${API_URL}/courses/${moduleResponse.data.course}/`, {
            withCredentials: true
          });
          
          if (courseResponse.data) {
            setCourse(courseResponse.data);
          }
        } else {
          setErrors({
            general: 'Не вдалося отримати дані модуля'
          });
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Помилка отримання модуля та курсу:", error);
        setErrors({
          general: 'Не вдалося отримати дані модуля'
        });
        setLoading(false);
      }
    };

    fetchModuleAndCourse();
  }, [moduleId, navigate]);

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
    
    // Validate file size (e.g., max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      setErrors(prev => ({
        ...prev,
        fileUpload: 'Файл занадто великий. Максимальний розмір: 50MB'
      }));
      return;
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'video/mp4',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/zip',
      'application/x-rar-compressed'
    ];
    if (!allowedTypes.includes(file.type)) {
      setErrors(prev => ({
        ...prev,
        fileUpload: 'Непідтримуваний формат файлу. Дозволені: PDF, JPEG, PNG, MP4, DOC, DOCX, ZIP, RAR'
      }));
      return;
    }

    setFileUploading(true);
    
    try {
      if (createdLessonId) {
        // Upload file directly if lesson is created
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await axios.post(`${API_URL}/lessons/upload-file/${createdLessonId}/`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          withCredentials: true
        });
        
        if (response.data) {
          setLessonFiles(prev => [...prev, { ...response.data, name: file.name, type: file.type }]);
        }
      } else {
        // Store file temporarily if lesson is not yet created
        setTempFiles(prev => [...prev, { file, name: file.name, type: file.type, id: Date.now() }]);
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

  const handleRemoveFile = async (fileId, isTemp = false) => {
    try {
      if (!isTemp && createdLessonId) {
        // Delete file from server
        await axios.delete(`${API_URL}/lessons/delete-temp-file/${fileId}/`, {
          withCredentials: true
        });
        setLessonFiles(prev => prev.filter(file => file.id !== fileId));
      } else {
        // Remove temporary file
        setTempFiles(prev => prev.filter(file => file.id !== fileId));
      }
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

  const saveFilesAndLinks = async (lessonId) => {
    // Upload temporary files
    if (tempFiles.length > 0) {
      try {
        for (const tempFile of tempFiles) {
          const formData = new FormData();
          formData.append('file', tempFile.file);
          
          const response = await axios.post(`${API_URL}/lessons/upload-file/${lessonId}/`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            },
            withCredentials: true
          });
          
          if (response.data) {
            setLessonFiles(prev => [...prev, { ...response.data, name: tempFile.name, type: tempFile.type }]);
          }
        }
        setTempFiles([]); // Clear temporary files
      } catch (error) {
        console.error("Помилка підтвердження файлів:", error);
        throw new Error('Помилка при збереженні файлів');
      }
    }
    
    // Confirm uploaded files
    if (lessonFiles.length > 0 || tempFiles.length > 0) {
      try {
        await axios.post(`${API_URL}/lessons/confirm-temp-files/${lessonId}/`, {}, {
          withCredentials: true
        });
      } catch (error) {
        console.error("Помилка підтвердження файлів:", error);
        throw new Error('Помилка при збереженні файлів');
      }
    }
    
    // Save links
    if (lessonLinks.length > 0) {
      try {
        await axios.post(`${API_URL}/lessons/add-lesson-links/${lessonId}/`, {
          links: lessonLinks.map(link => link.url)
        }, {
          withCredentials: true
        });
      } catch (error) {
        console.error("Помилка додавання посилань:", error);
        throw new Error('Помилка при збереженні посилань');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setSubmitting(true);
    setErrors({});
    
    try {
      // Fetch CSRF token
      await axios.get(`${API_URL}/get-csrf-token/`, { withCredentials: true });
      
      // Create lesson
      const lessonResponse = await axios.post(`${API_URL}/lessons/create_lesson/`, formData, {
        withCredentials: true
      });
      
      if (lessonResponse.data && lessonResponse.data.id) {
        const lessonId = lessonResponse.data.id;
        setCreatedLessonId(lessonId);
        
        // Save files and links
        await saveFilesAndLinks(lessonId);
        
        setSuccess(true);
        
        // Redirect to course page after 2 seconds
        setTimeout(() => {
          navigate(`/teacher/courses/${course.id}`);
        }, 2000);
      } else {
        throw new Error('Не вдалося створити урок');
      }
    } catch (error) {
      console.error("Помилка створення уроку:", error);
      
      if (error.response && error.response.data) {
        setErrors({
          submit: error.response.data.message || 'Помилка при створенні уроку. Спробуйте знову.'
        });
      } else {
        setErrors({
          submit: error.message || 'Помилка при створенні уроку. Спробуйте знову.'
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(`/teacher/courses/${course?.id}`);
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
              <h2>Урок успішно створено!</h2>
              <p>Ви будете перенаправлені на сторінку курсу через кілька секунд...</p>
            </div>
          ) : (
            <>
              <div className="create-lesson-header">
                <button 
                  className="btn-back"
                  onClick={handleCancel}
                >
                  <FaArrowLeft /> До курсу
                </button>
                <h1>Новий урок для модуля "{module?.title}"</h1>
                <div className="course-path">
                  Курс: {course?.title} &gt; Модуль: {module?.title}
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
                  
                  <div className="form-group">
                    <label>
                      <FaFileAlt /> Завантажити файли
                    </label>
                    <div className="file-upload-container">
                      <input
                        type="file"
                        id="lesson-file"
                        onChange={handleFileUpload}
                        disabled={fileUploading}
                        accept=".pdf,.jpg,.jpeg,.png,.mp4,.doc,.docx,.zip,.rar"
                        style={{ display: 'none' }}
                      />
                      <button
                        type="button"
                        className="btn-upload"
                        onClick={() => document.getElementById('lesson-file').click()}
                        disabled={fileUploading}
                      >
                        {fileUploading ? (
                          <>
                            <FaSpinner className="spinner" />
                            Завантаження...
                          </>
                        ) : (
                          <>
                            <FaUpload /> Вибрати файл
                          </>
                        )}
                      </button>
                    </div>
                    {errors.fileUpload && <div className="error-text">{errors.fileUpload}</div>}
                    {(lessonFiles.length > 0 || tempFiles.length > 0) && (
                      <div className="file-list">
                        {[...lessonFiles, ...tempFiles].map(file => (
                          <div key={file.id} className="file-item">
                            <span className="file-icon">{getFileIcon(file.type)}</span>
                            <span className="file-name">{file.name}</span>
                            <button
                              type="button"
                              className="btn-remove"
                              onClick={() => handleRemoveFile(file.id, !lessonFiles.includes(file))}
                            >
                              <FaTrash />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="form-group">
                    <label>
                      <FaLink /> Додати посилання
                    </label>
                    <div className="link-input-container">
                      <input
                        type="url"
                        value={newLink}
                        onChange={(e) => setNewLink(e.target.value)}
                        className={errors.link ? 'error' : ''}
                        placeholder="Введіть URL посилання (наприклад, https://example.com)"
                      />
                      <button
                        type="button"
                        className="btn-add-link"
                        onClick={handleAddLink}
                      >
                        <FaPlus /> Додати
                      </button>
                    </div>
                    {errors.link && <div className="error-text">{errors.link}</div>}
                    {lessonLinks.length > 0 && (
                      <div className="link-list">
                        {lessonLinks.map(link => (
                          <div key={link.id} className="link-item">
                            <a href={link.url} target="_blank" rel="noopener noreferrer">
                              {link.url}
                            </a>
                            <button
                              type="button"
                              className="btn-remove"
                              onClick={() => handleRemoveLink(link.id)}
                            >
                              <FaTrash />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
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
                          <FaSave /> Зберегти урок
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

export default TeacherCreateLesson;