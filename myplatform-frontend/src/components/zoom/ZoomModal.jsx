// src/components/zoom/ZoomModal.jsx
import React, { useState, useEffect } from 'react';
import './ZoomModal.css';
import { X } from 'lucide-react';
import ZoomMeeting from './ZoomMeeting';

const ZoomModal = ({ meetingId, onClose }) => {
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Коротка затримка для анімації появи модального вікна
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Обробник закриття модального вікна
  const handleClose = () => {
    // Додаємо клас для анімації виходу
    document.querySelector('.zoom-modal-container').classList.add('closing');
    
    // Затримка перед фактичним закриттям для завершення анімації
    setTimeout(() => {
      if (onClose) onClose();
    }, 300);
  };

  return (
    <div className="zoom-modal-overlay">
      <div className="zoom-modal-container">
        {isLoading ? (
          <div className="zoom-modal-loading">
            <div className="loading-spinner"></div>
            <p>Підготовка до зустрічі...</p>
          </div>
        ) : (
          <>
            <div className="zoom-modal-close" onClick={handleClose}>
              <X size={20} />
            </div>
            <div className="zoom-modal-content">
              <ZoomMeeting meetingId={meetingId} onClose={handleClose} />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ZoomModal;