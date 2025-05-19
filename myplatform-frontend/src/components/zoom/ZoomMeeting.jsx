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

  const initZoom = async () => {
    try {
      setLoading(true);

      const joinData = await zoomApi.joinZoomMeeting(meetingId);
      console.log("Join data received:", joinData);
      
      setMeetingData(joinData);
      
      if (!joinData || !joinData.meeting || !joinData.sdk_data) {
        throw new Error('Не вдалося отримати необхідні дані для приєднання до Zoom зустрічі.');
      }
      
      const { meeting, sdk_data } = joinData;
      
      console.log('Raw SDK data:', {
        meetingNumber: sdk_data.meetingNumber,
        signatureExists: !!sdk_data.signature,
        signatureLength: sdk_data?.signature?.length
      });

      const { signature, sdkKey } = sdk_data;
      const meetingNumber = sdk_data.meetingNumber || meeting.meeting_id;
      
      const cleanMeetingNumber = extractMeetingNumber(meetingNumber);
      console.log(`Original meeting number: "${meetingNumber}", cleaned: "${cleanMeetingNumber}"`);
      
      const rawPassword = meeting.meeting_password || sdk_data.password || sdk_data.passWord || '';
      let password = String(rawPassword).trim();

      if (password && password.length === 6 && /^\d+$/.test(password)) {

        password = password; 
        console.log("Using numeric password format:", password);
      } else if (!password) {
        
        password = "123456";
        console.log("Using default password:", password);
      }

      const encodedPassword = encodeURIComponent(password);
      console.log("Password formats:", {
        original: password,
        encoded: encodedPassword
      });
      
      const userName = sdk_data.userName || sessionStorage.getItem('userName') || 'Користувач';
      const userEmail = sdk_data.userEmail || sessionStorage.getItem('userEmail') || '';
      
      console.table({
        sdkKey,
        signatureLength: signature?.length,
        cleanMeetingNumber,
        hasSignature: !!signature,
        userName
      });

      const missingParams = [];
      if (!sdkKey) missingParams.push('sdkKey');
      if (!signature) missingParams.push('signature');
      if (!cleanMeetingNumber) missingParams.push('meetingNumber');

      if (missingParams.length > 0) {
        console.error('Missing required parameters:', {
          sdkKey,
          signature: signature ? `${signature.slice(0, 10)}...` : undefined,
          meetingNumber
        });
        throw new Error(`Відсутні необхідні параметри для ініціалізації Zoom SDK: ${missingParams.join(', ')}`);
      }
      
      if (!cleanMeetingNumber || cleanMeetingNumber.length < 9) {
        console.error('Invalid meeting number format:', {
          original: meetingNumber,
          cleaned: cleanMeetingNumber
        });
        throw new Error('Недійсний формат номеру зустрічі. Має бути числовим і мати мінімум 9 цифр.');
      }
      
      console.log('Using meeting values:', {
        meetingNumber,
        cleanMeetingNumber,
        passwordFromMeeting: meeting.meeting_password,
        passwordFromSDK: sdk_data.password,
        finalPassword: password,
        passwordLength: password.length
      });

      const zoomContainer = document.getElementById('zmmtg-root');
      if (!zoomContainer) {
        throw new Error('Не знайдено контейнер для Zoom SDK. Перезавантажте сторінку і спробуйте знову.');
      }
      
      while (zoomContainer.firstChild) {
        zoomContainer.removeChild(zoomContainer.firstChild);
      }

      zoomClient.current = window.ZoomMtg;
      
      if (!zoomClient.current) {
        throw new Error('Не вдалося ініціалізувати Zoom SDK. Перезавантажте сторінку і спробуйте знову.');
      }
      
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

      try {
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
        
        console.log("Zoom SDK initialized, trying to join meeting now");
      } catch (initError) {
        console.error("Error initializing Zoom SDK:", initError);
        throw initError;
      }

      try {
        await new Promise((resolve, reject) => {
          
          console.log("Joining meeting with params:", {
            sdkKey,
            meetingNumber: cleanMeetingNumber,
            hasPassword: !!password,
            passwordLength: password.length,
            userName
          });
          
          const joinParams = {
            sdkKey,
            signature,
            meetingNumber: cleanMeetingNumber,
            password: password,
            userName,
            userEmail,
            success: () => {
              console.log('Joined Zoom meeting successfully');
              setIsJoined(true);
              setLoading(false);
              resolve();
            },
            error: (error) => {
              
              if (error.errorCode === 3) {
                console.log('Password error detected, trying alternate format...');
                
                zoomApi.getZoomSignature(cleanMeetingNumber, 0)
                  .then(sigData => {
                    console.log('Got alternative signature:', sigData);
                    
                    const passwordVariants = [
                      password, 
                      "", 
                      "123456", 
                      encodedPassword,
                      Buffer.from(password).toString('base64') 
                    ];
                    
                    let attemptIndex = 0;
                    
                    const tryNextPassword = () => {
                      if (attemptIndex >= passwordVariants.length) {
                        
                        reject(new Error('Помилка приєднання до зустрічі: Неправильний пароль зустрічі після кількох спроб'));
                        return;
                      }
                      
                      const currentPassword = passwordVariants[attemptIndex];
                      console.log(`Trying password variant ${attemptIndex + 1}/${passwordVariants.length}:`, 
                        currentPassword === '' ? '(empty string)' : currentPassword);
                      
                      const newJoinParams = {
                        ...joinParams,
                        password: currentPassword,
                        signature: sigData.signature
                      };
                      
                      attemptIndex++;
                      
                      try {
                        zoomClient.current.join(newJoinParams);
                        
                        setTimeout(() => {
                          if (!isJoined) {
                            console.log(`Password variant ${attemptIndex} failed, trying next...`);
                            tryNextPassword();
                          }
                        }, 2000);
                      } catch (e) {
                        console.error('Error during join attempt:', e);
                        tryNextPassword();
                      }
                    };
                    
                    tryNextPassword();
                  })
                  .catch(sigErr => {
                    console.error('Failed to get alternative signature:', sigErr);
                    reject(new Error(`Помилка приєднання до зустрічі: Не вдалося отримати підпис: ${sigErr.message}`));
                  });
                return;
              }
              
              console.error('Failed to join Zoom meeting:', error);
              
              let errorMessage = '';
              switch(error.errorCode) {
                case 1:
                  errorMessage = 'Неправильний номер зустрічі або зустріч не активна';
                  break;
                case 2:
                  errorMessage = 'Час зустрічі ще не настав';
                  break;
                case 3:
                  errorMessage = 'Неправильний пароль зустрічі';
                  break;
                case 4:
                  errorMessage = 'Зустріч вже закінчилася';
                  break;
                default:
                  errorMessage = error.errorMessage || 'Невідома помилка';
              }
              
              reject(new Error(`Помилка приєднання до зустрічі: ${errorMessage}`));
            }
          };
          
          console.log("Final join params:", joinParams);
          zoomClient.current.join(joinParams);
        });
      } catch (joinError) {
        console.error("Error joining meeting:", joinError);
        throw joinError;
      }

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