import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../../api';
import TeacherSidebar from './TeacherSidebar';
import TeacherHeader from './TeacherHeader';
import {
  FaSpinner,
  FaExclamationTriangle,
  FaArrowLeft,
  FaGraduationCap,
  FaCalendarAlt,
  FaFilePdf,
  FaFileWord,
  FaFileImage,
  FaFileVideo,
  FaFileArchive,
  FaFileCode,
  FaFile,
  FaDownload,
  FaEdit,
  FaTrash
} from 'react-icons/fa';
import '../../css/teacher/MaterialDetail.css';

function MaterialDetail() {
  const navigate = useNavigate();
  const { materialId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [material, setMaterial] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    const userRole = sessionStorage.getItem('userRole');
    if (userRole !== 'teacher') {
      navigate('/login');
      return;
    }

    const fetchMaterial = async () => {
      try {
        await axios.get(`${API_URL}/get-csrf-token/`, { withCredentials: true });
        
        const response = await axios.get(`${API_URL}/materials/${materialId}/`, {
          withCredentials: true
        });

        setMaterial(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching material:", error);
        setError("Не вдалося завантажити дані про матеріал");
        setLoading(false);
      }
    };

    fetchMaterial();
  }, [materialId, navigate]);
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

  const formatDate = (dateString) => {
    if (!dateString) return 'Не вказано';
    return new Date(dateString).toLocaleDateString('uk-UA', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDownload = async (fileId, fileName) => {
    try {      const response = await axios.get(`${API_URL}/materials/files/${fileId}/download/`, {
        responseType: 'blob',
        withCredentials: true
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error downloading file:", error);
      setError("Не вдалося завантажити файл");
    }
  };

  const handleDelete = async () => {      try {
        await axios.get(`${API_URL}/get-csrf-token/`, { withCredentials: true });
      
        await axios.delete(`${API_URL}/materials/${materialId}/delete/`, {
          withCredentials: true
        });
      
      navigate('/teacher/materials');
    } catch (error) {
      console.error("Error deleting material:", error);
      setError("Не вдалося видалити матеріал");
    }
  };

  if (loading) {
    return (
      <div className="material-detail-wrapper">
        <TeacherHeader />
        <div className="material-detail-container">
          <TeacherSidebar />
          <div className="material-detail-loading">
            <FaSpinner className="loading-spinner" />
            <p>Завантаження даних матеріалу...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !material) {
    return (
      <div className="material-detail-wrapper">
        <TeacherHeader />
        <div className="material-detail-container">
          <TeacherSidebar />
          <div className="material-detail-error">
            <FaExclamationTriangle />
            <h3>Помилка завантаження</h3>
            <p>{error || "Матеріал не знайдено"}</p>
            <button 
              className="btn-primary"
              onClick={() => navigate('/teacher/materials')}
            >
              Повернутися до списку матеріалів
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="material-detail-wrapper">
      <TeacherHeader />
      <div className="material-detail-container">
        <TeacherSidebar />
        
        <div className="material-detail-content">
          <div className="material-header">
            <div className="material-title-section">
              <h1>{material.title}</h1>
              <div className="material-actions">
                <button
                  className="btn-edit"
                  onClick={() => navigate(`/teacher/materials/${materialId}/edit`)}
                >
                  <FaEdit /> Редагувати
                </button>
                <button
                  className="btn-delete"
                  onClick={() => setConfirmDelete(true)}
                >
                  <FaTrash /> Видалити
                </button>
              </div>
            </div>

            <div className="material-meta">
              {material.course && (
                <div className="meta-item">
                  <FaGraduationCap />
                  <span>Курс: {material.course.title}</span>
                </div>
              )}
              <div className="meta-item">
                <FaCalendarAlt />
                <span>Створено: {formatDate(material.created_at)}</span>
              </div>
            </div>
          </div>

          <div className="material-description">
            <h2>Опис</h2>
            {material.description ? (
              <p>{material.description}</p>
            ) : (
              <p className="no-description">Опис відсутній</p>
            )}
          </div>

          <div className="material-files">
            <h2>Файли</h2>
            {material.files && material.files.length > 0 ? (
              <div className="files-grid">
                {material.files.map(file => (
                  <div key={file.id} className="file-card">
                    <div className="file-icon">
                      {getFileIcon(file.type)}
                    </div>
                    <div className="file-info">
                      <div className="file-name">{file.name}</div>
                      <div className="file-details">
                        <span>{formatFileSize(file.size)}</span>
                        <span>{file.type}</span>
                      </div>
                    </div>
                    <a
                      href="#"
                      className="download-button"
                      onClick={(e) => {
                        e.preventDefault();
                        handleDownload(file.id, file.name);
                      }}
                    >
                      <FaDownload /> Завантажити
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-files">
                <p>До матеріалу не додано жодного файлу</p>
              </div>
            )}
          </div>
        </div>

        {confirmDelete && (
          <div className="delete-confirmation-modal">
            <div className="delete-confirmation-content">
              <h2>Видалення матеріалу</h2>
              <p>Ви впевнені, що хочете видалити цей матеріал? Ця дія незворотна.</p>
              <div className="delete-confirmation-actions">
                <button 
                  className="btn-cancel"
                  onClick={() => setConfirmDelete(false)}
                >
                  Скасувати
                </button>
                <button 
                  className="btn-confirm-delete"
                  onClick={handleDelete}
                >
                  Видалити
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MaterialDetail;
