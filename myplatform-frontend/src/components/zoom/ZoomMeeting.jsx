// Оновлений компонент ZoomMeeting.jsx
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ZoomMeeting.css';
import zoomApi from '../api/zoomApi';

const ZoomMeeting = ({ meetingId, onClose, onError }) => {
  const meetingContainerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [meetingData, setMeetingData] = useState(null);
  const zoomClient = useRef(null);
  const [isJoined, setIsJoined] = useState(false);
  const navigate = useNavigate();
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [joinAttempts, setJoinAttempts] = useState(0);

  const extractMeetingNumber = (value) => {
    if (!value) return '';
    
    if (value.startsWith('zoom_')) {
      const parts = value.split('_');
      if (parts.length >= 3) {
        
        return String(parts[2]).replace(/[^\d]/g, '');
      }
    }
    
    return String(value).replace(/[^\d]/g, '');
  };

  const setErrorWithCallback = (errorMessage) => {
    setError(errorMessage);
    if (onError) {
      onError(errorMessage);
    }
  };

  useEffect(() => {
    
    let zoomContainer = document.getElementById('zmmtg-root');
    
    if (!zoomContainer) {
      
      zoomContainer = document.createElement('div');
      zoomContainer.id = 'zmmtg-root';
      document.body.appendChild(zoomContainer);
      console.log('Created zmmtg-root container programmatically');
    }
    
    return () => {
      try {
        if (zoomClient.current && isJoined && typeof zoomClient.current.leave === 'function') {
          zoomClient.current.leave();
          zoomApi.leaveZoomMeeting(meetingId).catch(err => {
            console.error('Error logging meeting leave:', err);
          });
        }
      } catch (err) {
        console.error('Error cleaning up Zoom meeting:', err);
      }
    };
  }, [meetingId, isJoined]);

  useEffect(() => {
    const addZoomScripts = async () => {
      try {
        console.log('Loading Zoom SDK scripts...');
        
        await loadScript('https://source.zoom.us/3.13.2/lib/vendor/react.min.js');
        await loadScript('https://source.zoom.us/3.13.2/lib/vendor/react-dom.min.js');
        await loadScript('https://source.zoom.us/3.13.2/lib/vendor/redux.min.js');
        await loadScript('https://source.zoom.us/3.13.2/lib/vendor/redux-thunk.min.js');
        await loadScript('https://source.zoom.us/3.13.2/zoom-meeting-3.13.2.min.js');
        
        console.log('Zoom SDK loaded successfully');
        setIsSDKLoaded(true);
      } catch (err) {
        console.error('Error loading Zoom SDK:', err);
        setErrorWithCallback('Помилка завантаження Zoom SDK: ' + err.message);
        setLoading(false);
      }
    };

    const loadScript = (src) => {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        script.onload = resolve;
        script.onerror = (e) => reject(new Error(`Failed to load script: ${src}`));
        document.body.appendChild(script);
      });
    };

    addZoomScripts();
  }, []);

  useEffect(() => {
    if (isSDKLoaded) {
      initZoom();
    }
  }, [isSDKLoaded]);

  const joinMeeting = async (meetingData, sdkData) => {
    try {
      if (!zoomClient.current) {
        throw new Error('Zoom SDK не ініціалізовано. Спробуйте перезавантажити сторінку.');
      }
      
      // Extract and validate meeting number
      const meetingNumber = sdkData.meetingNumber;
      if (!meetingNumber || meetingNumber.length < 9) {
        throw new Error('Недійсний ID зустрічі Zoom. Має бути числовим і містити мінімум 9 цифр.');
      }
      
      // Ensure password is available
      const password = meetingData.meeting_password || sdkData.password || '';
      
      // Join the meeting with validated data
      await new Promise((resolve, reject) => {
        zoomClient.current.join({
          sdkKey: sdkData.sdkKey,
          signature: sdkData.signature,
          meetingNumber: meetingNumber,
          password: password,
          userName: sdkData.userName || sessionStorage.getItem('userName') || 'Користувач',
          userEmail: sdkData.userEmail || sessionStorage.getItem('userEmail') || '',
          success: () => {
            console.log('Joined Zoom meeting successfully');
            setIsJoined(true);
            resolve();
          },
          error: (error) => {
            console.error('Failed to join Zoom meeting:', error);
            let errorMessage = 'Помилка приєднання до зустрічі';
            
            switch(error.errorCode) {
              case 1: errorMessage = 'Неправильний номер зустрічі або зустріч не активна'; break;
              case 2: errorMessage = 'Час зустрічі ще не настав'; break;
              case 3: errorMessage = 'Неправильний пароль зустрічі'; break;
              case 4: errorMessage = 'Зустріч вже закінчилася'; break;
              default: errorMessage = error.errorMessage || 'Невідома помилка';
            }
            
            reject(new Error(`Помилка приєднання до зустрічі: ${errorMessage}`));
          }
        });
      });
    } catch (error) {
      throw error;
    }
  };
  const initZoom = async () => {
    try {
      setLoading(true);

      // Get meeting data and auth info from backend
      const joinData = await zoomApi.joinZoomMeeting(meetingId);
      console.log("Join data received:", joinData);
      
      setMeetingData(joinData);
      
      if (!joinData || !joinData.meeting || !joinData.sdk_data) {
        throw new Error('Не вдалося отримати необхідні дані для приєднання до Zoom зустрічі.');
      }
      
      const { meeting, sdk_data } = joinData;
      
      // Initialize Zoom SDK
      const zoomContainer = document.getElementById('zmmtg-root');
      if (!zoomContainer) {
        throw new Error('Не знайдено контейнер для Zoom SDK. Перезавантажте сторінку і спробуйте знову.');
      }
      
      // Clear existing content
      while (zoomContainer.firstChild) {
        zoomContainer.removeChild(zoomContainer.firstChild);
      }

      zoomClient.current = window.ZoomMtg;
      
      if (!zoomClient.current) {
        throw new Error('Не вдалося ініціалізувати Zoom SDK. Перезавантажте сторінку і спробуйте знову.');
      }
      
      // Load necessary libraries
      zoomClient.current.setZoomJSLib('https://source.zoom.us/3.13.2/lib', '/av');
      zoomClient.current.i18n.load('en-US');
      zoomClient.current.i18n.reload('en-US');
      
      try {
        zoomClient.current.preLoadWasm();
        zoomClient.current.prepareWebSDK();
        console.log("WebAssembly modules loaded successfully");
      } catch (wasmError) {
        console.error("Error loading WebAssembly modules:", wasmError);
        throw new Error('Помилка завантаження WebAssembly модулів: ' + wasmError.message);
      }

      // Initialize the SDK
      await new Promise((resolve, reject) => {
        zoomClient.current.init({
          leaveUrl: window.location.origin + '/teacher/zoom-meetings',
          disableCORP: true, 
          debug: true, 
          videoDrag: true, 
          screenShare: true, 
          disablePreview: false, 
          success: () => {
            console.log('Zoom Meeting SDK initialized successfully');
            resolve();
          },
          error: (error) => {
            console.error('Failed to initialize Zoom SDK', error);
            reject(new Error(`Помилка ініціалізації Zoom SDK: ${error.errorMessage || error.reason || JSON.stringify(error)}`));
          }
        });
      });
      
      // Join the meeting
      await joinMeeting(meeting, sdk_data);
      setLoading(false);
      
    } catch (err) {
      console.error('Error initializing Zoom meeting:', err);
      setErrorWithCallback(err.message || 'Помилка з\'єднання з сервером. Будь ласка, спробуйте пізніше.');
      setLoading(false);
    }
  };

  const handleLeaveMeeting = () => {
    try {
      if (zoomClient.current && isJoined) {
        zoomClient.current.leave({
          success: () => {
            console.log('Left Zoom meeting successfully');
            zoomApi.leaveZoomMeeting(meetingId).catch(err => {
              console.error('Error logging meeting leave:', err);
            });
            if (onClose) onClose();
            else navigate(-1);
          },
          error: (error) => {
            console.error('Failed to leave Zoom meeting', error);
            if (onClose) onClose();
            else navigate(-1);
          }
        });
      } else {
        if (onClose) onClose();
        else navigate(-1);
      }
    } catch (err) {
      console.error('Error leaving Zoom meeting:', err);
      if (onClose) onClose();
      else navigate(-1);
    }
  };

  if (loading) {
    return (
      <div className="zoom-meeting-container loading">
        <div className="loading-spinner"></div>
        <p>Підключення до Zoom зустрічі...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="zoom-meeting-container error">
        <div className="error-icon">!</div>
        <h3>Помилка з'єднання</h3>
        <p>{error}</p>
        <button onClick={handleLeaveMeeting} className="btn-primary">
          Повернутися назад
        </button>
      </div>
    );
  }

  return (
    <div className="zoom-meeting-wrapper">
      <div className="zoom-meeting-header">
        <h2>{meetingData?.meeting?.topic || 'Zoom зустріч'}</h2>
        <button onClick={handleLeaveMeeting} className="leave-meeting-btn">
          Завершити зустріч
        </button>
      </div>
      
      {/* Zoom SDK автоматично використовує елемент з id='zmmtg-root' */}
      <div className="zoom-meeting-container" ref={meetingContainerRef}></div>
    </div>
  );
};

export default ZoomMeeting;