import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../../api';
import TeacherSidebar from './TeacherSidebar';
import TeacherHeader from './TeacherHeader';
import '../../css/teacher/TeacherEditAssignment.css';
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
  FaDownload,
  FaExternalLinkAlt
} from 'react-icons/fa';

function TeacherEditAssignment() {
  const navigate = useNavigate();
  const { assignmentId } = useParams();
  
  const [assignment, setAssignment] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    due_date: '',
    course: ''
  });
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [existingFiles, setExistingFiles] = useState([]);
  const [tempFiles, setTempFiles] = useState([]);
  const [existingLinks, setExistingLinks] = useState([]);
  const [newLinks, setNewLinks] = useState([]);
  const [newLink, setNewLink] = useState('');
  const [uploading, setUploading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [deletingFile, setDeletingFile] = useState(null);
  const [deletingLink, setDeletingLink] = useState(null);

  useEffect(() => {
    fetchAssignmentData();
  }, [assignmentId]);

  const fetchAssignmentData = async () => {
    try {
      setLoading(true);
      
      const assignmentResponse = await axios.get(
        `${API_URL}/assignments/${assignmentId}/`,
        { withCredentials: true }
      );
      
      const assignmentData = assignmentResponse.data;
      setAssignment(assignmentData);
      
      const dueDate = assignmentData.due_date ? 
        new Date(assignmentData.due_date).toISOString().slice(0, 16) : '';
      
      setFormData({
        title: assignmentData.title || '',
        description: assignmentData.description || '',
        due_date: dueDate,
        course: assignmentData.course
      });
      
      if (assignmentData.files) {
        setExistingFiles(assignmentData.files);
      }
      
      if (assignmentData.links) {
        setExistingLinks(assignmentData.links);
      }
      
      setLoading(false);
    } catch (error) {
      console.error("Error fetching assignment data:", error);
      setError("Не вдалося завантажити дані про завдання");
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.title.trim()) {
      errors.title = 'Назва завдання обов\'язкова';
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

    setUploading(true);
    setError(null);

    try {
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

      setTempFiles(prev => [...prev, response.data]);
      
    } catch (error) {
      console.error("Error uploading file:", error);
      setError('Помилка при завантаженні файлу: ' + (error.response?.data?.error || error.message));
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const deleteExistingFile = async (fileId) => {
    setDeletingFile(fileId);
    try {
      await axios.delete(
        `${API_URL}/assignments/files_confirm/${fileId}/delete/`,
        { withCredentials: true }
      );
      
      setExistingFiles(prev => prev.filter(file => file.id !== fileId));
    } catch (error) {
      console.error("Error deleting file:", error);
      setError('Помилка при видаленні файлу');
    } finally {
      setDeletingFile(null);
    }
  };

  const deleteTempFile = async (fileId) => {
    setDeletingFile(fileId);
    try {
      await axios.delete(
        `${API_URL}/assignments/files/${fileId}/delete/`,
        { withCredentials: true }
      );
      
      setTempFiles(prev => prev.filter(file => file.id !== fileId));
    } catch (error) {
      console.error("Error deleting temp file:", error);
      setError('Помилка при видаленні файлу');
    } finally {
      setDeletingFile(null);
    }
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
      description: '',
      isNew: true
    };
    
    setNewLinks(prev => [...prev, link]);
    setNewLink('');
  };

  const deleteExistingLink = async (linkId) => {
    setDeletingLink(linkId);
    try {
      await axios.delete(
        `${API_URL}/assignments/links/${linkId}/delete/`,
        { withCredentials: true }
      );
      
      setExistingLinks(prev => prev.filter(link => link.id !== linkId));
    } catch (error) {
      console.error("Error deleting link:", error);
      setError('Помилка при видаленні посилання');
    } finally {
      setDeletingLink(null);
    }
  };

  const deleteNewLink = (linkId) => {
    setNewLinks(prev => prev.filter(link => link.id !== linkId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setSubmitting(true);
    setError(null);
    
    try {
      await axios.put(
        `${API_URL}/assignments/${assignmentId}/`,
        {
          ...formData,
          due_date: formData.due_date || null
        },
        { withCredentials: true }
      );
      
      if (tempFiles.length > 0) {
        await axios.post(
          `${API_URL}/assignments/${assignmentId}/confirm-files/`,
          {},
          { withCredentials: true }
        );
      }
      
      if (newLinks.length > 0) {
        await axios.post(
          `${API_URL}/assignments/${assignmentId}/add-links/`,
          {
            links: newLinks.map(link => link.link_url)
          },
          { withCredentials: true }
        );
      }
      
      navigate(`/teacher/assignments/${assignmentId}`);
      
    } catch (error) {
      console.error("Error updating assignment:", error);
      setError('Помилка при оновленні завдання: ' + (error.response?.data?.error || error.message));
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
      <div className="edit-assignment-wrapper">
        <TeacherHeader />
        <div className="edit-assignment-container">
          <TeacherSidebar />
          <div className="edit-assignment-loading">
            <FaSpinner className="loading-spinner" />
            <p>Завантаження даних...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="edit-assignment-wrapper">
        <TeacherHeader />
        <div className="edit-assignment-container">
          <TeacherSidebar />
          <div className="edit-assignment-error">
            <FaExclamationTriangle />
            <h3>Завдання не знайдено</h3>
            <button
              className="btn-primary"
              onClick={() => navigate(-1)}
            >
              Повернутися назад
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="edit-assignment-wrapper">
      <TeacherHeader />
      
      <div className="edit-assignment-container">
        <TeacherSidebar />
        
        <div className="edit-assignment-content">
          <div className="edit-assignment-header">
            <h1>Редагування завдання</h1>
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
          
          <form onSubmit={handleSubmit} className="edit-assignment-form">
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
                
                {existingFiles.length > 0 && (
                  <div className="files-list">
                    <h4>Поточні файли:</h4>
                    {existingFiles.map(file => (
                      <div key={file.id} className="file-item">
                        <div className="file-info">
                          <div className="file-icon">
                            <FaFileAlt />
                          </div>
                          <div className="file-details">
                            <span className="file-name">{file.file_name || 'Файл'}</span>
                            <span className="file-size">{formatFileSize(file.file_size)}</span>
                          </div>
                        </div>
                        <div className="file-actions">
                          <a
                            href={file.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-download"
                            title="Завантажити файл"
                          >
                            <FaDownload />
                          </a>
                          <button
                            type="button"
                            className="btn-delete-file"
                            onClick={() => deleteExistingFile(file.id)}
                            disabled={deletingFile === file.id}
                          >
                            {deletingFile === file.id ? <FaSpinner className="deleting-spinner" /> : <FaTrash />}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {tempFiles.length > 0 && (
                  <div className="files-list">
                    <h4>Нещодавно додані файли:</h4>
                    {tempFiles.map(file => (
                      <div key={file.id} className="file-item temp">
                        <div className="file-info">
                          <div className="file-icon">
                            <FaFileAlt />
                          </div>
                          <div className="file-details">
                            <span className="file-name">{file.file_name || 'Файл'}</span>
                            <span className="file-size">{formatFileSize(file.file_size)}</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          className="btn-delete-file"
                          onClick={() => deleteTempFile(file.id)}
                          disabled={deletingFile === file.id}
                        >
                          {deletingFile === file.id ? <FaSpinner className="deleting-spinner" /> : <FaTrash />}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
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
              </div>
              
              <div className="links-section">
                <h3>Посилання</h3>
                
                {existingLinks.length > 0 && (
                  <div className="links-list">
                    <h4>Поточні посилання:</h4>
                    {existingLinks.map(link => (
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
                        <div className="link-actions">
                          <a
                            href={link.link_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-open-link"
                            title="Відкрити посилання"
                          >
                            <FaExternalLinkAlt />
                          </a>
                          <button
                            type="button"
                            className="btn-delete-link"
                            onClick={() => deleteExistingLink(link.id)}
                            disabled={deletingLink === link.id}
                          >
                            {deletingLink === link.id ? <FaSpinner className="deleting-spinner" /> : <FaTrash />}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {newLinks.length > 0 && (
                  <div className="links-list">
                    <h4>Нові посилання:</h4>
                    {newLinks.map(link => (
                      <div key={link.id} className="link-item new">
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
                          onClick={() => deleteNewLink(link.id)}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
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
                    Збереження...
                  </>
                ) : (
                  <>
                    <FaSave /> Зберегти зміни
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

export default TeacherEditAssignment;