// src/components/zoom/ZoomMeeting.jsx - Оновлений з новою автентифікацією
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ZoomMeeting.css';
import zoomApi from '../api/zoomApi';

const ZoomMeeting = ({ meetingId, onClose }) => {
  const meetingContainerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [meetingData, setMeetingData] = useState(null);
  const zoomClient = useRef(null);
  const [isJoined, setIsJoined] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Додавання скрипту Zoom SDK
    const addZoomScripts = async () => {
      try {
        console.log('Loading Zoom SDK scripts...');
        // Додаємо Zoom Web Meeting SDK через CDN
        const zoomScript = document.createElement('script');
        zoomScript.src = 'https://source.zoom.us/3.13.2/lib/vendor/react.min.js';
        zoomScript.async = true;
        document.body.appendChild(zoomScript);

        const zoomReactDomScript = document.createElement('script');
        zoomReactDomScript.src = 'https://source.zoom.us/3.13.2/lib/vendor/react-dom.min.js';
        zoomReactDomScript.async = true;
        document.body.appendChild(zoomReactDomScript);

        const zoomSDKScript = document.createElement('script');
        zoomSDKScript.src = 'https://source.zoom.us/3.13.2/lib/vendor/redux.min.js';
        zoomSDKScript.async = true;
        document.body.appendChild(zoomSDKScript);

        const zoomSDKScript2 = document.createElement('script');
        zoomSDKScript2.src = 'https://source.zoom.us/3.13.2/lib/vendor/redux-thunk.min.js';
        zoomSDKScript2.async = true;
        document.body.appendChild(zoomSDKScript2);

        const zoomSDKScript3 = document.createElement('script');
        zoomSDKScript3.src = 'https://source.zoom.us/3.13.2/zoom-meeting-3.13.2.min.js';
        zoomSDKScript3.async = true;
        await new Promise((resolve) => {
          zoomSDKScript3.onload = resolve;
          document.body.appendChild(zoomSDKScript3);
        });

        console.log('Zoom SDK loaded');
        await initZoom();

      } catch (err) {
        console.error('Error loading Zoom SDK:', err);
        setError('Помилка завантаження Zoom SDK. Будь ласка, спробуйте пізніше.');
        setLoading(false);
      }
    };

    addZoomScripts();

    // Cleanup при розмонтуванні
    return () => {
      try {
        if (zoomClient.current && isJoined) {
          zoomClient.current.leave();
          zoomApi.leaveZoomMeeting(meetingId).catch(err => {
            console.error('Error logging meeting leave:', err);
          });
        }
      } catch (err) {
        console.error('Error cleaning up Zoom meeting:', err);
      }
    };
  }, [meetingId]);

  // Ініціалізація Zoom SDK
  const initZoom = async () => {
    try {
      setLoading(true);

      // Отримання даних про зустріч з API
      const joinData = await zoomApi.joinZoomMeeting(meetingId);
      setMeetingData(joinData);

      const { meeting, sdk_data } = joinData;
      const { signature, sdkKey, meetingNumber, passWord, userName, userEmail, role } = sdk_data;

      console.log('Meeting data received:', {
        meeting,
        sdkData: {
          ...sdk_data,
          signature: signature.substring(0, 10) + '...' // Для безпеки показуємо частково
        }
      });

      // Ініціалізація клієнта Zoom SDK
      zoomClient.current = window.ZoomMtg;
      
      // Налаштування SDK
      zoomClient.current.setZoomJSLib('https://source.zoom.us/3.13.2/lib', '/av');
      zoomClient.current.preLoadWasm();
      zoomClient.current.prepareWebSDK();

      // Налаштування мови інтерфейсу
      zoomClient.current.i18n.load('en-US');
      zoomClient.current.i18n.reload('en-US');

      // Ініціалізація клієнта з використанням SDK Auth
      zoomClient.current.init({
        leaveUrl: window.location.origin + '/teacher/zoom-meetings', // URL для переадресації після виходу
        disableCORP: true,
        success: () => {
          console.log('Zoom Meeting SDK initialized');

          // Приєднання до зустрічі з використанням SDK Auth
          zoomClient.current.join({
            sdkKey: sdkKey,
            signature: signature,
            meetingNumber: meetingNumber,
            password: passWord || meeting.meeting_password || '', // Пароль зустрічі
            userName: userName || sessionStorage.getItem('userName') || 'User', // Ім'я користувача
            userEmail: userEmail || sessionStorage.getItem('userEmail') || '', // Email користувача
            tk: '',
            zak: '',
            success: () => {
              console.log('Joined Zoom meeting successfully');
              setIsJoined(true);
              setLoading(false);
            },
            error: (error) => {
              console.error('Failed to join Zoom meeting', error);
              setError('Помилка приєднання до зустрічі: ' + (error.errorMessage || error.reason || 'Невідома помилка'));
              setLoading(false);
            }
          });
        },
        error: (error) => {
          console.error('Failed to initialize Zoom SDK', error);
          setError('Помилка ініціалізації Zoom SDK: ' + (error.errorMessage || error.reason || 'Будь ласка, спробуйте пізніше.'));
          setLoading(false);
        }
      });

    } catch (err) {
      console.error('Error initializing Zoom meeting:', err);
      setError(err.response?.data?.error || 'Помилка з\'єднання з сервером. Будь ласка, спробуйте пізніше.');
      setLoading(false);
    }
  };

  // Обробник виходу з зустрічі
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
      <div id="zmmtg-root"></div>
      <div className="zoom-meeting-container" ref={meetingContainerRef}></div>
    </div>
  );
};

export default ZoomMeeting;