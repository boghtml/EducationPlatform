import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../../api';
import TeacherSidebar from './TeacherSidebar';
import TeacherHeader from './TeacherHeader';
import {
  FaFileAlt,
  FaFilePdf,
  FaFileWord,
  FaFileImage,
  FaFileVideo,
  FaFileArchive,
  FaFileCode,
  FaFile,
  FaUpload,
  FaTrash,
  FaSpinner,
  FaExclamationTriangle,
  FaArrowLeft,
  FaCheck,
  FaCheckCircle,
  FaTimes,
  FaCloudUploadAlt,
  FaPlus,
  FaClock,
  FaLink
} from 'react-icons/fa';
import '../../css/teacher/EditMaterial.css';

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'video/mp4',
  'video/avi',
  'video/mov',
  'application/zip',
  'application/x-rar-compressed',
  'text/javascript',
  'text/x-python',
  'text/x-java-source',
  'text/plain'
];

const UPLOAD_STATES = {
  IDLE: 'idle',
  UPLOADING: 'uploading',
  SUCCESS: 'success',
  ERROR: 'error'
};

function EditMaterial() {
  const navigate = useNavigate();
  const { materialId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [courses, setCourses] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [existingFiles, setExistingFiles] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [newFilesPreview, setNewFilesPreview] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [deletingFiles, setDeletingFiles] = useState({});
  const [hasChanges, setHasChanges] = useState(false);
  const [saveAsDraft, setSaveAsDraft] = useState(false);

  const [originalData, setOriginalData] = useState({});

  useEffect(() => {
    const userRole = sessionStorage.getItem('userRole');
    if (userRole !== 'teacher') {
      navigate('/login');
      return;
    }

    const fetchMaterialAndCourses = async () => {
      try {
        setLoading(true);
        await axios.get(`${API_URL}/get-csrf-token/`, { withCredentials: true });

        const [coursesResponse, materialResponse] = await Promise.all([
          axios.get(`${API_URL}/courses/`, {
            withCredentials: true,
            params: { teacher_id: sessionStorage.getItem('userId') }
          }),
          axios.get(`${API_URL}/materials/${materialId}/`, {
            withCredentials: true
          })
        ]);

        if (coursesResponse.data) {
          setCourses(coursesResponse.data);
        }

        if (materialResponse.data) {
          const material = materialResponse.data;
          setTitle(material.title);
          setDescription(material.description);
          setSelectedCourse(material.course?.id || '');
          setExistingFiles(material.files || []);
          
          // Save original data for change detection
          setOriginalData({
            title: material.title,
            description: material.description,
            course: material.course?.id || '',
            files: material.files || []
          });
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Не вдалося завантажити дані матеріалу");
        setLoading(false);
      }
    };

    fetchMaterialAndCourses();
  }, [materialId, navigate]);

  // Track changes
  useEffect(() => {
    const hasFormChanges = 
      title !== originalData.title ||
      description !== originalData.description ||
      selectedCourse !== originalData.course ||
      newFiles.length > 0 ||
      existingFiles.length !== originalData.files?.length;
    
    setHasChanges(hasFormChanges);
  }, [title, description, selectedCourse, newFiles, existingFiles, originalData]);

  const validateFile = (file) => {
    if (file.size > MAX_FILE_SIZE) {
      return `Файл "${file.name}" занадто великий. Максимальний розмір: ${MAX_FILE_SIZE / 1024 / 1024}MB`;
    }

    if (!ALLOWED_FILE_TYPES.includes(file.type) && file.type !== '') {
      return `Тип файлу "${file.type}" не підтримується`;
    }

    return null;
  };

  const handleFileChange = useCallback((e) => {
    const selectedFiles = Array.from(e.target.files);
    processFiles(selectedFiles);
  }, []);

  const processFiles = useCallback((selectedFiles) => {
    const validFiles = [];
    const errors = [];

    selectedFiles.forEach(file => {
      const error = validateFile(file);
      if (error) {
        errors.push(error);
      } else {
        validFiles.push(file);
      }
    });

    if (errors.length > 0) {
      setError(errors.join('\n'));
    }

    setNewFiles(prev => [...prev, ...validFiles]);

    // Create previews for selected files
    const previews = validFiles.map(file => ({
      name: file.name,
      size: file.size,
      type: file.type,
      id: Date.now() + Math.random(),
      uploadState: UPLOAD_STATES.IDLE,
      progress: 0
    }));
    
    setNewFilesPreview(prev => [...prev, ...previews]);
  }, []);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFiles(Array.from(e.dataTransfer.files));
    }
  }, [processFiles]);

  const getFileIcon = (type) => {
    if (!type) return <FaFile />;
    if (type.includes('pdf')) return <FaFilePdf />;
    if (type.includes('word') || type.includes('doc')) return <FaFileWord />;
    if (type.includes('image')) return <FaFileImage />;
    if (type.includes('video')) return <FaFileVideo />;
    if (type.includes('zip') || type.includes('rar')) return <FaFileArchive />;
    if (type.includes('javascript') || type.includes('python') || type.includes('java')) return <FaFileCode />;
    return <FaFile />;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleRemoveExistingFile = async (fileId) => {
    try {
      setDeletingFiles(prev => ({ ...prev, [fileId]: true }));
      await axios.get(`${API_URL}/get-csrf-token/`, { withCredentials: true });
      
      await axios.delete(`${API_URL}/materials/files/${fileId}/delete/`, {
        withCredentials: true
      });
      
      setExistingFiles(prevFiles => prevFiles.filter(file => file.id !== fileId));
    } catch (error) {
      console.error("Error removing file:", error);
      setError("Не вдалося видалити файл");
    } finally {
      setDeletingFiles(prev => ({ ...prev, [fileId]: false }));
    }
  };

  const handleRemoveNewFile = (index) => {
    const newFilesList = [...newFiles];
    const newPreviewsList = [...newFilesPreview];
    newFilesList.splice(index, 1);
    newPreviewsList.splice(index, 1);
    setNewFiles(newFilesList);
    setNewFilesPreview(newPreviewsList);
  };

  const saveDraft = async () => {
    if (!title) {
      setError("Будь ласка, введіть назву матеріалу");
      return;
    }

    try {
      setSaveAsDraft(true);
      
      // Implement draft saving logic here
      const draftData = {
        title,
        description,
        course: selectedCourse,
        isDraft: true
      };
      
      // You can implement actual draft saving logic here
      console.log('Saving draft:', draftData);
      
      // Show success message
      setTimeout(() => {
        setError(null);
        setSaveAsDraft(false);
      }, 1000);
      
    } catch (error) {
      console.error("Error saving draft:", error);
      setError("Не вдалося зберегти чернетку");
      setSaveAsDraft(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title || !description || !selectedCourse) {
      setError("Будь ласка, заповніть всі обов'язкові поля");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      await axios.get(`${API_URL}/get-csrf-token/`, { withCredentials: true });

      // Update material details
      await axios.put(`${API_URL}/materials/${materialId}/edit/`, {
        title,
        description,
        course: selectedCourse
      }, {
        withCredentials: true
      });

      // Upload new files if any
      if (newFiles.length > 0) {
        const formData = new FormData();
        
        newFiles.forEach((file, index) => {
          formData.append('files', file);
          
          // Update preview state
          setNewFilesPreview(prev => {
            const updated = [...prev];
            updated[index] = {
              ...updated[index],
              uploadState: UPLOAD_STATES.UPLOADING
            };
            return updated;
          });
        });

        const response = await axios.post(`${API_URL}/materials/${materialId}/add-files/`, formData, {
          withCredentials: true,
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            
            // Update progress for all files
            setNewFilesPreview(prev => prev.map(file => ({
              ...file,
              progress: percentCompleted,
              uploadState: percentCompleted === 100 ? UPLOAD_STATES.SUCCESS : UPLOAD_STATES.UPLOADING
            })));
          }
        });
      }

      setSuccess(true);
      
      // Show success animation
      setTimeout(() => {
        navigate('/teacher/materials');
      }, 2000);

    } catch (error) {
      console.error("Error updating material:", error);
      setError("Не вдалося оновити матеріал. Будь ласка, спробуйте пізніше.");
      
      // Update file states to error
      setNewFilesPreview(prev => prev.map(file => ({
        ...file,
        uploadState: UPLOAD_STATES.ERROR
      })));
      
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="edit-material-wrapper">
        <TeacherHeader />
        <div className="edit-material-container">
          <TeacherSidebar />
          <div className="edit-material-loading">
            <FaSpinner className="loading-spinner" />
            <p>Завантаження даних...</p>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="edit-material-wrapper">
        <TeacherHeader />
        <div className="edit-material-container">
          <TeacherSidebar />
          <div className="edit-material-success">
            <div className="success-animation">
              <FaCheckCircle className="success-icon" />
              <div className="success-ripple"></div>
            </div>
            <h2>Матеріал успішно оновлено!</h2>
            <p>Зараз вас буде перенаправлено на сторінку матеріалів...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="edit-material-wrapper">
      <TeacherHeader />
      <div className="edit-material-container">
        <TeacherSidebar />
        
        <div className="edit-material-content">
          <div className="edit-material-header">
            <button className="btn-back" onClick={() => navigate('/teacher/materials')}>
              <FaArrowLeft /> Назад до матеріалів
            </button>
            <div className="header-actions">
              <h1>Редагування матеріалу</h1>
              <button 
                className="btn-save-draft"
                onClick={saveDraft}
                disabled={saveAsDraft || !title}
              >
                {saveAsDraft ? <FaSpinner className="loading-spinner-small" /> : <FaLink />}
                Зберегти як чернетку
              </button>
            </div>
          </div>

          {error && (
            <div className="error-message">
              <FaExclamationTriangle />
              <pre>{error}</pre>
              <button onClick={() => setError(null)}>
                <FaTimes />
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="edit-material-form">
            <div className="form-section">
              <h3>Основна інформація</h3>
              
              <div className="form-group">
                <label htmlFor="title">
                  Назва матеріалу <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Введіть назву матеріалу"
                  required
                  maxLength={255}
                />
                <span className="char-count">{title.length}/255</span>
              </div>

              <div className="form-group">
                <label htmlFor="description">
                  Опис матеріалу <span className="required">*</span>
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Введіть детальний опис матеріалу"
                  required
                  maxLength={1000}
                />
                <span className="char-count">{description.length}/1000</span>
              </div>

              <div className="form-group">
                <label htmlFor="course">
                  Курс <span className="required">*</span>
                </label>
                <select
                  id="course"
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  required
                >
                  <option value="">Виберіть курс</option>
                  {courses.map(course => (
                    <option key={course.id} value={course.id}>
                      {course.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-section existing-files-section">
              <h3>Поточні файли</h3>
              
              {existingFiles.length > 0 ? (
                <div className="files-grid">
                  {existingFiles.map(file => (
                    <div key={file.id} className="file-card">
                      <div className="file-preview">
                        <div className="file-icon">
                          {getFileIcon(file.file_type)}
                        </div>
                        <div className="file-overlay">
                          <button
                            type="button"
                            className="file-action"
                            onClick={() => handleRemoveExistingFile(file.id)}
                            disabled={deletingFiles[file.id]}
                          >
                            {deletingFiles[file.id] ? (
                              <FaSpinner className="loading-spinner-small" />
                            ) : (
                              <FaTrash />
                            )}
                          </button>
                        </div>
                      </div>
                      <div className="file-info">
                        <div className="file-name">{file.file_name || 'Unnamed file'}</div>
                        <div className="file-details">
                          <span>{formatFileSize(file.file_size)}</span>
                          <span>{file.file_type || 'Unknown'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-files">
                  <FaFileAlt />
                  <h3>Немає файлів</h3>
                  <p>До цього матеріалу не додано жодного файлу</p>
                </div>
              )}
            </div>

            <div className="form-section new-files-section">
              <h3>Додати нові файли</h3>
              
              <div 
                className={`file-upload-zone ${dragActive ? 'drag-active' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <div className="upload-icon">
                  <FaCloudUploadAlt />
                </div>
                <h4>Перетягніть файли сюди або клацніть для вибору</h4>
                <p>Підтримувані формати: PDF, Word, зображення, відео, архіви, код</p>
                <p className="upload-limits">Максимальний розмір файлу: 100MB</p>
                
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.mp4,.avi,.mov,.zip,.rar,.js,.py,.java,.txt"
                  className="file-input"
                />
                
                <button type="button" className="btn-select-files">
                  <FaPlus /> Вибрати файли
                </button>
              </div>

              {newFilesPreview.length > 0 && (
                <div className="new-files-preview">
                  <h4>Нові файли ({newFilesPreview.length})</h4>
                  <div className="new-files-list">
                    {newFilesPreview.map((file, index) => (
                      <div key={file.id} className="file-preview-item">
                        <div className="file-preview-info">
                          <div className="file-icon-container">
                            {getFileIcon(file.type)}
                            {file.uploadState === UPLOAD_STATES.SUCCESS && (
                              <FaCheckCircle className="upload-success-badge" />
                            )}
                            {file.uploadState === UPLOAD_STATES.ERROR && (
                              <FaTimes className="upload-error-badge" />
                            )}
                          </div>
                          <div className="file-preview-details">
                            <span className="file-preview-name">{file.name}</span>
                            <span className="file-preview-size">{formatFileSize(file.size)}</span>
                            <div className="file-upload-progress">
                              <div 
                                className={`progress-bar ${file.uploadState}`}
                                style={{ width: `${file.progress}%` }}
                              />
                              <span className="progress-text">{file.progress}%</span>
                            </div>
                          </div>
                        </div>
                        {!submitting && (
                          <button
                            type="button"
                            className="btn-remove-file"
                            onClick={() => handleRemoveNewFile(index)}
                          >
                            <FaTrash />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="form-actions">
              {hasChanges && (
                <div className="changes-indicator">
                  <FaClock />
                  Є незбережені зміни
                </div>
              )}
              
              <div className="form-actions-right">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => navigate('/teacher/materials')}
                  disabled={submitting}
                >
                  Скасувати
                </button>
                <button
                  type="submit"
                  className="btn-save"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <FaSpinner className="loading-spinner" />
                      Збереження...
                    </>
                  ) : (
                    <>
                      <FaCheck />
                      Зберегти зміни
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default EditMaterial;