// src/components/zoom/ZoomModal.jsx - Оновлений
import React, { useState, useEffect } from 'react';
import './ZoomModal.css';
import { X, AlertTriangle, VideoIcon } from 'lucide-react';
import ImprovedZoomMeeting from './ImprovedZoomMeeting';
import ZoomTroubleshooting from './ZoomTroubleshooting';
import BrowserCheck from './BrowserCheck';

const ZoomModal = ({ meetingId, onClose }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [errorType, setErrorType] = useState(null);
  const [showTroubleshooting, setShowTroubleshooting] = useState(false);
  const [showBrowserCheck, setShowBrowserCheck] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    // Check for SharedArrayBuffer support
    const hasSharedArrayBuffer = typeof SharedArrayBuffer !== 'undefined';
    const hasSecureContext = window.isSecureContext;
    
    if (!hasSharedArrayBuffer || !hasSecureContext) {
      console.log('Browser environment check failed:',
        { hasSharedArrayBuffer, hasSecureContext });
      setShowBrowserCheck(true);
      setIsLoading(false);
      return;
    }

    // Short delay to show loading state
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  const handleClose = () => {
    // Add closing animation
    setIsClosing(true);
    
    // Delay actual closing to allow animation to complete
    setTimeout(() => {
      if (onClose) onClose();
    }, 300);
  };

  const handleError = (errorMessage) => {
    console.log('Zoom meeting error:', errorMessage);
    setError(errorMessage);
    
    // Determine error type for better handling
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
    // Reset all states
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
      <div className={`zoom-modal-container ${isClosing ? 'closing' : ''}`}>
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
        ) : (
          <>
            <div className="zoom-modal-close" onClick={handleClose}>
              <X size={20} />
            </div>
            <div className="zoom-modal-content">
              <ImprovedZoomMeeting 
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
                      <p>Спробуйте наступне для вирішення проблеми:</p>
                      <ul>
                        <li>Зв'яжіться з організатором для отримання правильного пароля</li>
                        <li>Переконайтеся, що пароль не містить спеціальних символів</li>
                        <li>Спробуйте приєднатися через настільний клієнт Zoom</li>
                      </ul>
                    </div>
                  )}
                  
                  {errorType === 'meeting_status' && (
                    <div className="error-help meeting-status-error">
                      <h4>Проблема зі статусом зустрічі</h4>
                      <p>Зустріч може ще не розпочатися або вже завершитися. Спробуйте:</p>
                      <ul>
                        <li>Перевірити розклад зустрічі</li>
                        <li>Зв'язатися з організатором для початку зустрічі</li>
                        <li>Перевірити, чи ID зустрічі правильний</li>
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
                      Вирішення проблем
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