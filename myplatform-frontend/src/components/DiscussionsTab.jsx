// src/components/DiscussionsTab.jsx - Оновлена версія з інтеграцією Zoom

import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import ChatComponent from './chat/ChatComponent';
import '../css/WorkingWithCourse.css';
import '../css/DiscussionsTab.css'; // Додаємо новий файл стилів
import ZoomMeetingsList from './zoom/ZoomMeetingsList';
import ZoomModal from './zoom/ZoomModal';
import { Video, MessageCircle } from 'lucide-react';

function DiscussionsTab() {
  const { course } = useOutletContext();
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' або 'zoom'
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  
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

  return (
    <div className="course-wc-discussions-tab">
      <div className="course-wc-content-header">
        <h2>Обговорення курсу</h2>
        <p>Спілкуйтеся з іншими студентами та викладачами курсу в чаті або беріть участь у відеоконференціях</p>
        
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
      {activeTab === 'zoom' && (
        <div className="course-wc-zoom-container">
          <ZoomMeetingsList
            courseId={course.id}
            onSelectMeeting={handleSelectMeeting}
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

export default DiscussionsTab;