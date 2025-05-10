import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../../api';
import TeacherHeader from './TeacherHeader';
import TeacherSidebar from './TeacherSidebar';
import { 
  FaLink,
  FaPlus,
  FaTrash,
  FaSpinner,
  FaExclamationTriangle,
  FaArrowLeft,
  FaPencilAlt,
  FaSave,
  FaTimes,
  FaYoutube,
  FaExternalLinkAlt
} from 'react-icons/fa';
import '../../css/teacher/TeacherLessonLinks.css';

function TeacherLessonLinks() {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [newLink, setNewLink] = useState('');
  const [editingLink, setEditingLink] = useState(null);
  const [linkError, setLinkError] = useState('');
  const { lessonId } = useParams();
  const navigate = useNavigate();

  // Helper functions for URL handling
  const validateUrl = (url) => {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch (e) {
      return false;
    }
  };

  const formatUrl = (url) => {
    try {
      const urlObject = new URL(url);
      const path = urlObject.pathname === '/' ? '' : urlObject.pathname;
      let displayUrl = urlObject.hostname + path;
      if (displayUrl.length > 40) {
        displayUrl = displayUrl.substring(0, 37) + '...';
      }
      return displayUrl;
    } catch (e) {
      return url;
    }
  };

  const isYoutubeUrl = (url) => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.includes('youtube.com') || urlObj.hostname.includes('youtu.be');
    } catch (e) {
      return false;
    }
  };

  useEffect(() => {
    const userRole = sessionStorage.getItem('userRole');
    if (userRole !== 'teacher') {
      navigate('/login');
      return;
    }

    fetchLinks();
  }, [lessonId, navigate]);

  const fetchLinks = async () => {
    try {
      setLoading(true);
      await axios.get(`${API_URL}/get-csrf-token/`, { withCredentials: true });
      const response = await axios.get(`${API_URL}/lessons/${lessonId}/links/`, {
        withCredentials: true
      });
      setLinks(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching links:', error);
      setError('Не вдалося завантажити посилання');
      setLoading(false);
    }
  };

  const handleAddLink = async (e) => {
    e.preventDefault();
    const trimmedLink = newLink.trim();
    
    if (!trimmedLink) {
      setLinkError('Введіть URL посилання');
      return;
    }

    if (!validateUrl(trimmedLink)) {
      setLinkError('Введіть коректний URL (має починатися з http:// або https://)');
      return;
    }

    try {
      setSaving(true);
      await axios.get(`${API_URL}/get-csrf-token/`, { withCredentials: true });
      await axios.post(`${API_URL}/lessons/add-lesson-links/${lessonId}/`, {
        links: [trimmedLink]
      }, {
        withCredentials: true
      });
      setNewLink('');
      setLinkError('');
      await fetchLinks();
    } catch (error) {
      console.error('Error adding link:', error);
      setError('Не вдалося додати посилання');
    } finally {
      setSaving(false);
    }
  };

  const handleEditLink = async (link) => {
    if (!editingLink) {
      setEditingLink({
        id: link.id,
        link_url: link.link_url
      });
      return;
    }

    if (!validateUrl(editingLink.link_url)) {
      setLinkError('Введіть коректний URL (має починатися з http:// або https://)');
      return;
    }

    try {
      setSaving(true);
      await axios.get(`${API_URL}/get-csrf-token/`, { withCredentials: true });
      await axios.put(`${API_URL}/lessons/link/update/${editingLink.id}/`, {
        link_url: editingLink.link_url
      }, {
        withCredentials: true
      });
      setEditingLink(null);
      setLinkError('');
      await fetchLinks();
    } catch (error) {
      console.error('Error updating link:', error);
      setError('Не вдалося оновити посилання');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteLink = async (linkId) => {
    if (window.confirm('Ви впевнені, що хочете видалити це посилання?')) {
      try {
        setSaving(true);
        await axios.get(`${API_URL}/get-csrf-token/`, { withCredentials: true });
        await axios.delete(`${API_URL}/lessons/link/delete/${linkId}/`, {
          withCredentials: true
        });
        await fetchLinks();
      } catch (error) {
        console.error('Error deleting link:', error);
        setError('Не вдалося видалити посилання');
      } finally {
        setSaving(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="teacher-lesson-links-wrapper">
        <TeacherHeader />
        <div className="teacher-lesson-links-container">
          <TeacherSidebar />
          <div className="teacher-lesson-links-content">
            <div className="loading-container">
              <FaSpinner className="spinner" />
              <p>Завантаження посилань...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="teacher-lesson-links-wrapper">
      <TeacherHeader />
      <div className="teacher-lesson-links-container">
        <TeacherSidebar />
        <div className="teacher-lesson-links-content">
          <div className="links-header">
            <button className="back-button" onClick={() => navigate(`/teacher/lessons/${lessonId}`)}>
              <FaArrowLeft /> Назад до уроку
            </button>
            <h1>Управління посиланнями</h1>
          </div>

          {error && (
            <div className="error-message">
              <FaExclamationTriangle /> {error}
            </div>
          )}

          <form className="add-link-form" onSubmit={handleAddLink}>
            <div className="link-input-wrapper">
              <input
                type="url"
                placeholder="Введіть URL посилання (http:// або https://)"
                value={newLink}
                onChange={(e) => {
                  setNewLink(e.target.value);
                  setLinkError('');
                }}
                className={`link-input ${linkError ? 'error' : ''}`}
              />
              <button type="submit" disabled={saving || !newLink}>
                {saving ? (
                  <>
                    <FaSpinner className="spinner" /> Додавання...
                  </>
                ) : (
                  <>
                    <FaPlus /> Додати посилання
                  </>
                )}
              </button>
            </div>
            {linkError && (
              <div className="error-text">
                <FaExclamationTriangle /> {linkError}
              </div>
            )}
          </form>

          <div className="links-list">
            {links.map(link => (
              <div key={link.id} className="link-item">
                {editingLink && editingLink.id === link.id ? (
                  <div className="link-edit-form">
                    <input
                      type="url"
                      value={editingLink.link_url}
                      onChange={(e) => {
                        setEditingLink({
                          ...editingLink,
                          link_url: e.target.value
                        });
                        setLinkError('');
                      }}
                      className={`link-input ${linkError ? 'error' : ''}`}
                    />
                    <div className="edit-actions">
                      <button 
                        className="save-button"
                        onClick={() => handleEditLink(link)}
                        disabled={saving}
                      >
                        {saving ? <FaSpinner className="spinner" /> : <FaSave />}
                      </button>
                      <button 
                        className="cancel-button"
                        onClick={() => {
                          setEditingLink(null);
                          setLinkError('');
                        }}
                      >
                        <FaTimes />
                      </button>
                    </div>
                    {linkError && (
                      <div className="error-text">
                        <FaExclamationTriangle /> {linkError}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="link-info">
                    {isYoutubeUrl(link.link_url) ? <FaYoutube className="link-icon youtube" /> : <FaLink className="link-icon" />}
                    <div className="link-content">
                      <a href={link.link_url} target="_blank" rel="noopener noreferrer" className="link-url">
                        {formatUrl(link.link_url)} <FaExternalLinkAlt className="external-icon" />
                      </a>
                    </div>
                    <div className="link-actions">
                      <button 
                        className="edit-button"
                        onClick={() => handleEditLink(link)}
                        title="Редагувати посилання"
                      >
                        <FaPencilAlt />
                      </button>
                      <button 
                        className="delete-button"
                        onClick={() => handleDeleteLink(link.id)}
                        title="Видалити посилання"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {links.length === 0 && (
              <p className="no-links">Немає доданих посилань</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TeacherLessonLinks;
