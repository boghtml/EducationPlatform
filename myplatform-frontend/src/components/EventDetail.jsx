// src/components/EventDetail.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../api';
import Header from './Header';
import Footer from './Footer';
import { 
  FaCalendarAlt, 
  FaClock, 
  FaMapMarkerAlt, 
  FaUser, 
  FaArrowLeft,
  FaDownload,
  FaPaperclip,
  FaSpinner,
  FaExclamationTriangle,  FaBullhorn,
  FaNewspaper,
  FaRegCalendarCheck
} from 'react-icons/fa';
import '../css/eventDetail.css'; 

function EventDetail() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState('');
  const [isAuthor, setIsAuthor] = useState(false);

  useEffect(() => {
    const userRole = sessionStorage.getItem('userRole') || '';
    const userId = sessionStorage.getItem('userId');
    setUserRole(userRole);

    const fetchEventDetails = async () => {
      try {
        setLoading(true);
        
        await axios.get(`${API_URL}/get-csrf-token/`, { withCredentials: true });
        
        const response = await axios.get(`${API_URL}/events/events/${eventId}/`, {
          withCredentials: true
        });
        
        if (response.data) {
          setEvent(response.data);
          
          if (userId && response.data.author && response.data.author.id === parseInt(userId)) {
            setIsAuthor(true);
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching event details:", error);
        setError("Не вдалося завантажити деталі заходу. Будь ласка, спробуйте пізніше.");
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [eventId]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('uk-UA', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('uk-UA', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEventTypeIcon = (type) => {
    switch (type) {
      case 'event':
        return <FaRegCalendarCheck className="event-detail-icon event" />;
      case 'news':
        return <FaNewspaper className="event-detail-icon news" />;      case 'announcement':
        return <FaBullhorn className="event-detail-icon announcement" />;
      default:
        return <FaRegCalendarCheck className="event-detail-icon" />;
    }
  };

  const getEventTypeText = (type) => {
    switch (type) {
      case 'event':
        return 'Захід';
      case 'news':
        return 'Новина';
      case 'announcement':
        return 'Оголошення';
      default:
        return 'Захід';
    }
  };

  const canEdit = isAuthor || userRole === 'admin';

  if (loading) {
    return (
      <div className="event-detail-page">
        <Header />
        <div className="event-detail-container">
          <div className="event-detail-loading">
            <FaSpinner className="loading-spinner" />
            <p>Завантаження деталей заходу...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="event-detail-page">
        <Header />
        <div className="event-detail-container">
          <div className="event-detail-error">
            <FaExclamationTriangle />
            <h3>Помилка завантаження</h3>
            <p>{error}</p>
            <button 
              className="event-detail-btn-primary"
              onClick={() => window.location.reload()}
            >
              Спробувати знову
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="event-detail-page">
        <Header />
        <div className="event-detail-container">
          <div className="event-detail-not-found">
            <h3>Захід не знайдено</h3>
            <p>Запитаний захід не існує або був видалений.</p>
            <Link to="/events" className="event-detail-btn-back">
              <FaArrowLeft /> Повернутися до списку заходів
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="event-detail-page">
      <Header />
      
      <div className="event-detail-container">
        <div className="event-detail-header">
          <Link to="/events" className="event-detail-btn-back">
            <FaArrowLeft /> Повернутися до списку заходів
          </Link>
          
          <div className={`event-detail-type ${event.event_type}`}>
            {getEventTypeIcon(event.event_type)}
            <span>{getEventTypeText(event.event_type)}</span>
          </div>
          
          {canEdit && (
            <div className="event-detail-actions">
              <Link 
                to={userRole === 'teacher' ? `/teacher/announcements/edit/${event.id}` : `/admin/announcements/edit/${event.id}`} 
                className="event-detail-btn-edit"
              >
                Редагувати
              </Link>
            </div>
          )}
        </div>
        
        <h1 className="event-detail-title">{event.title}</h1>
        
        <div className="event-detail-meta">
          <div className="event-detail-author">
            <FaUser />
            <span>Автор: {event.author ? event.author.first_name && event.author.last_name ? 
              `${event.author.first_name} ${event.author.last_name}` : 
              event.author.username : 'Невідомий автор'}
            </span>
          </div>
          
          <div className="event-detail-date">
            <FaCalendarAlt />
            <span>Опубліковано: {formatDate(event.created_at)}</span>
          </div>
        </div>
        
        {event.image_url && (
          <div className="event-detail-image-container">
            <img 
              src={event.image_url} 
              alt={event.title} 
              className="event-detail-image" 
            />
          </div>
        )}
        
        <div className="event-detail-description">
          <p>{event.description}</p>
        </div>
        
        {event.event_type === 'event' && (
          <div className="event-detail-specifics">
            {event.start_date && (
              <div className="event-specific-item">
                <FaCalendarAlt />
                <div>
                  <strong>Дата проведення</strong>
                  <span>{formatDate(event.start_date)}</span>
                </div>
              </div>
            )}
            
            {event.start_date && (
              <div className="event-specific-item">
                <FaClock />
                <div>
                  <strong>Час</strong>
                  <span>{formatTime(event.start_date)}</span>
                </div>
              </div>
            )}
            
            {event.location && (
              <div className="event-specific-item">
                <FaMapMarkerAlt />
                <div>
                  <strong>Місце проведення</strong>
                  <span>{event.location}</span>
                </div>
              </div>
            )}
          </div>
        )}
        
        <div className="event-detail-content" dangerouslySetInnerHTML={{ __html: event.content }}></div>
        
        {event.files && event.files.length > 0 && (
          <div className="event-detail-files">
            <h3>
              <FaPaperclip /> Прикріплені файли
            </h3>
            <ul className="event-files-list">
              {event.files.map((file, index) => (
                <li key={index} className="event-file-item">
                  <a href={file.file_url} target="_blank" rel="noopener noreferrer" className="event-file-link">
                    <FaDownload /> {file.file_name || `Файл ${index + 1}`}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
}

export default EventDetail;