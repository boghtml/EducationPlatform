import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../../api';
import TeacherSidebar from './TeacherSidebar';
import TeacherHeader from './TeacherHeader';
import '../../css/teacher/TeacherCreateAssignment.css';
import { 
  FaPlus, 
  FaGraduationCap,
  FaCalendarAlt, 
  FaFileUpload, 
  FaLink, 
  FaTrash, 
  FaSpinner, 
  FaExclamationTriangle,
  FaSave,
  FaTimes,
  FaFileAlt,
  FaEyeSlash
} from 'react-icons/fa';

function TeacherCreateAssignment() {
  const navigate = useNavigate();
  const { courseId } = useParams();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    due_date: '',
    course: courseId || ''
  });
  
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [tempFiles, setTempFiles] = useState([]);
  const [links, setLinks] = useState([]);
  const [newLink, setNewLink] = useState('');
  const [uploading, setUploading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      await axios.get(`${API_URL}/get-csrf-token/`, { withCredentials: true });
      
      const response = await axios.get(`${API_URL}/courses/`, {
        withCredentials: true,
        params: { teacher_id: sessionStorage.getItem('userId') }
      });
      
      if (response.data) {
        setCourses(response.data);
      }
      
      if (courseId && response.data) {
        const course = response.data.find(c => c.id === parseInt(courseId));
        if (course) {
          setFormData(prev => ({ ...prev, course: courseId }));
        }
      }
      
      setLoading(false);
    } catch (error) {
      console.error("Error fetching courses:", error);
      setError("Не вдалося завантажити курси. Будь ласка, спробуйте пізніше.");
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.title.trim()) {
      errors.title = 'Назва завдання обов\'язкова';
    }
    
    if (!formData.course) {
      errors.course = 'Оберіть курс';
    }
    
    if (formData.due_date) {
      const dueDate = new Date(formData.due_date);
      const now = new Date();
      
      if (dueDate < now) {
        errors.due_date = 'Дедлайн не може бути в минулому';
      }
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      setError('Розмір файлу не повинен перевищувати 50MB');
      return;
    }

    if (!formData.course) {
      setError('Спочатку оберіть курс');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      let assignmentId;
      
      if (!assignmentId) {
        console.log('Temporarily storing file...');
        const tempFile = {
          id: Date.now(),
          name: file.name,
          size: file.size,
          type: file.type,
          file: file,
          uploaded: false
        };
        
        setTempFiles(prev => [...prev, tempFile]);
        
        event.target.value = '';
        setUploading(false);
        return;
      }

      const formDataFile = new FormData();
      formDataFile.append('file', file);

      const response = await axios.post(
        `${API_URL}/assignments/${assignmentId}/upload-file/`,
        formDataFile,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      setUploadedFiles(prev => [...prev, response.data]);
      
    } catch (error) {
      console.error("Error uploading file:", error);
      setError('Помилка при завантаженні файлу: ' + (error.response?.data?.error || error.message));
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const deleteTempFile = (fileId) => {
    setTempFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const addLink = () => {
    if (!newLink.trim()) return;
    
    try {
      new URL(newLink);
    } catch {
      setError('Введіть коректний URL');
      return;
    }
    
    const link = {
      id: Date.now(),
      link_url: newLink.trim(),
      description: ''
    };
    
    setLinks(prev => [...prev, link]);
    setNewLink('');
  };

  const deleteLink = (linkId) => {
    setLinks(prev => prev.filter(link => link.id !== linkId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setSubmitting(true);
    setError(null);
    
    try {
      const assignmentResponse = await axios.post(
        `${API_URL}/assignments/`,
        {
          ...formData,
          course: parseInt(formData.course)
        },
        { withCredentials: true }
      );
      
      const assignmentId = assignmentResponse.data.id;
      
      for (const tempFile of tempFiles) {
        const formDataFile = new FormData();
        formDataFile.append('file', tempFile.file);
        
        await axios.post(
          `${API_URL}/assignments/${assignmentId}/upload-file/`,
          formDataFile,
          {
            withCredentials: true,
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }
        );
      }
      
      if (tempFiles.length > 0) {
        await axios.post(
          `${API_URL}/assignments/${assignmentId}/confirm-files/`,
          {},
          { withCredentials: true }
        );
      }
      
      if (links.length > 0) {
        await axios.post(
          `${API_URL}/assignments/${assignmentId}/add-links/`,
          {
            links: links.map(link => link.link_url)
          },
          { withCredentials: true }
        );
      }
      
      navigate(`/teacher/courses/${formData.course}/assignments`);
      
    } catch (error) {
      console.error("Error creating assignment:", error);
      setError('Помилка при створенні завдання: ' + (error.response?.data?.error || error.message));
    } finally {
      setSubmitting(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="create-assignment-wrapper">
        <TeacherHeader />
        <div className="create-assignment-container">
          <TeacherSidebar />
          <div className="create-assignment-loading">
            <FaSpinner className="loading-spinner" />
            <p>Завантаження даних...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="create-assignment-wrapper">
      <TeacherHeader />
      
      <div className="create-assignment-container">
        <TeacherSidebar />
        
        <div className="create-assignment-content">
          <div className="create-assignment-header">
            <h1>Створення нового завдання</h1>
            <button
              type="button"
              className="btn-cancel"
              onClick={() => navigate(-1)}
            >
              <FaTimes /> Скасувати
            </button>
          </div>
          
          {error && (
            <div className="error-message">
              <FaExclamationTriangle />
              <span>{error}</span>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="create-assignment-form">
            <div className="form-section">
              <h2>Основна інформація</h2>
              
              <div className="form-group">
                <label htmlFor="title">
                  Назва завдання *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className={validationErrors.title ? 'error' : ''}
                  placeholder="Введіть назву завдання"
                  required
                />
                {validationErrors.title && (
                  <span className="field-error">{validationErrors.title}</span>
                )}
              </div>
              
              <div className="form-group">
                <label htmlFor="course">
                  <FaGraduationCap /> Курс *
                </label>
                <select
                  id="course"
                  name="course"
                  value={formData.course}
                  onChange={handleChange}
                  className={validationErrors.course ? 'error' : ''}
                  required
                >
                  <option value="">Оберіть курс</option>
                  {courses.map(course => (
                    <option key={course.id} value={course.id}>
                      {course.title}
                    </option>
                  ))}
                </select>
                {validationErrors.course && (
                  <span className="field-error">{validationErrors.course}</span>
                )}
              </div>
              
              <div className="form-group">
                <label htmlFor="description">
                  Опис завдання
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Введіть опис завдання (опціонально)"
                  rows="4"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="due_date">
                  <FaCalendarAlt /> Дедлайн
                </label>
                <input
                  type="datetime-local"
                  id="due_date"
                  name="due_date"
                  value={formData.due_date}
                  onChange={handleChange}
                  className={validationErrors.due_date ? 'error' : ''}
                />
                {validationErrors.due_date && (
                  <span className="field-error">{validationErrors.due_date}</span>
                )}
                <small className="field-hint">
                  Залиште порожнім, якщо дедлайн не потрібен
                </small>
              </div>
            </div>
            
            <div className="form-section">
              <h2>Матеріали завдання</h2>
              
              <div className="upload-section">
                <h3>Файли</h3>
                
                <div className="upload-zone">
                  <input
                    type="file"
                    id="file-upload"
                    onChange={handleFileUpload}
                    accept=".pdf,.doc,.docx,.mp4,.avi,.mov"
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
                        Додати файл
                      </>
                    )}
                  </label>
                  <small className="upload-hint">
                    Підтримувані формати: PDF, DOC, DOCX, MP4, AVI, MOV (макс. 50MB)
                  </small>
                </div>
                
                {tempFiles.length > 0 && (
                  <div className="files-list">
                    <h4>Завантажені файли:</h4>
                    {tempFiles.map(file => (
                      <div key={file.id} className="file-item temp">
                        <div className="file-info">
                          <div className="file-icon">
                            <FaFileAlt />
                          </div>
                          <div className="file-details">
                            <span className="file-name">{file.name}</span>
                            <span className="file-size">{formatFileSize(file.size)}</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          className="btn-delete-file"
                          onClick={() => deleteTempFile(file.id)}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="links-section">
                <h3>Посилання</h3>
                
                <div className="add-link-form">
                  <div className="link-input-group">
                    <FaLink className="link-icon" />
                    <input
                      type="url"
                      value={newLink}
                      onChange={(e) => setNewLink(e.target.value)}
                      placeholder="Введіть URL посилання"
                      className="link-input"
                    />
                    <button
                      type="button"
                      onClick={addLink}
                      className="btn-add-link"
                      disabled={!newLink.trim()}
                    >
                      <FaPlus /> Додати
                    </button>
                  </div>
                </div>
                
                {links.length > 0 && (
                  <div className="links-list">
                    <h4>Додані посилання:</h4>
                    {links.map(link => (
                      <div key={link.id} className="link-item">
                        <div className="link-info">
                          <FaLink className="link-icon" />
                          <a 
                            href={link.link_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="link-url"
                          >
                            {link.link_url}
                          </a>
                        </div>
                        <button
                          type="button"
                          className="btn-delete-link"
                          onClick={() => deleteLink(link.id)}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div className="form-actions">
              <button
                type="button"
                className="btn-cancel"
                onClick={() => navigate(-1)}
                disabled={submitting}
              >
                <FaTimes /> Скасувати
              </button>
              
              <button
                type="submit"
                className="btn-submit"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <FaSpinner className="submitting-spinner" />
                    Створення...
                  </>
                ) : (
                  <>
                    <FaSave /> Створити завдання
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default TeacherCreateAssignment;