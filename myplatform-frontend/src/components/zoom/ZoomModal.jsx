// src/components/zoom/ZoomModal.jsx - Оптимізований для роботи з реальними зустрічами
import React, { useState, useEffect } from 'react';
import './ZoomModal.css';
import { X, AlertTriangle, VideoIcon } from 'lucide-react';
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
    // Перевірка важливих вимог для Zoom SDK
    const hasSharedArrayBuffer = typeof SharedArrayBuffer !== 'undefined';
    const hasSecureContext = window.isSecureContext;
    
    console.log('Browser compatibility check:', {
      hasSharedArrayBuffer,
      hasSecureContext,
      isHttps: window.location.protocol === 'https:',
      crossOriginIsolated: window.crossOriginIsolated
    });
    
    // Потрібен SharedArrayBuffer для Zoom SDK
    if (!hasSharedArrayBuffer || !hasSecureContext) {
      console.log('Browser environment check failed:',
        { hasSharedArrayBuffer, hasSecureContext });
      setShowBrowserCheck(true);
      setIsLoading(false);
      return;
    }

    // Короткa затримка для відображення завантаження
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);
  
  const handleClose = () => {
    // Додаємо анімацію закриття
    const container = document.querySelector('.zoom-modal-container');
    if (container) {
      container.classList.add('closing');
    }
    
    // Затримка для анімації
    setTimeout(() => {
      if (onClose) onClose();
    }, 300);
  };

  const handleError = (errorMessage) => {
    console.error('Zoom meeting error:', errorMessage);
    setError(errorMessage);
    
    // Визначаємо тип помилки для кращого відображення
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
    // Скидаємо всі стани і пробуємо знову
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
            <p>Preparing meeting...</p>
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
                      <h4>Meeting Password Issue</h4>
                      <p>Try the following to resolve password issues:</p>
                      <ul>
                        <li>Contact the meeting host for the correct password</li>
                        <li>Make sure the password doesn't contain special characters</li>
                        <li>Try joining the meeting via the Zoom client</li>
                      </ul>
                    </div>
                  )}
                  
                  {errorType === 'meeting_status' && (
                    <div className="error-help meeting-status-error">
                      <h4>Meeting Status Issue</h4>
                      <p>The meeting may not have started yet or has already ended. Try:</p>
                      <ul>
                        <li>Checking the meeting schedule</li>
                        <li>Contacting the host to start the meeting</li>
                        <li>Verifying the meeting ID is correct</li>
                      </ul>
                    </div>
                  )}
                  
                  <div className="error-actions">
                    <button 
                      className="retry-button"
                      onClick={handleRetry}
                    >
                      Try Again
                    </button>
                    
                    <button 
                      className="troubleshooting-button"
                      onClick={() => setShowTroubleshooting(true)}
                    >
                      Troubleshooting Guide
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