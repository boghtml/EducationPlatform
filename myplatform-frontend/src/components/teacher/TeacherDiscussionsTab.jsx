// src/components/teacher/TeacherDiscussionsTab.jsx
import React, { useState, useEffect } from 'react';
import { Video, MessageCircle, Plus } from 'lucide-react';
import '../../css/WorkingWithCourse.css';
import '../../css/teacher/TeacherDiscussionsTab.css';
import ChatComponent from '../chat/ChatComponent';
import ZoomMeetingsList from '../zoom/ZoomMeetingsList';
import ZoomModal from '../zoom/ZoomModal';
import CreateZoomMeeting from '../zoom/CreateZoomMeeting';

function TeacherDiscussionsTab({ course }) {
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' або 'zoom'
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [showCreateMeeting, setShowCreateMeeting] = useState(false);
  const [meetings, setMeetings] = useState([]);
  
  // Обробник перемикання вкладок
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };
  
  // Обробник вибору Zoom зустрічі
  const handleSelectMeeting = (meeting) => {
    setSelectedMeeting(meeting);
  };
  
  // Обробник закриття модального вікна Zoom
  const handleCloseZoomModal = () => {
    setSelectedMeeting(null);
  };
  
  // Обробник відображення форми створення зустрічі
  const handleShowCreateForm = () => {
    setShowCreateMeeting(true);
  };
  
  // Обробник скасування створення зустрічі
  const handleCancelCreate = () => {
    setShowCreateMeeting(false);
  };
  
  // Обробник успішного створення зустрічі
  const handleMeetingCreated = (newMeeting) => {
    setShowCreateMeeting(false);
    // Тут можна було б оновити список зустрічей, але ми перезавантажимо сторінку для простоти
    window.location.reload();
  };

  return (
    <div className="teacher-discussions-tab">
      <div className="course-wc-content-header">
        <div className="discussions-header-top">
          <h2>Обговорення курсу</h2>
          
          {activeTab === 'zoom' && !showCreateMeeting && (
            <button className="create-meeting-btn" onClick={handleShowCreateForm}>
              <Plus size={16} />
              Створити Zoom зустріч
            </button>
          )}
        </div>
        
        <p>Спілкуйтеся зі студентами курсу в чаті або організовуйте відеоконференції</p>
        
        {/* Перемикач вкладок Чат/Zoom */}
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
      
      {/* Вкладка з чатом */}
      {activeTab === 'chat' && (
        <div className="course-wc-chat-container">
          <ChatComponent />
        </div>
      )}
      
      {/* Вкладка з Zoom зустрічами */}
      {activeTab === 'zoom' && !showCreateMeeting && (
        <div className="course-wc-zoom-container">
          <ZoomMeetingsList
            courseId={course.id}
            onSelectMeeting={handleSelectMeeting}
          />
        </div>
      )}
      
      {/* Форма створення Zoom зустрічі */}
      {activeTab === 'zoom' && showCreateMeeting && (
        <div className="create-meeting-container">
          <CreateZoomMeeting
            courseId={course.id}
            onCreated={handleMeetingCreated}
            onCancel={handleCancelCreate}
          />
        </div>
      )}
      
      {/* Модальне вікно для Zoom зустрічі */}
      {selectedMeeting && (
        <ZoomModal
          meetingId={selectedMeeting.id}
          onClose={handleCloseZoomModal}
        />
      )}
    </div>
  );
}

export default TeacherDiscussionsTab;