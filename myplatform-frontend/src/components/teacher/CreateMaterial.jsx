import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

function CreateMaterial() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [courses, setCourses] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [files, setFiles] = useState([]);
  const [filesPreview, setFilesPreview] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const userRole = sessionStorage.getItem('userRole');
    if (userRole !== 'teacher') {
      navigate('/login');
      return;
    }

    const fetchCourses = async () => {
      try {
        await axios.get(`${API_URL}/get-csrf-token/`, { withCredentials: true });
        const coursesResponse = await axios.get(`${API_URL}/courses/`, {
          withCredentials: true,
          params: { teacher_id: sessionStorage.getItem('userId') }
        });

        if (coursesResponse.data) {
          setCourses(coursesResponse.data);
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
        setError("Не вдалося завантажити список курсів");
      }
    };

    fetchCourses();
  }, [navigate]);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);

    // Create previews for selected files
    const previews = selectedFiles.map(file => ({
      name: file.name,
      size: file.size,
      type: file.type
    }));
    setFilesPreview(previews);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title || !description || !selectedCourse || files.length === 0) {
      setError("Будь ласка, заповніть всі обов'язкові поля та додайте хоча б один файл");
      return;
    }

    try {
      setSubmitting(true);
      
      await axios.get(`${API_URL}/get-csrf-token/`, { withCredentials: true });      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('course_id', selectedCourse);
      
      files.forEach(file => {
        formData.append('files', file);
      });      await axios.post(`${API_URL}/materials/create/`, formData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setSuccess(true);
      setTimeout(() => {
        navigate('/teacher/materials');
      }, 2000);

    } catch (error) {
      console.error("Error creating material:", error);
      setError("Не вдалося створити матеріал. Будь ласка, спробуйте пізніше.");
      setSubmitting(false);
    }
  };

  const handleRemoveFile = (index) => {
    const newFiles = [...files];
    const newPreviews = [...filesPreview];
    newFiles.splice(index, 1);
    newPreviews.splice(index, 1);
    setFiles(newFiles);
    setFilesPreview(newPreviews);
  };

  if (success) {
    return (
      <div className="create-material-wrapper">
        <TeacherHeader />
        <div className="create-material-container">
          <TeacherSidebar />
          <div className="create-material-success">
            <FaCheck className="success-icon" />
            <h2>Матеріал успішно створено!</h2>
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
            <h1>Створення нового матеріалу</h1>
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
              <label>Файли матеріалу*</label>
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

              {filesPreview.length > 0 && (
                <div className="files-preview">
                  {filesPreview.map((file, index) => (
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
                        onClick={() => handleRemoveFile(index)}
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
                    Створення...
                  </>
                ) : (
                  'Створити матеріал'
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
