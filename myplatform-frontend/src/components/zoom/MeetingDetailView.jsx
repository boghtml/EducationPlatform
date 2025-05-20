import React, { useState } from 'react';
import { Calendar, Clock, User, FileText, Copy, Check, Link, Key } from 'lucide-react';

import './MeetingDetailView.css'; // Assuming you have a CSS file for styles

const MeetingDetailView = ({ meeting }) => {
  const [copiedId, setCopiedId] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!meeting) return null;

  // Format date and time
  const formatDateTime = (dateString) => {
    if (!dateString) return { date: 'Unavailable', time: 'Unavailable' };
    
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

  // Copy to clipboard function
  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text).then(() => {
      // Show copied notification
      if (type === 'id') setCopiedId(true);
      if (type === 'password') setCopiedPassword(true);
      if (type === 'link') setCopiedLink(true);
      
      // Reset after 2 seconds
      setTimeout(() => {
        if (type === 'id') setCopiedId(false);
        if (type === 'password') setCopiedPassword(false);
        if (type === 'link') setCopiedLink(false);
      }, 2000);
    });
  };
  
  const { date: startDate, time: startTime } = formatDateTime(meeting.start_time);
  const { date: endDate, time: endTime } = formatDateTime(meeting.end_time);
  
  // Get meeting status text
  const getMeetingStatusText = () => {
    switch(meeting.status) {
      case 'scheduled': return 'Заплановано';
      case 'live': return 'В процесі';
      case 'ended': return 'Завершено';
      case 'canceled': return 'Скасовано';
      default: return 'Заплановано';
    }
  };
  
  return (
    <div className="meeting-details">
      <h1 className="meeting-title">{meeting.topic}</h1>
      
      <div className="meeting-info">
        <div className="info-item">
          <Calendar size={20} className="info-icon" />
          <div className="info-content">
            <span className="info-label">Дата початку</span>
            <span className="info-value">{startDate}</span>
          </div>
        </div>
        
        <div className="info-item">
          <Clock size={20} className="info-icon" />
          <div className="info-content">
            <span className="info-label">Час</span>
            <span className="info-value">{startTime} - {endTime}</span>
          </div>
        </div>
        
        <div className="info-item">
          <User size={20} className="info-icon" />
          <div className="info-content">
            <span className="info-label">Організатор</span>
            <span className="info-value">
              {meeting.created_by_data ? 
                `${meeting.created_by_data.first_name} ${meeting.created_by_data.last_name}` 
                : 'Невідомо'}
            </span>
          </div>
        </div>
      </div>
      
      {meeting.description && (
        <div className="meeting-description">
          <FileText size={20} className="description-icon" />
          <div>
            <h3>Опис зустрічі</h3>
            <p>{meeting.description}</p>
          </div>
        </div>
      )}
      
      <div className="meeting-status-container">
        <div className="meeting-status-badge">
          {getMeetingStatusText()}
        </div>
        
        {!meeting.can_join && meeting.status === 'scheduled' && (
          <div className="join-info">
            <p>
              Ви зможете приєднатися до цієї зустрічі за 15 хвилин до її початку.
            </p>
          </div>
        )}
      </div>
      
      {/* Meeting credentials with copy buttons */}
      <div className="meeting-credentials">
        <h3>Інформація для приєднання</h3>
        
        {meeting.meeting_id && (
          <div className="credential-item">
            <div className="credential-label">
              <div className="icon-wrapper">
                <div className="credential-icon">ID</div>
              </div>
              <span>ID зустрічі:</span>
            </div>
            <div className="credential-value">{meeting.meeting_id}</div>
            <button 
              className="copy-btn" 
              onClick={() => copyToClipboard(meeting.meeting_id, 'id')}
              title="Скопіювати ID зустрічі"
            >
              {copiedId ? <Check size={16} /> : <Copy size={16} />}
            </button>
          </div>
        )}
        
        {meeting.meeting_password && (
          <div className="credential-item">
            <div className="credential-label">
              <div className="icon-wrapper">
                <Key size={16} className="credential-icon" />
              </div>
              <span>Пароль:</span>
            </div>
            <div className="credential-value">{meeting.meeting_password}</div>
            <button 
              className="copy-btn" 
              onClick={() => copyToClipboard(meeting.meeting_password, 'password')}
              title="Скопіювати пароль"
            >
              {copiedPassword ? <Check size={16} /> : <Copy size={16} />}
            </button>
          </div>
        )}
        
        {meeting.join_url && (
          <div className="credential-item">
            <div className="credential-label">
              <div className="icon-wrapper">
                <Link size={16} className="credential-icon" />
              </div>
              <span>Посилання:</span>
            </div>
            <div className="credential-value credential-url">{meeting.join_url}</div>
            <button 
              className="copy-btn" 
              onClick={() => copyToClipboard(meeting.join_url, 'link')}
              title="Скопіювати посилання"
            >
              {copiedLink ? <Check size={16} /> : <Copy size={16} />}
            </button>
          </div>
        )}
        
        <div className="credential-help">
          <p>Використовуйте ці дані для приєднання через додаток Zoom на іншому пристрої.</p>
        </div>
      </div>
      
      {/* External Zoom app button */}
      {meeting.join_url && (
        <div className="meeting-join-external">
          <p>Якщо ви бажаєте використовувати зовнішній Zoom клієнт:</p>
          <a href={meeting.join_url} target="_blank" rel="noopener noreferrer" className="external-join-btn">
            Відкрити у Zoom
          </a>
        </div>
      )}
    </div>
  );
};

export default MeetingDetailView;