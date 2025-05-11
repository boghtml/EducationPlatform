import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import TeacherHeader from './TeacherHeader';
import TeacherSidebar from './TeacherSidebar';
import {
  ChevronLeft,
  Upload,
  Save,
  CheckCircle,
  AlertTriangle,
  X,
  File,
  Loader,
  Download,
  FolderOpen,
  Info
} from 'lucide-react';
import API_URL from '../../api';
import '../../css/teacher/CreateMaterial.css';

function CreateMaterial() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    course: ''
  });
  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);
  const [courses, setCourses] = useState([]);
  const [isDragging, setIsDragging] = useState(false);

  React.useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get(`${API_URL}/courses/`);
        const userCourses = response.data.filter(course => course.teacher.id === sessionStorage.getItem('userId'));
        setCourses(userCourses);
      } catch (error) {
        console.error('Error fetching courses:', error);
      }
    };
    fetchCourses();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
      '.pdf', '.doc', '.docx', '.txt', '.md', '.html', '.css', '.js',
      '.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp',
      '.mp4', '.webm', '.avi', '.mov', '.mp3', '.wav',
      '.zip', '.rar', '.7z', '.tar', '.gz'
    ];

    const validFiles = selectedFiles.filter(file => {
      const extension = '.' + file.name.split('.').pop().toLowerCase();
      return allowedTypes.includes(extension);
    });

    setIsUploading(true);
    setError('');

    try {
      const newFiles = await Promise.all(
        validFiles.map(async (file) => {
          const reader = new FileReader();
          return new Promise(resolve => {
            reader.onloadend = () => {
              resolve({
                file,
                preview: reader.result,
                progress: 0,
                status: 'ready'
              });
            };
            reader.readAsDataURL(file);
          });
        })
      );

      setFiles(prev => [...prev, ...newFiles]);
    } catch (error) {
      setError('Error processing files. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadToServer = async () => {
    setIsUploading(true);
    const formDataFiles = new FormData();

    files.forEach((fileObj) => {
      formDataFiles.append('files', fileObj.file);
      
      setFiles(prev => prev.map((f, i) => 
        f === fileObj ? { ...f, status: 'uploading' } : f
      ));
    });

    try {
      const response = await axios.post(
        `${API_URL}/materials/upload/`,
        formDataFiles,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setFiles(prev => prev.map(f => ({ ...f, progress })));
          }
        }
      );

      setFiles(prev => prev.map(f => ({ ...f, status: 'uploaded' })));
      return response.data;
    } catch (error) {
      setFiles(prev => prev.map(f => ({ ...f, status: 'error' })));
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.course) {
      setError('Please fill in required fields');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const materialData = {
        title: formData.title,
        description: formData.description,
        course_id: formData.course
      };

      const materialResponse = await axios.post(
        `${API_URL}/materials/create/`,
        materialData
      );

      if (files.length > 0) {
        await uploadToServer();
      }

      setSuccessMessage(true);
      setTimeout(() => {
        navigate('/teacher/materials');
      }, 2000);
    } catch (error) {
      console.error('Error creating material:', error);
      setError(error.response?.data?.error || 'Failed to create material');
    } finally {
      setIsSubmitting(false);
    }
  };

  const saveDraft = async () => {
    // Implementation for save draft functionality
    console.log('Saving draft...');
  };

  if (successMessage) {
    return (
      <div className="create-material__wrapper">
        <TeacherHeader />
        <div className="create-material__container">
          <TeacherSidebar />
          <div className="create-material__content">
            <div className="create-material__success">
              <div className="create-material__success-animation">
                <CheckCircle className="create-material__success-icon" />
                <div className="create-material__success-ripple" />
              </div>
              <h2>Material Created Successfully!</h2>
              <p>Your material has been created and files uploaded.</p>
              {files.length > 0 && (
                <div className="create-material__success-files">
                  {files.map((file, index) => (
                    <div key={index} className="create-material__success-file">
                      <CheckCircle className="create-material__success-file-icon" />
                      <span>{file.file.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="create-material__wrapper">
      <TeacherHeader />
      <div className="create-material__container">
        <TeacherSidebar />
        <div className="create-material__content">
          <div className="create-material__header">
            <div className="create-material__header-actions">
              <button
                onClick={() => navigate('/teacher/materials')}
                className="create-material__btn-back"
              >
                <ChevronLeft size={20} />
                Back to Materials
              </button>
              <h1>Create New Material</h1>
              <button
                onClick={saveDraft}
                className="create-material__btn-save-draft"
                disabled={isSubmitting}
              >
                <Save size={16} />
                Save Draft
              </button>
            </div>
          </div>

          {error && (
            <div className="create-material__error-message">
              <AlertTriangle size={20} />
              <pre>{error}</pre>
              <button
                onClick={() => setError('')}
                className="create-material__error-close"
              >
                <X size={16} />
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="create-material__form">
            <div className="create-material__form-section">
              <h3>Basic Information</h3>
              
              <div className="create-material__form-group">
                <label htmlFor="title">
                  Material Title <span className="create-material__required">*</span>
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
                <span className="create-material__char-count">
                  {formData.title.length}/100
                </span>
              </div>

              <div className="create-material__form-group">
                <label htmlFor="course">
                  Course <span className="create-material__required">*</span>
                </label>
                <select
                  id="course"
                  name="course"
                  value={formData.course}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select a course</option>
                  {courses.map(course => (
                    <option key={course.id} value={course.id}>
                      {course.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="create-material__form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Add a detailed description of the material..."
                  maxLength={500}
                />
                <span className="create-material__char-count">
                  {formData.description.length}/500
                </span>
              </div>
            </div>

            <div className="create-material__form-section">
              <h3>Upload Files</h3>
              
              <div
                className={`create-material__file-upload-zone ${isDragging ? 'create-material__drag-active' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => document.getElementById('file-input').click()}
              >
                <div className="create-material__upload-icon">
                  <Upload size={48} />
                </div>
                <h4>Drag and drop files here or click to browse</h4>
                <p>Supports documents, images, videos, and archives</p>
                <p className="create-material__upload-limits">Max file size: 50MB</p>
                <input
                  id="file-input"
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  className="create-material__file-input"
                  accept=".pdf,.doc,.docx,.txt,.md,.html,.css,.js,.jpg,.jpeg,.png,.gif,.svg,.webp,.mp4,.webm,.avi,.mov,.mp3,.wav,.zip,.rar,.7z,.tar,.gz"
                />
                <button
                  type="button"
                  className="create-material__btn-select-files"
                  onClick={(e) => {
                    e.stopPropagation();
                    document.getElementById('file-input').click();
                  }}
                >
                  <FolderOpen size={16} />
                  Select Files
                </button>
              </div>

              {files.length > 0 && (
                <div className="create-material__files-preview">
                  <h4>Selected Files ({files.length})</h4>
                  <div className="create-material__files-list">
                    {files.map((fileObj, index) => (
                      <div key={index} className="create-material__file-preview-item">
                        <div className="create-material__file-preview-info">
                          <div className="create-material__file-icon-container">
                            <File size={20} />
                            {fileObj.status === 'uploaded' && (
                              <CheckCircle className="create-material__upload-success-badge" size={12} />
                            )}
                            {fileObj.status === 'error' && (
                              <AlertTriangle className="create-material__upload-error-badge" size={12} />
                            )}
                          </div>
                          <div className="create-material__file-preview-details">
                            <span className="create-material__file-name">{fileObj.file.name}</span>
                            <span className="create-material__file-size">
                              {(fileObj.file.size / 1024 / 1024).toFixed(2)} MB
                            </span>
                            {(fileObj.status === 'uploading' || fileObj.status === 'uploaded') && (
                              <div className="create-material__file-upload-progress">
                                <div
                                  className={`create-material__progress-bar ${
                                    fileObj.status === 'uploaded' ? 'create-material__success' : ''
                                  } ${
                                    fileObj.status === 'error' ? 'create-material__error' : ''
                                  }`}
                                  style={{ width: `${fileObj.progress}%` }}
                                />
                                <span className="create-material__progress-text">{fileObj.progress}%</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="create-material__btn-remove-file"
                          disabled={isUploading}
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="create-material__files-summary">
                    <span>Total files: {files.length}</span>
                    <span>
                      Total size: {(files.reduce((acc, f) => acc + f.file.size, 0) / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="create-material__form-actions">
              <button
                type="button"
                onClick={() => navigate('/teacher/materials')}
                className="create-material__btn-cancel"
                disabled={isSubmitting}
              >
                <X size={16} />
                Cancel
              </button>
              <button
                type="submit"
                className="create-material__btn-submit"
                disabled={isSubmitting || isUploading}
              >
                {isSubmitting ? (
                  <>
                    <Loader className="create-material__loading-spinner" size={16} />
                    Creating...
                  </>
                ) : (
                  <>
                    <CheckCircle size={16} />
                    Create Material
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

export default CreateMaterial;