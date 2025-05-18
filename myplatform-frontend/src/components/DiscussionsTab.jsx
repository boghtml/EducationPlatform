// src/components/DiscussionsTab.jsx

import React from 'react';
import { useOutletContext } from 'react-router-dom';
import ChatComponent from './chat/ChatComponent';
import '../css/WorkingWithCourse.css';

function DiscussionsTab() {
  const { course } = useOutletContext();

  return (
    <div className="course-wc-discussions-tab">
      <div className="course-wc-content-header">
        <h2>Обговорення курсу</h2>
        <p>Спілкуйтеся з іншими студентами та викладачами курсу в загальному чаті</p>
      </div>
        
      <div className="course-wc-chat-container">
        <ChatComponent />
      </div>
    </div>
  );
}

export default DiscussionsTab;