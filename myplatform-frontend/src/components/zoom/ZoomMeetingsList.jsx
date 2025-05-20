// src/components/zoom/ZoomMeetingsList.jsx - Enhanced version
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  ChevronRight,
  Search,
  Filter,
  List,
  Grid
} from 'lucide-react';

const ZoomMeetingsList = ({ courseId, onSelectMeeting }) => {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const navigate = useNavigate();

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

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('uk-UA', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      }),
      time: date.toLocaleTimeString('uk-UA', {
        hour: '2-digit',
        minute: '2-digit'
      }),
      rawDate: date
    };
  };

  const getFilteredMeetings = () => {
    // First filter by search query
    let filtered = meetings;
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(meeting => 
        meeting.topic.toLowerCase().includes(query) || 
        (meeting.description && meeting.description.toLowerCase().includes(query))
      );
    }
    
    // Then filter by tab
    const now = new Date();
    
    switch (activeTab) {
      case 'upcoming':
        return filtered.filter(meeting => 
          new Date(meeting.start_time) > now && 
          meeting.status !== 'canceled'
        );
      case 'active':
        return filtered.filter(meeting => 
          meeting.is_active || 
          (meeting.can_join && meeting.status !== 'canceled')
        );
      case 'past':
        return filtered.filter(meeting => 
          (new Date(meeting.end_time) < now && meeting.status !== 'canceled') || 
          meeting.status === 'ended'
        );
      case 'canceled':
        return filtered.filter(meeting => meeting.status === 'canceled');
      default:
        return filtered;
    }
  };

  const handleMeetingClick = (meeting) => {
    if (onSelectMeeting) {
      onSelectMeeting(meeting);
    } else {
      navigate(`/zoom/meetings/${meeting.id}`);
    }
  };

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
      return {
        label: 'Завершено',
        className: 'ended'
      };
    } else {
      return {
        label: 'В процесі',
        className: 'active'
      };
    }
  };

  const canJoinMeeting = (meeting) => {
    return meeting.can_join && meeting.status !== 'canceled';
  };

  const renderGridView = () => {
    return (
      <div className="zoom-meetings-grid">
        {getFilteredMeetings().map(meeting => {
          const { date, time } = formatDateTime(meeting.start_time);
          const status = getMeetingStatus(meeting);
          
          return (
            <div 
              key={meeting.id} 
              className={`zoom-meeting-card ${status.className} ${canJoinMeeting(meeting) ? 'joinable' : ''}`}
              onClick={() => handleMeetingClick(meeting)}
            >
              <div className="meeting-card-header">
                <div className={`meeting-status-icon ${status.className}`}>
                  {status.className === 'active' && <Video size={16} />}
                  {status.className === 'upcoming' && <Clock size={16} />}
                  {status.className === 'soon' && <AlertTriangle size={16} />}
                  {status.className === 'ended' && <Check size={16} />}
                  {status.className === 'canceled' && <X size={16} />}
                </div>
                <span className={`meeting-status-text ${status.className}`}>
                  {status.label}
                </span>
              </div>
              
              <h3 className="meeting-card-title">{meeting.topic}</h3>
              
              <div className="meeting-card-info">
                <div className="info-row">
                  <Calendar size={14} />
                  <span>{date}</span>
                </div>
                <div className="info-row">
                  <Clock size={14} />
                  <span>{time}</span>
                </div>
                <div className="info-row">
                  <User size={14} />
                  <span>
                    {meeting.created_by_data?.first_name} {meeting.created_by_data?.last_name}
                  </span>
                </div>
              </div>
              
              {meeting.description && (
                <div className="meeting-card-description">
                  {meeting.description.length > 100 
                    ? `${meeting.description.substring(0, 100)}...` 
                    : meeting.description}
                </div>
              )}
              
              {canJoinMeeting(meeting) && (
                <div className="meeting-card-action">
                  <Video size={16} />
                  <span>Приєднатися зараз</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderListView = () => {
    return (
      <div className="zoom-meetings-list-view">
        {getFilteredMeetings().map(meeting => {
          const { date, time } = formatDateTime(meeting.start_time);
          const status = getMeetingStatus(meeting);
          
          return (
            <div 
              key={meeting.id}
              className={`zoom-meeting-row ${status.className} ${canJoinMeeting(meeting) ? 'joinable' : ''}`}
              onClick={() => handleMeetingClick(meeting)}
            >
              <div className={`meeting-row-status ${status.className}`}>
                {status.className === 'active' && <Video size={18} />}
                {status.className === 'upcoming' && <Clock size={18} />}
                {status.className === 'soon' && <AlertTriangle size={18} />}
                {status.className === 'ended' && <Check size={18} />}
                {status.className === 'canceled' && <X size={18} />}
              </div>
              
              <div className="meeting-row-content">
                <h3 className="meeting-row-title">{meeting.topic}</h3>
                
                <div className="meeting-row-info">
                  <div className="row-info-item">
                    <Calendar size={14} />
                    <span>{date}</span>
                  </div>
                  <div className="row-info-item">
                    <Clock size={14} />
                    <span>{time}</span>
                  </div>
                  <div className="row-info-item">
                    <User size={14} />
                    <span>
                      {meeting.created_by_data?.first_name} {meeting.created_by_data?.last_name}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="meeting-row-action">
                <span className={`status-badge ${status.className}`}>
                  {status.label}
                </span>
                
                {canJoinMeeting(meeting) && (
                  <button className="join-now-btn">
                    <Video size={14} />
                    <span>Приєднатися</span>
                  </button>
                )}
                
                <ChevronRight size={18} className="row-arrow" />
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="zoom-meetings-loading">
        <div className="loading-spinner"></div>
        <p>Завантаження Zoom зустрічей...</p>
      </div>
    );
  }

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

  if (meetings.length === 0) {
    return (
      <div className="zoom-meetings-empty">
        <Video size={48} className="empty-icon" />
        <h3>Немає запланованих Zoom зустрічей</h3>
        <p>Для цього курсу ще не заплановано жодної відеоконференції</p>
      </div>
    );
  }

  return (
    <div className="zoom-meetings-container">
      <div className="meetings-toolbar">
        {/* Status tabs */}
        <div className="meetings-tabs">
          <button 
            className={`meeting-tab ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            Усі
          </button>
          <button 
            className={`meeting-tab ${activeTab === 'active' ? 'active' : ''}`}
            onClick={() => setActiveTab('active')}
          >
            Активні
          </button>
          <button 
            className={`meeting-tab ${activeTab === 'upcoming' ? 'active' : ''}`}
            onClick={() => setActiveTab('upcoming')}
          >
            Заплановані
          </button>
          <button 
            className={`meeting-tab ${activeTab === 'past' ? 'active' : ''}`}
            onClick={() => setActiveTab('past')}
          >
            Минулі
          </button>
          <button 
            className={`meeting-tab ${activeTab === 'canceled' ? 'active' : ''}`}
            onClick={() => setActiveTab('canceled')}
          >
            Скасовані
          </button>
        </div>
        
        <div className="meetings-actions">
          {/* Search */}
          <div className="meetings-search">
            <Search size={16} />
            <input 
              type="text" 
              placeholder="Пошук зустрічей..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          {/* View toggles */}
          <div className="view-toggles">
            <button 
              className={`view-toggle ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Плиткою"
            >
              <Grid size={18} />
            </button>
            <button 
              className={`view-toggle ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title="Списком"
            >
              <List size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="meetings-content">
        {getFilteredMeetings().length === 0 ? (
          <div className="no-meetings-found">
            <p>Немає {
              activeTab === 'all' ? '' :
              activeTab === 'upcoming' ? 'запланованих' : 
              activeTab === 'active' ? 'активних' : 
              activeTab === 'past' ? 'минулих' : 
              'скасованих'
            } Zoom зустрічей{searchQuery ? ` за запитом "${searchQuery}"` : ''}</p>
          </div>
        ) : (
          viewMode === 'grid' ? renderGridView() : renderListView()
        )}
      </div>
    </div>
  );
};

export default ZoomMeetingsList;