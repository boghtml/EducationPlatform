import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../../api';
import TeacherHeader from './TeacherHeader';
import TeacherSidebar from './TeacherSidebar';
import { 
  FaFileAlt,
  FaUpload,
  FaTrash,
  FaSpinner,
  FaExclamationTriangle,
  FaArrowLeft,
  FaFilePdf,
  FaFileWord,
  FaFileVideo,
  FaFileArchive,
  FaImage,
  FaFile,
} from 'react-icons/fa';
import '../../css/teacher/TeacherLessonFiles.css';

function TeacherLessonFiles() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const { lessonId } = useParams();
  const navigate = useNavigate();

  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

  const ALLOWED_TYPES = {
    'application/pdf': { icon: FaFilePdf, label: 'PDF' },
    'application/msword': { icon: FaFileWord, label: 'DOC' },
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { icon: FaFileWord, label: 'DOCX' },
    'video/mp4': { icon: FaFileVideo, label: 'MP4' },
    'image/jpeg': { icon: FaImage, label: 'JPEG' },
    'image/png': { icon: FaImage, label: 'PNG' },
    'application/zip': { icon: FaFileArchive, label: 'ZIP' },
    'application/x-rar-compressed': { icon: FaFileArchive, label: 'RAR' }
  };

  useEffect(() => {
    const userRole = sessionStorage.getItem('userRole');
    if (userRole !== 'teacher') {
      navigate('/login');
      return;
    }

    fetchFiles();
  }, [lessonId, navigate]);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      await axios.get(`${API_URL}/get-csrf-token/`, { withCredentials: true });
      const response = await axios.get(`${API_URL}/lessons/${lessonId}/files/`, {
        withCredentials: true
      });
      setFiles(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching files:', error);
      setError('Не вдалося завантажити файли');
      setLoading(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Reset error states
    setUploadError(null);

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setUploadError('Файл занадто великий. Максимальний розмір: 50MB');
      event.target.value = '';
      return;
    }

    // Validate file type
    if (!ALLOWED_TYPES[file.type]) {
      setUploadError('Непідтримуваний формат файлу. Дозволені: PDF, JPEG, PNG, MP4, DOC, DOCX, ZIP, RAR');
      event.target.value = '';
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    
    try {
      setUploading(true);
      await axios.get(`${API_URL}/get-csrf-token/`, { withCredentials: true });
      
      // Upload file and get temporary file info
      const uploadResponse = await axios.post(
        `${API_URL}/lessons/upload-file/${lessonId}/`,
        formData,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            console.log('Upload progress:', percentCompleted);
          }
        }
      );

      // Confirm the temporary file
      await axios.post(
        `${API_URL}/lessons/confirm-temp-files/${lessonId}/`,
        {},
        { withCredentials: true }
      );

      await fetchFiles();
      event.target.value = '';
    } catch (error) {
      console.error('Error uploading file:', error);
      setUploadError('Не вдалося завантажити файл. Спробуйте ще раз.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteFile = async (fileId) => {
    if (window.confirm('Ви впевнені, що хочете видалити цей файл?')) {
      try {
        await axios.get(`${API_URL}/get-csrf-token/`, { withCredentials: true });
        await axios.delete(`${API_URL}/lessons/file/delete-confirmed/${fileId}/`, {
          withCredentials: true
        });
        await fetchFiles();
      } catch (error) {
        console.error('Error deleting file:', error);
        setError('Не вдалося видалити файл');
      }
    }
  };

  const getFileIcon = (fileType) => {
    const typeConfig = ALLOWED_TYPES[fileType];
    if (!typeConfig) return FaFile;
    return typeConfig.icon;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="teacher-lesson-files-wrapper">
        <TeacherHeader />
        <div className="teacher-lesson-files-container">
          <TeacherSidebar />
          <div className="teacher-lesson-files-content">
            <div className="loading-container">
              <FaSpinner className="spinner" />
              <p>Завантаження файлів...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="teacher-lesson-files-wrapper">
      <TeacherHeader />
      <div className="teacher-lesson-files-container">
        <TeacherSidebar />
        <div className="teacher-lesson-files-content">
          <div className="files-header">
            <button className="back-button" onClick={() => navigate(`/teacher/lessons/${lessonId}`)}>
              <FaArrowLeft /> Назад до уроку
            </button>
            <h1>Управління файлами</h1>
          </div>

          {error && (
            <div className="error-message">
              <FaExclamationTriangle /> {error}
            </div>
          )}

          {uploadError && (
            <div className="error-message">
              <FaExclamationTriangle /> {uploadError}
            </div>
          )}

          <div className="file-upload-section">
            <label className="upload-button" htmlFor="file-upload">
              {uploading ? (
                <>
                  <FaSpinner className="spinner" /> Завантаження...
                </>
              ) : (
                <>
                  <FaUpload /> Завантажити новий файл
                </>
              )}
              <input
                id="file-upload"
                type="file"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
                disabled={uploading}
                accept=".pdf,.doc,.docx,.mp4,.jpg,.jpeg,.png,.zip,.rar"
              />
            </label>
            <div className="upload-info">
              <p>Підтримувані формати: PDF, DOC(X), MP4, JPEG, PNG, ZIP, RAR</p>
              <p>Максимальний розмір: 50MB</p>
            </div>
          </div>

          <div className="files-list">
            {files.length > 0 ? files.map(file => {
              const FileIcon = getFileIcon(file.file_type);
              return (
                <div key={file.id} className="teacher-manager-file-item">
                  <div className="file-info">
                    <FileIcon className="file-icon" />
                    <div className="file-details">
                      <span className="file-name" title={file.file_name}>{file.file_name}</span>
                      <span className="file-meta">
                        <span className="file-type">{ALLOWED_TYPES[file.file_type]?.label || 'Файл'}</span>
                        <span className="file-size">{formatFileSize(file.file_size)}</span>
                      </span>
                    </div>
                  </div>
                  <div className="file-actions">
                    <a 
                      href={file.file_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="download-link"
                    >
                      Завантажити
                    </a>
                    <button 
                      className="delete-button"
                      onClick={() => handleDeleteFile(file.id)}
                      title="Видалити файл"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              );
            }) : (
              <p className="no-files">Немає прикріплених файлів</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TeacherLessonFiles;
