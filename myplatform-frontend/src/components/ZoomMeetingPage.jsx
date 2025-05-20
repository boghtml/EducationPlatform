// src/components/ZoomMeetingPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../css/ZoomMeetingPage.css';
import zoomApi from './api/zoomApi';
import ImprovedZoomMeeting from './zoom/ImprovedZoomMeeting';
import MeetingDetailView from './zoom/MeetingDetailView';

import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  User, 
  FileText, 
  AlertTriangle 
} from 'lucide-react';

function ZoomMeetingPage() {
  const { meetingId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [meeting, setMeeting] = useState(null);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    // Функція завантаження інформації про зустріч
    const fetchMeeting = async () => {
      try {
        setLoading(true);
        const data = await zoomApi.getZoomMeeting(meetingId);
        setMeeting(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching Zoom meeting:', err);
        setError(err.response?.data?.error || 'Помилка завантаження інформації про Zoom зустріч');
        setLoading(false);
      }
    };

    fetchMeeting();
  }, [meetingId]);

  // Форматування дати і часу
  const formatDateTime = (dateString) => {
    if (!dateString) return { date: 'Невідомо', time: 'Невідомо' };
    
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

  // Обробник повернення назад
  const handleBack = () => {
    navigate(-1);
  };

  // Обробник приєднання до зустрічі
  const handleJoinMeeting = async () => {
    try {
      setJoining(true);
      await zoomApi.joinZoomMeeting(meetingId);
      setJoining(false);
    } catch (err) {
      console.error('Error joining Zoom meeting:', err);
      setError(err.response?.data?.error || 'Не вдалося приєднатися до Zoom зустрічі');
      setJoining(false);
    }
  };

  // Якщо триває завантаження
  if (loading) {
    return (
      <div className="zoom-meeting-page loading">
        <div className="loading-spinner"></div>
        <p>Завантаження інформації про Zoom зустріч...</p>
      </div>
    );
  }

  // Якщо сталася помилка
  if (error) {
    return (
      <div className="zoom-meeting-page error">
        <div className="error-content">
          <AlertTriangle size={48} className="error-icon" />
          <h2>Помилка завантаження</h2>
          <p>{error}</p>
          <button className="back-btn" onClick={handleBack}>
            <ArrowLeft size={16} />
            Повернутися назад
          </button>
        </div>
      </div>
    );
  }

  // Якщо зустріч не знайдена
  if (!meeting) {
    return (
      <div className="zoom-meeting-page error">
        <div className="error-content">
          <AlertTriangle size={48} className="error-icon" />
          <h2>Зустріч не знайдена</h2>
          <p>Запитана Zoom зустріч не існує або ви не маєте до неї доступу.</p>
          <button className="back-btn" onClick={handleBack}>
            <ArrowLeft size={16} />
            Повернутися назад
          </button>
        </div>
      </div>
    );
  }

  // Форматування дат
  const { date: startDate, time: startTime } = formatDateTime(meeting.start_time);
  const { date: endDate, time: endTime } = formatDateTime(meeting.end_time);

  return (
    <div className="zoom-meeting-page">
      {/* Вбудована Zoom зустріч, якщо зустріч активна та можна приєднатися */}
      {meeting.can_join ? (
        <ImprovedZoomMeeting meetingId={meetingId} onClose={handleBack} />
      ) : (
        <div className="meeting-details-container">
          <button className="back-btn" onClick={handleBack}>
            <ArrowLeft size={16} />
            Повернутися назад
          </button>
          
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
                    {meeting.created_by_data?.first_name} {meeting.created_by_data?.last_name}
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
                {meeting.status === 'scheduled' && 'Заплановано'}
                {meeting.status === 'live' && 'В процесі'}
                {meeting.status === 'ended' && 'Завершено'}
                {meeting.status === 'canceled' && 'Скасовано'}
              </div>
              
              {!meeting.can_join && meeting.status === 'scheduled' && (
                <div className="join-info">
                  <p>
                    Ви зможете приєднатися до цієї зустрічі за 15 хвилин до її початку.
                  </p>
                </div>
              )}
              
              {meeting.status === 'ended' && (
                <div className="join-info">
                  <p>
                    Ця зустріч вже завершилася.
                  </p>
                </div>
              )}
              
              {meeting.status === 'canceled' && (
                <div className="join-info">
                  <p>
                    Ця зустріч була скасована.
                  </p>
                </div>
              )}
            </div>
            
            {meeting.meeting_id && (
              <div className="meeting-credentials">
                <div className="credentials-item">
                  <span className="credentials-label">ID зустрічі:</span>
                  <span className="credentials-value">{meeting.meeting_id}</span>
                </div>
                
                {meeting.meeting_password && (
                  <div className="credentials-item">
                    <span className="credentials-label">Пароль:</span>
                    <span className="credentials-value">{meeting.meeting_password}</span>
                  </div>
                )}
              </div>
            )}
            
            {meeting.join_url && (
              <div className="meeting-join-external">
                <p>Якщо ви бажаєте використовувати зовнішній Zoom клієнт:</p>
                <a href={meeting.join_url} target="_blank" rel="noopener noreferrer" className="external-join-btn">
                  Відкрити у Zoom
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ZoomMeetingPage;