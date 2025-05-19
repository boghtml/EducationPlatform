// src/components/zoom/ZoomModal.jsx
import React, { useState, useEffect } from 'react';
import './ZoomModal.css';
import { X, AlertTriangle } from 'lucide-react';
import ZoomMeeting from './ZoomMeeting';
import ZoomTroubleshooting from './ZoomTroubleshooting';
import BrowserCheck from './BrowserCheck';

const ZoomModal = ({ meetingId, onClose }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [errorType, setErrorType] = useState(null);
  const [showTroubleshooting, setShowTroubleshooting] = useState(false);
  const [showBrowserCheck, setShowBrowserCheck] = useState(false);

  useEffect(() => {
    
    if (typeof SharedArrayBuffer === 'undefined') {
      setShowBrowserCheck(true);
      setIsLoading(false);
      return;
    }

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);
  
  const handleClose = () => {
    
    const container = document.querySelector('.zoom-modal-container');
    if (container) {
      container.classList.add('closing');
    }
    
    setTimeout(() => {
      if (onClose) onClose();
    }, 300);
  };

  const handleError = (errorMessage) => {
    setError(errorMessage);
    
    if (errorMessage.includes('пароль')) {
      setErrorType('password');
    } else if (errorMessage.includes('SharedArrayBuffer')) {
      setErrorType('browser');
      setShowBrowserCheck(true);
    } else {
      setErrorType('general');
    }
  };

  const handleRetry = () => {
    setError(null);
    setErrorType(null);
    setShowTroubleshooting(false);
    setShowBrowserCheck(false);
    setIsLoading(true);
    
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="zoom-modal-overlay">
      <div className="zoom-modal-container">
        {isLoading ? (
          <div className="zoom-modal-loading">
            <div className="loading-spinner"></div>
            <p>Підготовка до зустрічі...</p>
          </div>
        ) : showBrowserCheck ? (
          <BrowserCheck 
            onRetry={handleRetry}
            onClose={handleClose}
          />
        ) : showTroubleshooting ? (
          <ZoomTroubleshooting onBack={() => setShowTroubleshooting(false)} />
        ) : (
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
              
              {error && (
                <div className="zoom-modal-error">
                  <AlertTriangle size={24} />
                  <p>{error}</p>
                  
                  {errorType === 'password' && (
                    <div className="error-help password-error">
                      <h4>Проблема з паролем зустрічі</h4>
                      <p>Для вирішення проблеми з паролем зустрічі:</p>
                      <ul>
                        <li>Зверніться до організатора зустрічі для отримання правильного пароля</li>
                        <li>Переконайтеся, що пароль не містить спеціальних символів</li>
                        <li>Спробуйте приєднатися до зустрічі через клієнт Zoom</li>
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
                      Посібник з усунення несправностей
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ZoomModal;