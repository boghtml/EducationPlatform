// Updated DiscussionsTab.jsx with improved Zoom integration
import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import ChatComponent from './chat/ChatComponent';
import '../css/WorkingWithCourse.css';
import '../css/DiscussionsTab.css';
import ZoomMeetingsList from './zoom/ZoomMeetingsList';
import { Video, MessageCircle, Calendar, Clock, ExternalLink } from 'lucide-react';
import zoomApi from './api/zoomApi';

function DiscussionsTab() {
  const { course } = useOutletContext();
  const [activeTab, setActiveTab] = useState('chat');
  const [meetings, setMeetings] = useState([]);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  // Fetch meetings when tab is active or course changes
  useEffect(() => {
    if (activeTab === 'zoom' && course?.id) {
      fetchMeetings();
    }
  }, [activeTab, course?.id]);
  
  // Function to fetch Zoom meetings for the course
  const fetchMeetings = async () => {
    try {
      setLoading(true);
      const data = await zoomApi.getCourseZoomMeetings(course.id);
      setMeetings(data || []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching Zoom meetings:', err);
      setError('Не вдалося завантажити список Zoom зустрічей');
      setLoading(false);
    }
  };

  // Handle tab switching
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };
  
  // Handle meeting selection for viewing details
  const handleSelectMeeting = (meeting) => {
    setSelectedMeeting(meeting);
  };
  
  // Handle joining a meeting
  const handleJoinMeeting = (meetingId) => {
    navigate(`/zoom/meetings/${meetingId}`);
  };
  
  // Format date and time
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
      })
    };
  };

  return (
    <div className="course-wc-discussions-tab">
      <div className="course-wc-content-header">
        <h2>Обговорення курсу</h2>
        <p>Спілкуйтеся з іншими студентами та викладачами курсу в чаті або беріть участь у відеоконференціях</p>
        
        {/* Tab switcher */}
        <div className="discussions-tabs">
          <button 
            className={`discussions-tab-btn ${activeTab === 'chat' ? 'active' : ''}`} 
            onClick={() => handleTabChange('chat')}
          >
            <MessageCircle size={18} />
            <span>Чат</span>
          </button>
          <button 
            className={`discussions-tab-btn ${activeTab === 'zoom' ? 'active' : ''}`} 
            onClick={() => handleTabChange('zoom')}
          >
            <Video size={18} />
            <span>Відеоконференції</span>
          </button>
        </div>
      </div>
      
      {/* Chat tab content */}
      {activeTab === 'chat' && (
        <div className="course-wc-chat-container">
          <ChatComponent />
        </div>
      )}
      
      {/* Zoom meetings tab content */}
      {activeTab === 'zoom' && (
        <div className="course-wc-zoom-container">
          {selectedMeeting ? (
            <div className="zoom-meeting-details">
              <button 
                className="back-to-list-btn"
                onClick={() => setSelectedMeeting(null)}
              >
                ← Повернутися до списку
              </button>
              
              <div className="zoom-meeting-card">
                <h3 className="meeting-title">{selectedMeeting.topic}</h3>
                
                <div className="meeting-meta">
                  <div className="meeting-meta-item">
                    <Calendar size={16} />
                    <span>{formatDateTime(selectedMeeting.start_time).date}</span>
                  </div>
                  <div className="meeting-meta-item">
                    <Clock size={16} />
                    <span>
                      {formatDateTime(selectedMeeting.start_time).time} - 
                      {formatDateTime(selectedMeeting.end_time).time}
                    </span>
                  </div>
                </div>
                
                {selectedMeeting.description && (
                  <div className="meeting-description">
                    <h4>Опис зустрічі:</h4>
                    <p>{selectedMeeting.description}</p>
                  </div>
                )}
                
                <div className="meeting-join-options">
                  <div className="meeting-status">
                    <span className={`status-badge ${selectedMeeting.status}`}>
                      {selectedMeeting.status === 'scheduled' && 'Заплановано'}
                      {selectedMeeting.status === 'live' && 'В процесі'}
                      {selectedMeeting.status === 'ended' && 'Завершено'}
                      {selectedMeeting.status === 'canceled' && 'Скасовано'}
                    </span>
                  </div>
                  
                  {selectedMeeting.can_join && (
                    <div className="join-buttons">
                      <button 
                        className="join-browser-btn" 
                        onClick={() => handleJoinMeeting(selectedMeeting.id)}
                      >
                        <Video size={16} />
                        Приєднатися через браузер
                      </button>
                      
                      {selectedMeeting.join_url && (
                        <a 
                          href={selectedMeeting.join_url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="join-app-btn"
                        >
                          <ExternalLink size={16} />
                          Відкрити в Zoom додатку
                        </a>
                      )}
                    </div>
                  )}
                  
                  {!selectedMeeting.can_join && selectedMeeting.status === 'scheduled' && (
                    <p className="meeting-not-available">
                      Ви зможете приєднатися до цієї зустрічі за 15 хвилин до її початку.
                    </p>
                  )}
                  
                  {selectedMeeting.meeting_id && (
                    <div className="meeting-credentials">
                      <div className="credential-item">
                        <span className="credential-label">ID зустрічі:</span>
                        <span className="credential-value">{selectedMeeting.meeting_id}</span>
                      </div>
                      
                      {selectedMeeting.meeting_password && (
                        <div className="credential-item">
                          <span className="credential-label">Пароль:</span>
                          <span className="credential-value">{selectedMeeting.meeting_password}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <ZoomMeetingsList
              courseId={course.id}
              onSelectMeeting={handleSelectMeeting}
            />
          )}
        </div>
      )}
    </div>
  );
}

export default DiscussionsTab;