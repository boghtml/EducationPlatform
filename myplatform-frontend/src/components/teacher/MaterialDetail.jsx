import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import TeacherHeader from './TeacherHeader';
import TeacherSidebar from './TeacherSidebar';
import {
  ChevronLeft,
  Edit,
  Download,
  Share2,
  Trash2,
  File,
  Loader,
  AlertCircle,
  Eye,
  GraduationCap,
  Calendar,
  Clock,
  Users,
  BarChart,
  List,
  Grid3X3,
  Info,
  CheckCircle,
  Package,
  FolderOpen
} from 'lucide-react';
import API_URL from '../../api';
import '../../css/teacher/MaterialDetail.css';

function MaterialDetail() {
  const { materialId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [material, setMaterial] = useState(null);
  const [activeTab, setActiveTab] = useState('files');
  const [downloading, setDownloading] = useState(false);
  const [analytics, setAnalytics] = useState({
    views: 0,
    downloads: 0,
    shares: 0
  });

  useEffect(() => {
    fetchMaterialDetails();
  }, [materialId]);
  const fetchMaterialDetails = async () => {
    try {
      setLoading(true);
      await axios.get(`${API_URL}/get-csrf-token/`, { withCredentials: true });
      const response = await axios.get(`${API_URL}/materials/${materialId}/`, { withCredentials: true });
      setMaterial(response.data);
      
      // Simulate analytics data for demo
      setAnalytics({
        views: Math.floor(Math.random() * 500) + 50,
        downloads: Math.floor(Math.random() * 100) + 10,
        shares: Math.floor(Math.random() * 50) + 5
      });
    } catch (error) {
      console.error('Error fetching material:', error);
      setError('Failed to fetch material details');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadAll = async () => {
    if (!material?.files?.length) return;

    setDownloading(true);
    try {
      // Download each file
      material.files.forEach((file) => {
        const link = document.createElement('a');
        link.href = file.file_url;
        link.download = file.file_name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
    } catch (error) {
      console.error('Error downloading files:', error);
    } finally {
      setDownloading(false);
    }
  };

  const handleEdit = () => {
    navigate(`/teacher/materials/${materialId}/edit`);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this material? This action cannot be undone.')) {
      try {
        await axios.delete(`${API_URL}/materials/${materialId}/delete/`);
        navigate('/teacher/materials');
      } catch (error) {
        console.error('Error deleting material:', error);
        alert('Failed to delete material. Please try again.');
      }
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: material.title,
        text: material.description,
        url: window.location.href,
      });
    } catch (error) {
      // Fallback to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType) => {
    if (fileType?.toLowerCase().includes('pdf')) return <File className="material-detail__file-type-icon pdf" />;
    if (fileType?.toLowerCase().includes('doc')) return <File className="material-detail__file-type-icon doc" />;
    if (fileType?.toLowerCase().includes('image')) return <File className="material-detail__file-type-icon image" />;
    if (fileType?.toLowerCase().includes('video')) return <File className="material-detail__file-type-icon video" />;
    if (fileType?.toLowerCase().includes('audio')) return <File className="material-detail__file-type-icon audio" />;
    return <File className="material-detail__file-type-icon default" />;
  };

  if (loading) {
    return (
      <div className="material-detail__wrapper">
        <TeacherHeader />
        <div className="material-detail__container">
          <TeacherSidebar />
          <div className="material-detail__content">
            <div className="material-detail__loading">
              <Loader className="material-detail__loading-spinner" size={40} />
              <p>Loading material details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !material) {
    return (
      <div className="material-detail__wrapper">
        <TeacherHeader />
        <div className="material-detail__container">
          <TeacherSidebar />
          <div className="material-detail__content">
            <div className="material-detail__error">
              <AlertCircle size={48} />
              <h3>Error Loading Material</h3>
              <p>{error || 'Material not found'}</p>
              <button 
                onClick={() => navigate('/teacher/materials')} 
                className="material-detail__btn-back"
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

  return (
    <div className="material-detail__wrapper">
      <TeacherHeader />
      <div className="material-detail__container">
        <TeacherSidebar />
        <div className="material-detail__content">
          <div className="material-detail__header">
            <button
              onClick={() => navigate('/teacher/materials')}
              className="material-detail__btn-back"
            >
              <ChevronLeft size={20} />
              Back to Materials
            </button>

            <div className="material-detail__title-section">
              <div className="material-detail__title-group">
                <h1>{material.title}</h1>
                <div className="material-detail__tags">
                  <span className="material-detail__tag">
                    {material.files?.length || 0} files
                  </span>
                  <span className="material-detail__tag">
                    {formatFileSize(material.files?.reduce((acc, file) => acc + (file.file_size || 0), 0) || 0)}
                  </span>
                </div>
              </div>

              <div className="material-detail__actions">
                <button
                  onClick={handleEdit}
                  className="material-detail__btn-edit"
                >
                  <Edit size={16} />
                  Edit
                </button>
                <button
                  onClick={handleShare}
                  className="material-detail__btn-share"
                >
                  <Share2 size={16} />
                  Share
                </button>
                <button
                  onClick={handleDownloadAll}
                  className="material-detail__btn-download-all"
                  disabled={downloading || !material.files?.length}
                >
                  {downloading ? (
                    <Loader className="material-detail__loading-spinner-small" size={16} />
                  ) : (
                    <Download size={16} />
                  )}
                  Download All
                </button>
                <button
                  onClick={handleDelete}
                  className="material-detail__btn-delete"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            </div>

            <div className="material-detail__meta">
              <div className="material-detail__meta-item">
                <Calendar size={16} />
                <span>Created {formatDate(material.created_at)}</span>
              </div>
              {material.updated_at !== material.created_at && (
                <div className="material-detail__meta-item">
                  <Clock size={16} />
                  <span>Updated {formatDate(material.updated_at)}</span>
                </div>
              )}
              <div className="material-detail__meta-item">
                <GraduationCap size={16} />
                <span>{material.course}</span>
              </div>
            </div>
          </div>

          <div className="material-detail__tabs">
            <button
              onClick={() => setActiveTab('files')}
              className={`material-detail__tab-button ${activeTab === 'files' ? 'material-detail__active' : ''}`}
            >
              <FolderOpen size={16} />
              Files
            </button>
            <button
              onClick={() => setActiveTab('info')}
              className={`material-detail__tab-button ${activeTab === 'info' ? 'material-detail__active' : ''}`}
            >
              <Info size={16} />
              Information
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`material-detail__tab-button ${activeTab === 'analytics' ? 'material-detail__active' : ''}`}
            >
              <BarChart size={16} />
              Analytics
            </button>
          </div>

          <div className="material-detail__tab-content">
            {activeTab === 'files' && (
              <div className="material-detail__files-tab">
                {material.files?.length > 0 ? (
                  <div className="material-detail__files-grid">
                    {material.files.map((file) => (
                      <div key={file.id} className="material-detail__file-card">
                        <div className="material-detail__file-preview">
                          {getFileIcon(file.file_type)}
                          <div className="material-detail__file-overlay">
                            <a
                              href={file.file_url}
                              download={file.file_name}
                              className="material-detail__file-action"
                              title="Download"
                            >
                              <Download size={16} />
                            </a>
                          </div>
                        </div>
                        <div className="material-detail__file-info">
                          <span className="material-detail__file-name">
                            {file.file_name}
                          </span>
                          <div className="material-detail__file-details">
                            <span>{file.file_type?.toUpperCase() || 'FILE'}</span>
                            <span>{formatFileSize(file.file_size)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="material-detail__no-files">
                    <Package size={48} />
                    <h3>No Files Attached</h3>
                    <p>This material doesn't have any files attached yet.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'info' && (
              <div className="material-detail__info-tab">
                <div className="material-detail__info-section">
                  <h3>Description</h3>
                  {material.description ? (
                    <p className="material-detail__description">{material.description}</p>
                  ) : (
                    <p className="material-detail__no-description">No description provided.</p>
                  )}
                </div>

                <div className="material-detail__info-section">
                  <h3>Course Information</h3>
                  <div className="material-detail__course-info">
                    <GraduationCap size={16} />
                    <span>{material.course}</span>
                  </div>
                </div>

                <div className="material-detail__info-section">
                  <h3>File Statistics</h3>
                  <div className="material-detail__file-stats">
                    <div className="material-detail__stat-item">
                      <div className="material-detail__stat-value">{material.files?.length || 0}</div>
                      <div className="material-detail__stat-label">Total Files</div>
                    </div>
                    <div className="material-detail__stat-item">
                      <div className="material-detail__stat-value">
                        {formatFileSize(material.files?.reduce((acc, file) => acc + (file.file_size || 0), 0) || 0)}
                      </div>
                      <div className="material-detail__stat-label">Total Size</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="material-detail__analytics-tab">
                <div className="material-detail__analytics-section">
                  <h3>Usage Statistics</h3>
                  <div className="material-detail__analytics-grid">
                    <div className="material-detail__analytics-card">
                      <div className="material-detail__analytics-icon">
                        <Eye size={24} />
                      </div>
                      <div className="material-detail__analytics-data">
                        <div className="material-detail__analytics-value">{analytics.views}</div>
                        <div className="material-detail__analytics-label">Views</div>
                      </div>
                    </div>

                    <div className="material-detail__analytics-card">
                      <div className="material-detail__analytics-icon">
                        <Download size={24} />
                      </div>
                      <div className="material-detail__analytics-data">
                        <div className="material-detail__analytics-value">{analytics.downloads}</div>
                        <div className="material-detail__analytics-label">Downloads</div>
                      </div>
                    </div>

                    <div className="material-detail__analytics-card">
                      <div className="material-detail__analytics-icon">
                        <Share2 size={24} />
                      </div>
                      <div className="material-detail__analytics-data">
                        <div className="material-detail__analytics-value">{analytics.shares}</div>
                        <div className="material-detail__analytics-label">Shares</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MaterialDetail;