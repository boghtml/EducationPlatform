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
  FaFileVideo,  FaFileArchive,
  FaFileCode,
  FaFile,
  FaFileAlt,
  FaDownload,
  FaEdit,
  FaTrash,
  FaEye,
  FaUsers,
  FaChartLine,
  FaShare,
  FaClock,
} from 'react-icons/fa';
import '../../css/teacher/MaterialDetail.css';

function MaterialDetail() {
  const navigate = useNavigate();
  const { materialId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [material, setMaterial] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [downloading, setDownloading] = useState({});
  const [activeTab, setActiveTab] = useState('files');
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    const userRole = sessionStorage.getItem('userRole');
    if (userRole !== 'teacher') {
      navigate('/login');
      return;
    }

    const fetchMaterial = async () => {
      try {
        await axios.get(`${API_URL}/get-csrf-token/`, { withCredentials: true });
        
        const [materialResponse, analyticsResponse] = await Promise.all([
          axios.get(`${API_URL}/materials/${materialId}/`, {
            withCredentials: true
          }),
          axios.get(`${API_URL}/materials/${materialId}/analytics/`, {
            withCredentials: true
          }).catch(() => ({ data: null })) // Handle analytics endpoint not found
        ]);

        setMaterial(materialResponse.data);
        setAnalytics(analyticsResponse.data);
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
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
    try {
      setDownloading(prev => ({ ...prev, [fileId]: true }));
      
      const response = await axios.get(`${API_URL}/materials/files/${fileId}/download/`, {
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
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading file:", error);
      setError("Не вдалося завантажити файл");
    } finally {
      setDownloading(prev => ({ ...prev, [fileId]: false }));
    }
  };

  const handleDownloadAll = async () => {
    try {
      setDownloading(prev => ({ ...prev, 'all': true }));
      
      const response = await axios.get(`${API_URL}/materials/${materialId}/download-all/`, {
        responseType: 'blob',
        withCredentials: true
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${material.title}.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading all files:", error);
      setError("Не вдалося завантажити всі файли");
    } finally {
      setDownloading(prev => ({ ...prev, 'all': false }));
    }
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/materials/${materialId}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: material.title,
          text: material.description,
          url: shareUrl
        });
      } catch (error) {
        copyToClipboard(shareUrl);
      }
    } else {
      copyToClipboard(shareUrl);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Посилання скопійовано в буфер обміну');
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleDelete = async () => {
    try {
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

  const handleTabChange = (tab) => {
    setActiveTab(tab);
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

  const totalSize = material.files?.reduce((sum, file) => sum + (file.file_size || 0), 0) || 0;
  const fileTypes = material.files?.map(file => file.file_type).join(', ') || 'Немає файлів';

  return (
    <div className="material-detail-wrapper">
      <TeacherHeader />
      <div className="material-detail-container">
        <TeacherSidebar />
        
        <div className="material-detail-content">
          <div className="material-header">
            <button className="btn-back" onClick={() => navigate('/teacher/materials')}>
              <FaArrowLeft /> Назад до матеріалів
            </button>
            
            <div className="material-title-section">
              <div className="title-group">
                <h1>{material.title}</h1>
                <div className="material-tags">
                  <span className="tag">{material.course?.title || 'Без курсу'}</span>
                  <span className="tag">
                    {material.files?.length || 0} файл(ів)
                  </span>
                  <span className="tag">{formatFileSize(totalSize)}</span>
                </div>
              </div>
              
              <div className="material-actions">
                <button
                  className="btn-edit"
                  onClick={() => navigate(`/teacher/materials/${materialId}/edit`)}
                >
                  <FaEdit /> Редагувати
                </button>
                
                <button
                  className="btn-share"
                  onClick={handleShare}
                >
                  <FaShare /> Поділитися
                </button>
                
                {material.files?.length > 0 && (
                  <button
                    className="btn-download-all"
                    onClick={handleDownloadAll}
                    disabled={downloading['all']}
                  >
                    {downloading['all'] ? (
                      <FaSpinner className="loading-spinner-small" />
                    ) : (
                      <FaDownload />
                    )}
                    Завантажити всі
                  </button>
                )}
                
                <button
                  className="btn-delete"
                  onClick={() => setConfirmDelete(true)}
                >
                  <FaTrash /> Видалити
                </button>
              </div>
            </div>

            <div className="material-meta">
              <div className="meta-item">
                <FaCalendarAlt />
                <span>Створено: {formatDate(material.created_at)}</span>
              </div>
              <div className="meta-item">
                <FaClock />
                <span>Оновлено: {formatDate(material.updated_at)}</span>
              </div>
              {analytics?.views && (
                <div className="meta-item">
                  <FaEye />
                  <span>Переглядів: {analytics.views}</span>
                </div>
              )}
              {analytics?.downloads && (
                <div className="meta-item">
                  <FaDownload />
                  <span>Завантажень: {analytics.downloads}</span>
                </div>
              )}
            </div>
          </div>

          <div className="material-tabs">
            <button
              className={`tab-button ${activeTab === 'files' ? 'active' : ''}`}
              onClick={() => handleTabChange('files')}
            >
              <FaFile /> Файли
            </button>
            <button
              className={`tab-button ${activeTab === 'info' ? 'active' : ''}`}
              onClick={() => handleTabChange('info')}
            >
              <FaGraduationCap /> Інформація
            </button>
            {analytics && (
              <button
                className={`tab-button ${activeTab === 'analytics' ? 'active' : ''}`}
                onClick={() => handleTabChange('analytics')}
              >
                <FaChartLine /> Аналітика
              </button>
            )}
          </div>

          <div className="tab-content">
            {activeTab === 'files' && (
              <div className="files-tab">
                {material.files && material.files.length > 0 ? (
                  <div className="files-grid">
                    {material.files.map(file => (
                      <div key={file.id} className="file-card">
                        <div className="file-preview">
                          <div className="file-icon">
                            {getFileIcon(file.file_type)}
                          </div>
                          <div className="file-overlay">
                            <button
                              className="file-action"
                              onClick={() => handleDownload(file.id, file.name)}
                              disabled={downloading[file.id]}
                            >
                              {downloading[file.id] ? (
                                <FaSpinner className="loading-spinner-small" />
                              ) : (
                                <FaDownload />
                              )}
                            </button>
                          </div>
                        </div>
                        <div className="file-info">
                          <div className="file-name">{file.name}</div>
                          <div className="file-details">
                            <span>{formatFileSize(file.file_size)}</span>
                            <span>{file.file_type}</span>
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
            )}

            {activeTab === 'info' && (
              <div className="info-tab">
                <div className="info-section">
                  <h3>Опис</h3>
                  {material.description ? (
                    <p className="description">{material.description}</p>
                  ) : (
                    <p className="no-description">Опис відсутній</p>
                  )}
                </div>

                <div className="info-section">
                  <h3>Курс</h3>
                  <div className="course-info">
                    <FaGraduationCap />
                    <span>{material.course?.title || 'Без курсу'}</span>
                  </div>
                </div>

                <div className="info-section">
                  <h3>Статистика файлів</h3>
                  <div className="file-stats">
                    <div className="stat-item">
                      <div className="stat-value">{material.files?.length || 0}</div>
                      <div className="stat-label">Файлів</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-value">{formatFileSize(totalSize)}</div>
                      <div className="stat-label">Загальний розмір</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-value">
                        {new Set(material.files?.map(f => f.file_type)).size || 0}
                      </div>
                      <div className="stat-label">Типів файлів</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'analytics' && analytics && (
              <div className="analytics-tab">
                <div className="analytics-section">
                  <h3>Статистика використання</h3>
                  <div className="analytics-grid">
                    <div className="analytics-card">
                      <div className="analytics-icon">
                        <FaEye />
                      </div>
                      <div className="analytics-data">
                        <div className="analytics-value">{analytics.views || 0}</div>
                        <div className="analytics-label">Переглядів</div>
                      </div>
                    </div>
                    
                    <div className="analytics-card">
                      <div className="analytics-icon">
                        <FaDownload />
                      </div>
                      <div className="analytics-data">
                        <div className="analytics-value">{analytics.downloads || 0}</div>
                        <div className="analytics-label">Завантажень</div>
                      </div>
                    </div>
                    
                    <div className="analytics-card">
                      <div className="analytics-icon">
                        <FaUsers />
                      </div>
                      <div className="analytics-data">
                        <div className="analytics-value">{analytics.unique_users || 0}</div>
                        <div className="analytics-label">Унікальних користувачів</div>
                      </div>
                    </div>
                  </div>
                </div>

                {analytics.recent_activity?.length > 0 && (
                  <div className="analytics-section">
                    <h3>Нещодавня активність</h3>
                    <div className="activity-list">
                      {analytics.recent_activity.map((activity, index) => (
                        <div key={index} className="activity-item">
                          <div className="activity-icon">
                            {activity.type === 'view' ? <FaEye /> : <FaDownload />}
                          </div>
                          <div className="activity-content">
                            <div className="activity-text">
                              {activity.user || 'Анонім'} {activity.type === 'view' ? 'переглянув' : 'завантажив'} матеріал
                            </div>
                            <div className="activity-time">{formatDate(activity.timestamp)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {confirmDelete && (
          <div className="delete-confirmation-modal">
            <div className="delete-confirmation-content">
              <h2>Видалення матеріалу</h2>
              <p>
                Ви впевнені, що хочете видалити матеріал <strong>"{material.title}"</strong>?
                Усі файли та дані пов'язані з цим матеріалом будуть видалені назавжди.
              </p>
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
                  <FaTrash /> Видалити матеріал
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