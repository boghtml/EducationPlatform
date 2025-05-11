import React, { useState, useEffect } from 'react';
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
  FaCheck
} from 'react-icons/fa';
import '../../css/teacher/CreateMaterial.css';

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

        // Fetch courses
        const coursesResponse = await axios.get(`${API_URL}/courses/`, {
          withCredentials: true,
          params: { teacher_id: sessionStorage.getItem('userId') }
        });

        if (coursesResponse.data) {
          setCourses(coursesResponse.data);
        }

        // Fetch material details
        const materialResponse = await axios.get(`${API_URL}/materials/${materialId}/`, {
          withCredentials: true
        });

        if (materialResponse.data) {
          const material = materialResponse.data;
          setTitle(material.title);
          setDescription(material.description);
          setSelectedCourse(material.course.id);
          setExistingFiles(material.files || []);
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

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setNewFiles(selectedFiles);

    // Create previews for selected files
    const previews = selectedFiles.map(file => ({
      name: file.name,
      size: file.size,
      type: file.type
    }));
    setNewFilesPreview(previews);
  };
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
      await axios.get(`${API_URL}/get-csrf-token/`, { withCredentials: true });      await axios.delete(`${API_URL}/materials/files/${fileId}/delete/`, {
        withCredentials: true
      });
      
      setExistingFiles(prevFiles => prevFiles.filter(file => file.id !== fileId));
    } catch (error) {
      console.error("Error removing file:", error);
      setError("Не вдалося видалити файл");
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title || !description || !selectedCourse) {
      setError("Будь ласка, заповніть всі обов'язкові поля");
      return;
    }

    try {
      setSubmitting(true);
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
        newFiles.forEach(file => {
          formData.append('files', file);
        });        await axios.post(`${API_URL}/materials/${materialId}/add-files/`, formData, {
          withCredentials: true,
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/teacher/materials');
      }, 2000);

    } catch (error) {
      console.error("Error updating material:", error);
      setError("Не вдалося оновити матеріал. Будь ласка, спробуйте пізніше.");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="create-material-wrapper">
        <TeacherHeader />
        <div className="create-material-container">
          <TeacherSidebar />
          <div className="loading-container">
            <FaSpinner className="loading-spinner" />
            <p>Завантаження даних...</p>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="create-material-wrapper">
        <TeacherHeader />
        <div className="create-material-container">
          <TeacherSidebar />
          <div className="create-material-success">
            <FaCheck className="success-icon" />
            <h2>Матеріал успішно оновлено!</h2>
            <p>Зараз вас буде перенаправлено на сторінку матеріалів...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="create-material-wrapper">
      <TeacherHeader />
      <div className="create-material-container">
        <TeacherSidebar />
        
        <div className="create-material-content">
          <div className="create-material-header">
            <button className="btn-back" onClick={() => navigate('/teacher/materials')}>
              <FaArrowLeft /> Назад до матеріалів
            </button>
            <h1>Редагування матеріалу</h1>
          </div>

          {error && (
            <div className="error-message">
              <FaExclamationTriangle />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="create-material-form">
            <div className="form-group">
              <label htmlFor="title">Назва матеріалу*</label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Введіть назву матеріалу"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Опис матеріалу*</label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Введіть опис матеріалу"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="course">Курс*</label>
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

            <div className="form-group">
              <label>Поточні файли</label>
              {existingFiles.length > 0 ? (
                <div className="files-preview">
                  {existingFiles.map(file => (
                    <div key={file.id} className="file-preview-item">
                      <div className="file-preview-info">
                        {getFileIcon(file.type)}
                        <div className="file-preview-details">
                          <span className="file-name">{file.name}</span>
                          <span className="file-size">{formatFileSize(file.size)}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="btn-remove-file"
                        onClick={() => handleRemoveExistingFile(file.id)}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-files">Немає прикріплених файлів</p>
              )}
            </div>

            <div className="form-group">
              <label>Додати нові файли</label>
              <div className="file-upload-container">
                <label className="file-upload-label">
                  <FaUpload />
                  <span>Виберіть файли для завантаження</span>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.mp4,.zip,.rar"
                  />
                </label>
              </div>

              {newFilesPreview.length > 0 && (
                <div className="files-preview">
                  {newFilesPreview.map((file, index) => (
                    <div key={index} className="file-preview-item">
                      <div className="file-preview-info">
                        {getFileIcon(file.type)}
                        <div className="file-preview-details">
                          <span className="file-name">{file.name}</span>
                          <span className="file-size">{formatFileSize(file.size)}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="btn-remove-file"
                        onClick={() => handleRemoveNewFile(index)}
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
                type="button"
                className="btn-cancel"
                onClick={() => navigate('/teacher/materials')}
              >
                Скасувати
              </button>
              <button
                type="submit"
                className="btn-submit"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <FaSpinner className="loading-spinner" />
                    Збереження...
                  </>
                ) : (
                  'Зберегти зміни'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default EditMaterial;
