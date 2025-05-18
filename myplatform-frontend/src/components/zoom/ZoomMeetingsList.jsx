// src/components/zoom/ZoomMeetingsList.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './ZoomMeetingsList.css';
import zoomApi from '../api/zoomApi';
import { 
  Calendar, 
  Clock, 
  User, 
  Video, 
  Check, 
  AlertTriangle,
  X,
  ChevronRight
} from 'lucide-react';

const ZoomMeetingsList = ({ courseId, onSelectMeeting }) => {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('upcoming');

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        setLoading(true);
        const data = await zoomApi.getCourseZoomMeetings(courseId);
        setMeetings(data || []);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching Zoom meetings:', err);
        setError('Не вдалося завантажити список Zoom зустрічей. Будь ласка, спробуйте пізніше.');
        setLoading(false);
      }
    };

    fetchMeetings();
  }, [courseId]);

  // Форматування дати і часу
  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    const formattedDate = date.toLocaleDateString('uk-UA', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
    const formattedTime = date.toLocaleTimeString('uk-UA', {
      hour: '2-digit',
      minute: '2-digit'
    });
    return { date: formattedDate, time: formattedTime };
  };

  // Отримання відфільтрованих зустрічей відповідно до вибраної вкладки
  const filteredMeetings = () => {
    const now = new Date();
    
    switch (activeTab) {
      case 'upcoming':
        return meetings.filter(meeting => 
          new Date(meeting.start_time) > now && 
          meeting.status !== 'canceled'
        );
      case 'past':
        return meetings.filter(meeting => 
          new Date(meeting.start_time) < now ||
          meeting.status === 'ended'
        );
      case 'active':
        return meetings.filter(meeting => meeting.is_active);
      default:
        return meetings;
    }
  };

  // Обробник вибору зустрічі
  const handleMeetingClick = (meeting) => {
    if (onSelectMeeting) {
      onSelectMeeting(meeting);
    }
  };

  // Обчислення статусу зустрічі для відображення
  const getMeetingStatus = (meeting) => {
    if (meeting.status === 'canceled') {
      return {
        label: 'Скасовано',
        className: 'canceled'
      };
    }

    if (meeting.is_active) {
      return {
        label: 'В процесі',
        className: 'active'
      };
    }

    const now = new Date();
    const startTime = new Date(meeting.start_time);
    const endTime = new Date(meeting.end_time);

    if (now < startTime) {
      // Зустріч ще не почалася
      const diffMs = startTime - now;
      const diffMins = Math.round(diffMs / 60000);
      const diffHours = Math.round(diffMs / 3600000);
      const diffDays = Math.round(diffMs / 86400000);

      if (diffMins < 60) {
        return {
          label: `Почнеться через ${diffMins} хв`,
          className: 'soon'
        };
      } else if (diffHours < 24) {
        return {
          label: `Почнеться через ${diffHours} год`,
          className: 'upcoming'
        };
      } else {
        return {
          label: `Почнеться через ${diffDays} дн`,
          className: 'upcoming'
        };
      }
    } else if (now > endTime) {
      // Зустріч вже закінчилася
      return {
        label: 'Завершено',
        className: 'ended'
      };
    } else {
      // Зустріч зараз активна
      return {
        label: 'В процесі',
        className: 'active'
      };
    }
  };

  // Перевірка, чи можна приєднатися до зустрічі
  const canJoinMeeting = (meeting) => {
    return meeting.can_join && meeting.status !== 'canceled';
  };

  // Якщо триває завантаження
  if (loading) {
    return (
      <div className="zoom-meetings-loading">
        <div className="loading-spinner"></div>
        <p>Завантаження Zoom зустрічей...</p>
      </div>
    );
  }

  // Якщо сталася помилка
  if (error) {
    return (
      <div className="zoom-meetings-error">
        <AlertTriangle size={24} />
        <p>{error}</p>
        <button 
          className="btn-retry"
          onClick={() => window.location.reload()}
        >
          Спробувати знову
        </button>
      </div>
    );
  }

  // Якщо зустрічей немає
  if (meetings.length === 0) {
    return (
      <div className="zoom-meetings-empty">
        <Video size={48} className="empty-icon" />
        <h3>Немає заплановах Zoom зустрічей</h3>
        <p>Для цього курсу ще не заплановано жодної відеоконференції</p>
      </div>
    );
  }

  return (
    <div className="zoom-meetings-list-container">
      {/* Вкладки для фільтрації зустрічей */}
      <div className="zoom-meetings-tabs">
        <button 
          className={`tab-button ${activeTab === 'upcoming' ? 'active' : ''}`}
          onClick={() => setActiveTab('upcoming')}
        >
          Заплановані
        </button>
        
        <button 
          className={`tab-button ${activeTab === 'active' ? 'active' : ''}`}
          onClick={() => setActiveTab('active')}
        >
          Активні
        </button>
        
        <button 
          className={`tab-button ${activeTab === 'past' ? 'active' : ''}`}
          onClick={() => setActiveTab('past')}
        >
          Минулі
        </button>
      </div>

      {/* Список зустрічей */}
      <div className="zoom-meetings-list">
        {filteredMeetings().length === 0 ? (
          <div className="no-meetings-message">
            <p>Немає {activeTab === 'upcoming' ? 'запланованих' : activeTab === 'active' ? 'активних' : 'минулих'} Zoom зустрічей</p>
          </div>
        ) : (
          filteredMeetings().map(meeting => {
            const { date, time } = formatDateTime(meeting.start_time);
            const status = getMeetingStatus(meeting);
            return (
              <div 
                key={meeting.id} 
                className={`zoom-meeting-item ${status.className} ${canJoinMeeting(meeting) ? 'joinable' : ''}`}
                onClick={() => canJoinMeeting(meeting) && handleMeetingClick(meeting)}
              >
                <div className="meeting-status-indicator">
                  {status.className === 'active' && <Video className="status-icon active" />}
                  {status.className === 'upcoming' && <Clock className="status-icon upcoming" />}
                  {status.className === 'soon' && <AlertTriangle className="status-icon soon" />}
                  {status.className === 'ended' && <Check className="status-icon ended" />}
                  {status.className === 'canceled' && <X className="status-icon canceled" />}
                </div>
                
                <div className="meeting-content">
                  <h3 className="meeting-title">{meeting.topic}</h3>
                  
                  <div className="meeting-info">
                    <div className="meeting-date-time">
                      <Calendar size={14} />
                      <span>{date}</span>
                    </div>
                    <div className="meeting-date-time">
                      <Clock size={14} />
                      <span>{time}</span>
                    </div>
                    <div className="meeting-host">
                      <User size={14} />
                      <span>
                        {meeting.created_by_data?.first_name} {meeting.created_by_data?.last_name}
                      </span>
                    </div>
                  </div>
                  
                  {meeting.description && (
                    <p className="meeting-description">{meeting.description}</p>
                  )}
                </div>
                
                <div className="meeting-status">
                  <span className={`status-badge ${status.className}`}>
                    {status.label}
                  </span>
                  
                  {canJoinMeeting(meeting) && (
                    <div className="join-indicator">
                      <span>Приєднатися</span>
                      <ChevronRight size={16} />
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ZoomMeetingsList;