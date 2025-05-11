import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import TeacherHeader from './TeacherHeader';
import TeacherSidebar from './TeacherSidebar';
import {
  ChevronLeft,
  Upload,
  Save,
  Download,
  Trash2,
  CheckCircle,
  AlertTriangle,
  X,
  File,
  Loader,
  FolderOpen,
  Edit2,
  Eye,
  AlertCircle,
  BookOpen,
} from 'lucide-react';
import API_URL from '../../api';
import '../../css/teacher/EditMaterial.css';

function EditMaterial() {
  const { materialId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [material, setMaterial] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
  });
  const [newFiles, setNewFiles] = useState([]);
  const [existingFiles, setExistingFiles] = useState([]);
  const [removedFiles, setRemovedFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    fetchMaterial();
  }, [materialId]);

  useEffect(() => {
    checkForChanges();
  }, [formData, newFiles, removedFiles]);
  const fetchMaterial = async () => {
    try {
      setLoading(true);
      await axios.get(`${API_URL}/get-csrf-token/`, { withCredentials: true });
      const response = await axios.get(`${API_URL}/materials/${materialId}/`, { withCredentials: true });
      setMaterial(response.data);
      setFormData({
        title: response.data.title,
        description: response.data.description || '',
      });
      setExistingFiles(response.data.files || []);
    } catch (error) {
      console.error('Error fetching material:', error);
      setError('Failed to fetch material details');
    } finally {
      setLoading(false);
    }
  };

  const checkForChanges = () => {
    if (!material) return;

    const titleChanged = formData.title !== material.title;
    const descriptionChanged = formData.description !== (material.description || '');
    const filesChanged = newFiles.length > 0 || removedFiles.length > 0;

    setHasChanges(titleChanged || descriptionChanged || filesChanged);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  };

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    handleFiles(selectedFiles);
  };

  const handleFiles = async (selectedFiles) => {
    const allowedTypes = [
      '.pdf',
      '.doc',
      '.docx',
      '.txt',
      '.md',
      '.html',
      '.css',
      '.js',
      '.jpg',
      '.jpeg',
      '.png',
      '.gif',
      '.svg',
      '.webp',
      '.mp4',
      '.webm',
      '.avi',
      '.mov',
      '.mp3',
      '.wav',
      '.zip',
      '.rar',
      '.7z',
      '.tar',
      '.gz',
    ];

    const validFiles = selectedFiles.filter((file) => {
      const extension = '.' + file.name.split('.').pop().toLowerCase();
      return allowedTypes.includes(extension);
    });

    setIsUploading(true);
    setError('');

    try {
      const newFileObjects = await Promise.all(
        validFiles.map(async (file) => {
          const reader = new FileReader();
          return new Promise((resolve) => {
            reader.onloadend = () => {
              resolve({
                file,
                preview: reader.result,
                progress: 0,
                status: 'ready',
              });
            };
            reader.readAsDataURL(file);
          });
        })
      );

      setNewFiles((prev) => [...prev, ...newFileObjects]);
    } catch (error) {
      setError('Error processing files. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const removeExistingFile = (fileId) => {
    setRemovedFiles((prev) => [...prev, fileId]);
    setExistingFiles((prev) => prev.filter((file) => file.id !== fileId));
  };

  const removeNewFile = (index) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const downloadFile = (fileUrl, fileName) => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const uploadNewFiles = async () => {
    if (newFiles.length === 0) return;

    setIsUploading(true);
    const formDataFiles = new FormData();

    newFiles.forEach((fileObj) => {
      formDataFiles.append('files', fileObj.file);
    });

    try {
      const response = await axios.post(
        `${API_URL}/materials/${materialId}/add-files/`,
        formDataFiles,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setNewFiles((prev) =>
              prev.map((f) => ({ ...f, progress, status: progress === 100 ? 'uploaded' : f.status }))
            );
          },
        }
      );

      setNewFiles((prev) => prev.map((f) => ({ ...f, status: 'uploaded' })));
    } catch (error) {
      setNewFiles((prev) => prev.map((f) => ({ ...f, status: 'error' })));
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title) {
      setError('Material title is required');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Update material details
      await axios.put(`${API_URL}/materials/${materialId}/edit/`, {
        title: formData.title,
        description: formData.description,
      });

      // Remove deleted files
      for (const fileId of removedFiles) {
        await axios.delete(`${API_URL}/materials/files/${fileId}/delete/`);
      }

      // Upload new files
      if (newFiles.length > 0) {
        await uploadNewFiles();
      }

      setSuccessMessage(true);
      setTimeout(() => {
        navigate('/teacher/materials');
      }, 2000);
    } catch (error) {
      console.error('Error updating material:', error);
      setError(error.response?.data?.error || 'Failed to update material');
    } finally {
      setIsSubmitting(false);
    }
  };

  const saveDraft = async () => {
    console.log('Saving draft...');
    // Реалізуйте логіку збереження чернетки, якщо потрібно
  };

  if (loading) {
    return (
      <div className="edit-material__wrapper">
        <TeacherHeader />
        <div className="edit-material__container">
          <TeacherSidebar />
          <div className="edit-material__content">
            <div className="edit-material__loading">
              <Loader className="edit-material__loading-spinner" size={40} />
              <p>Loading material details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !material) {
    return (
      <div className="edit-material__wrapper">
        <TeacherHeader />
        <div className="edit-material__container">
          <TeacherSidebar />
          <div className="edit-material__content">
            <div className="edit-material__error">
              <AlertCircle size={48} />
              <h3>Error Loading Material</h3>
              <p>{error}</p>
              <button
                onClick={() => navigate('/teacher/materials')}
                className="edit-material__btn-back"
              >
                <ChevronLeft size={20} />
                Back to Materials
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (successMessage) {
    return (
      <div className="edit-material__wrapper">
        <TeacherHeader />
        <div className="edit-material__container">
          <TeacherSidebar />
          <div className="edit-material__content">
            <div className="edit-material__success">
              <div className="edit-material__success-animation">
                <CheckCircle className="edit-material__success-icon" />
                <div className="edit-material__success-ripple" />
              </div>
              <h2>Material Updated Successfully!</h2>
              <p>Your changes have been saved and are now live.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="edit-material__wrapper">
      <TeacherHeader />
      <div className="edit-material__container">
        <TeacherSidebar />
        <div className="edit-material__content">
          <div className="edit-material__header">
            <div className="edit-material__header-actions">
              <button
                onClick={() => navigate('/teacher/materials')}
                className="edit-material__btn-back"
              >
                <ChevronLeft size={20} />
                Back to Materials
              </button>
              <h1>Edit Material</h1>
              <button
                onClick={saveDraft}
                className="edit-material__btn-save-draft"
                disabled={isSubmitting}
              >
                <Save size={16} />
                Save Draft
              </button>
            </div>
          </div>

          {error && (
            <div className="edit-material__error-message">
              <AlertTriangle size={20} />
              <pre>{error}</pre>
              <button
                onClick={() => setError('')}
                className="edit-material__error-close"
              >
                <X size={16} />
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="edit-material__form">
            <div className="edit-material__form-section">
              <h3>Basic Information</h3>

              <div className="edit-material__form-group">
                <label htmlFor="title">
                  Material Title <span className="edit-material__required">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter material title..."
                  maxLength={100}
                  required
                />
                <span className="edit-material__char-count">{formData.title.length}/100</span>
              </div>

              <div className="edit-material__form-group">
                <label htmlFor="course">Course</label>
                <div className="edit-material__course-info">
                  <BookOpen size={16} />
                  <span>{material?.course}</span>
                </div>
              </div>

              <div className="edit-material__form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Add a detailed description of the material..."
                  maxLength={500}
                />
                <span className="edit-material__char-count">{formData.description.length}/500</span>
              </div>
            </div>

            <div className="edit-material__form-section">
              <h3>Existing Files</h3>

              {existingFiles.length > 0 ? (
                <div className="edit-material__existing-files-section">
                  <div className="edit-material__files-grid">
                    {existingFiles.map((file) => (
                      <div key={file.id} className="edit-material__file-card">
                        <div className="edit-material__file-preview">
                          <File className="edit-material__file-icon" size={32} />
                          <div className="edit-material__file-overlay">
                            <button
                              type="button"
                              className="edit-material__file-action"
                              onClick={() => window.open(file.url, '_blank')}
                              title="View File"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              type="button"
                              className="edit-material__file-action"
                              onClick={() => downloadFile(file.url, file.name)}
                              title="Download File"
                            >
                              <Download size={16} />
                            </button>
                            <button
                              type="button"
                              className="edit-material__file-action"
                              onClick={() => removeExistingFile(file.id)}
                              title="Remove File"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                        <div className="edit-material__file-info">
                          <span className="edit-material__file-name">{file.name}</span>
                          <div className="edit-material__file-details">
                            <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                            <span>{new Date(file.uploaded_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {removedFiles.length > 0 && (
                    <div className="edit-material__removed-files-info">
                      <AlertTriangle size={16} />
                      <span>{removedFiles.length} file(s) marked for removal</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="edit-material__no-files">No files uploaded yet.</div>
              )}
            </div>

            <div className="edit-material__form-section">
              <h3>Add New Files</h3>
              <div
                className={`edit-material__file-upload-zone ${isDragging ? 'edit-material__drag-active' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <Upload className="edit-material__upload-icon" size={48} />
                <h4>Drag & Drop Files Here</h4>
                <p>or</p>
                <label htmlFor="file-upload" className="edit-material__btn-select-files">
                  <Upload size={16} />
                  Select Files
                </label>
                <input
                  id="file-upload"
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  className="edit-material__file-input"
                  disabled={isUploading}
                />
                <p className="edit-material__upload-limits">
                  Supported formats: PDF, DOC, images, videos, audio, archives (max 100MB each)
                </p>
              </div>

              {newFiles.length > 0 && (
                <div className="edit-material__new-files-preview">
                  <h4>New Files ({newFiles.length})</h4>
                  <div className="edit-material__new-files-list">
                    {newFiles.map((fileObj, index) => (
                      <div key={index} className="edit-material__file-preview-item">
                        <div className="edit-material__file-preview-info">
                          <div className="edit-material__file-icon-container">
                            <File size={20} />
                            {fileObj.status === 'uploaded' && (
                              <CheckCircle className="edit-material__upload-success-badge" size={16} />
                            )}
                            {fileObj.status === 'error' && (
                              <AlertCircle className="edit-material__upload-error-badge" size={16} />
                            )}
                          </div>
                          <div className="edit-material__file-preview-details">
                            <span className="edit-material__file-preview-name">{fileObj.file.name}</span>
                            <span className="edit-material__file-preview-size">
                              {(fileObj.file.size / 1024 / 1024).toFixed(2)} MB
                            </span>
                            {fileObj.status !== 'ready' && (
                              <div className="edit-material__file-upload-progress">
                                <div
                                  className={`edit-material__progress-bar ${
                                    fileObj.status === 'uploaded'
                                      ? 'edit-material__success'
                                      : fileObj.status === 'error'
                                      ? 'edit-material__error'
                                      : ''
                                  }`}
                                  style={{ width: `${fileObj.progress}%` }}
                                />
                                <span className="edit-material__progress-text">{fileObj.progress}%</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <button
                          type="button"
                          className="edit-material__btn-remove-file"
                          onClick={() => removeNewFile(index)}
                          disabled={isUploading}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="edit-material__form-actions">
              <div className="edit-material__changes-indicator">
                {hasChanges && (
                  <>
                    <AlertTriangle size={16} />
                    <span>Unsaved changes</span>
                  </>
                )}
              </div>
              <div className="edit-material__form-actions-right">
                <button
                  type="button"
                  className="edit-material__btn-cancel"
                  onClick={() => navigate('/teacher/materials')}
                  disabled={isSubmitting || isUploading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="edit-material__btn-save"
                  disabled={isSubmitting || isUploading || !hasChanges}
                >
                  {isSubmitting ? (
                    <>
                      <Loader className="edit-material__loading-spinner-small" size={16} />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      Save Changes
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