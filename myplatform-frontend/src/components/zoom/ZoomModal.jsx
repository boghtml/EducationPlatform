// src/components/zoom/ZoomModal.jsx - Enhanced version
import React, { useState, useEffect } from 'react';
import './ZoomModal.css';
import { X, AlertTriangle, Video, ExternalLink, Copy } from 'lucide-react';
import ZoomMeeting from './ZoomMeeting';
import ZoomTroubleshooting from './ZoomTroubleshooting';
import BrowserCheck from './BrowserCheck';
import zoomApi from '../api/zoomApi';

const ZoomModal = ({ meetingId, onClose }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [errorType, setErrorType] = useState(null);
  const [showTroubleshooting, setShowTroubleshooting] = useState(false);
  const [showBrowserCheck, setShowBrowserCheck] = useState(false);
  const [meeting, setMeeting] = useState(null);
  const [showJoinView, setShowJoinView] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState(false);

  useEffect(() => {
    // Function to load meeting information
    const fetchMeeting = async () => {
      try {
        setIsLoading(true);
        const data = await zoomApi.getZoomMeeting(meetingId);
        setMeeting(data);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching Zoom meeting:', err);
        setError(err.response?.data?.error || 'Помилка завантаження інформації про Zoom зустріч');
        setIsLoading(false);
      }
    };

    // Check browser compatibility
    const hasSharedArrayBuffer = typeof SharedArrayBuffer !== 'undefined';
    const hasSecureContext = window.isSecureContext;
    
    console.log('Browser compatibility check:', {
      hasSharedArrayBuffer,
      hasSecureContext,
      isHttps: window.location.protocol === 'https:',
      crossOriginIsolated: window.crossOriginIsolated
    });
    
    // Need SharedArrayBuffer for Zoom SDK
    if (!hasSharedArrayBuffer || !hasSecureContext) {
      console.log('Browser environment check failed:',
        { hasSharedArrayBuffer, hasSecureContext });
      setShowBrowserCheck(true);
      setIsLoading(false);
      return;
    }

    fetchMeeting();
  }, [meetingId]);

  // Date and time formatting
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
  
  const handleClose = () => {
    // Add closing animation
    const container = document.querySelector('.zoom-modal-container');
    if (container) {
      container.classList.add('closing');
    }
    
    // Delay for animation
    setTimeout(() => {
      if (onClose) onClose();
    }, 300);
  };

  const handleError = (errorMessage) => {
    console.error('Zoom meeting error:', errorMessage);
    setError(errorMessage);
    
    // Determine error type for better display
    if (errorMessage.includes('password') || errorMessage.includes('Incorrect')) {
      setErrorType('password');
    } else if (errorMessage.includes('SharedArrayBuffer') || errorMessage.includes('WebAssembly')) {
      setErrorType('browser');
      setShowBrowserCheck(true);
    } else if (errorMessage.includes('has not started') || errorMessage.includes('not active')) {
      setErrorType('meeting_status');
    } else {
      setErrorType('general');
    }
  };

  const handleRetry = () => {
    // Reset all states and try again
    setError(null);
    setErrorType(null);
    setShowTroubleshooting(false);
    setShowBrowserCheck(false);
    setIsLoading(true);
    
    setTimeout(() => {
      setIsLoading(false);
      setShowJoinView(true);
    }, 1000);
  };

  const handleJoinMeeting = () => {
    setShowJoinView(true);
  };

  // Handler for copying meeting credentials
  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text).then(() => {
      if (type === 'id') {
        setCopiedId(true);
        setTimeout(() => setCopiedId(false), 2000);
      } else if (type === 'password') {
        setCopiedPassword(true);
        setTimeout(() => setCopiedPassword(false), 2000);
      }
    });
  };

  return (
    <div className="zoom-modal-overlay">
      <div className="zoom-modal-container">
        {isLoading ? (
          <div className="zoom-modal-loading">
            <div className="loading-spinner"></div>
            <p>Підготовка зустрічі...</p>
          </div>
        ) : showBrowserCheck ? (
          <BrowserCheck 
            onRetry={handleRetry}
            onClose={handleClose}
          />
        ) : showTroubleshooting ? (
          <ZoomTroubleshooting onBack={() => setShowTroubleshooting(false)} />
        ) : showJoinView && meeting && meeting.can_join ? (
          <>
            <div className="zoom-modal-close" onClick={handleClose}>
              <X size={20} />
            </div>
            <div className="zoom-modal-content">
              <ZoomMeeting 
                meetingId={meetingId} 
                onClose={handleClose} 
                onError={handleError}
              />
            </div>
          </>
        ) : meeting ? (
          <>
            <div className="zoom-modal-close" onClick={handleClose}>
              <X size={20} />
            </div>
            <div className="zoom-modal-content">
              <div className="zoom-modal-meeting-details">
                <h2 className="modal-meeting-title">{meeting.topic}</h2>
                
                <div className="modal-meeting-info">
                  <div className="modal-info-row">
                    <span className="modal-info-label">Дата і час:</span>
                    <span className="modal-info-value">
                      {formatDateTime(meeting.start_time).date}, {formatDateTime(meeting.start_time).time}
                    </span>
                  </div>
                  
                  <div className="modal-info-row">
                    <span className="modal-info-label">Статус:</span>
                    <span className={`modal-status-badge ${meeting.status}`}>
                      {meeting.status === 'scheduled' && 'Заплановано'}
                      {meeting.status === 'live' && 'В процесі'}
                      {meeting.status === 'ended' && 'Завершено'}
                      {meeting.status === 'canceled' && 'Скасовано'}
                    </span>
                  </div>
                  
                  <div className="modal-info-row">
                    <span className="modal-info-label">Організатор:</span>
                    <span className="modal-info-value">
                      {meeting.created_by_data?.first_name} {meeting.created_by_data?.last_name}
                    </span>
                  </div>
                </div>
                
                {meeting.description && (
                  <div className="modal-meeting-description">
                    <h3>Опис зустрічі</h3>
                    <p>{meeting.description}</p>
                  </div>
                )}
                
                {meeting.can_join && (
                  <div className="modal-join-options">
                    <p className="join-text">
                      Ця зустріч зараз доступна для приєднання. Виберіть один із способів нижче:
                    </p>
                    <div className="modal-join-buttons">
                      <button 
                        className="modal-join-browser-btn"
                        onClick={handleJoinMeeting}
                      >
                        <Video size={16} />
                        Приєднатися через браузер
                      </button>
                      
                      {meeting.join_url && (
                        <a 
                          href={meeting.join_url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="modal-join-app-btn"
                        >
                          <ExternalLink size={16} />
                          Відкрити в Zoom додатку
                        </a>
                      )}
                    </div>
                  </div>
                )}
                
                {!meeting.can_join && meeting.status === 'scheduled' && (
                  <div className="modal-join-info">
                    <AlertTriangle size={18} />
                    <p>
                      Ви зможете приєднатися до цієї зустрічі за 15 хвилин до її початку.
                    </p>
                  </div>
                )}
                
                {meeting.meeting_id && (
                  <div className="modal-meeting-credentials">
                    <h3 className="modal-credentials-title">Інформація для приєднання</h3>
                    <div className="modal-credentials-item">
                      <span className="modal-credentials-label">ID зустрічі:</span>
                      <span className="modal-credentials-value">{meeting.meeting_id}</span>
                      <button 
                        className="modal-copy-btn" 
                        onClick={() => copyToClipboard(meeting.meeting_id, 'id')}
                        title="Копіювати ID"
                      >
                        <Copy size={16} />
                        {copiedId ? 'Скопійовано!' : 'Копіювати'}
                      </button>
                    </div>
                    
                    {meeting.meeting_password && (
                      <div className="modal-credentials-item">
                        <span className="modal-credentials-label">Пароль:</span>
                        <span className="modal-credentials-value">{meeting.meeting_password}</span>
                        <button 
                          className="modal-copy-btn" 
                          onClick={() => copyToClipboard(meeting.meeting_password, 'password')}
                          title="Копіювати пароль"
                        >
                          <Copy size={16} />
                          {copiedPassword ? 'Скопійовано!' : 'Копіювати'}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="zoom-modal-error-content">
            <AlertTriangle size={32} className="error-icon" />
            <h3>Помилка</h3>
            <p>{error || 'Не вдалося завантажити зустріч. Будь ласка, спробуйте пізніше.'}</p>
            <button className="modal-back-btn" onClick={handleClose}>
              Повернутися назад
            </button>
          </div>
        )}
        
        {error && !showBrowserCheck && !showTroubleshooting && (
          <div className="zoom-modal-error">
            <AlertTriangle size={24} />
            <p>{error}</p>
            
            {errorType === 'password' && (
              <div className="error-help password-error">
                <h4>Проблема з паролем зустрічі</h4>
                <p>Спробуйте наступне для вирішення проблеми:</p>
                <ul>
                  <li>Зв'яжіться з організатором зустрічі для отримання правильного паролю</li>
                  <li>Переконайтеся, що пароль не містить спеціальних символів</li>
                  <li>Спробуйте приєднатися до зустрічі через Zoom додаток</li>
                </ul>
              </div>
            )}
            
            {errorType === 'meeting_status' && (
              <div className="error-help meeting-status-error">
                <h4>Проблема зі статусом зустрічі</h4>
                <p>Можливо зустріч ще не почалася або вже закінчилася. Спробуйте:</p>
                <ul>
                  <li>Перевірити розклад зустрічі</li>
                  <li>Зв'язатися з організатором, щоб почати зустріч</li>
                  <li>Переконатися, що ID зустрічі правильний</li>
                </ul>
              </div>
            )}
            
            <div className="error-actions">
              <button 
                className="retry-button"
                onClick={handleRetry}
              >
                Спробувати знову
              </button>
              
              <button 
                className="troubleshooting-button"
                onClick={() => setShowTroubleshooting(true)}
              >
                Інструкції з усунення несправностей
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ZoomModal;
