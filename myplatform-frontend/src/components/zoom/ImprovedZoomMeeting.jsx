// Оновлений ImprovedZoomMeeting.jsx з альтернативним підходом до завантаження SDK
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ImprovedZoomMeeting.css';
import zoomApi from '../api/zoomApi';
import { AlertTriangle, Video, ArrowLeft } from 'lucide-react';

const ImprovedZoomMeeting = ({ meetingId, onClose, onError }) => {
  const meetingContainerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [meetingData, setMeetingData] = useState(null);
  const zoomClient = useRef(null);
  const [isJoined, setIsJoined] = useState(false);
  const navigate = useNavigate();
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const [debugInfo, setDebugInfo] = useState([]);

  // Add a debug log function to track the SDK loading process
  const debugLog = (message) => {
    console.log(`[ZOOM-DEBUG] ${message}`);
    setDebugInfo(prev => [...prev, { time: new Date().toISOString(), message }]);
  };

  // Set error with callback
  const setErrorWithCallback = (errorMessage) => {
    debugLog(`Error: ${errorMessage}`);
    setError(errorMessage);
    if (onError) {
      onError(errorMessage);
    }
  };

  // Create Zoom container
  useEffect(() => {
    debugLog('Setting up Zoom container');
    
    // Make sure the zmmtg-root element exists
    let zoomContainer = document.getElementById('zmmtg-root');
    
    if (!zoomContainer) {
      zoomContainer = document.createElement('div');
      zoomContainer.id = 'zmmtg-root';
      document.body.appendChild(zoomContainer);
      debugLog('Created zmmtg-root container');
    }
    
    // Cleanup function
    return () => {
      debugLog('Cleaning up Zoom meeting resources');
      try {
        // Attempt to leave meeting if joined
        if (zoomClient.current && isJoined && typeof zoomClient.current.leave === 'function') {
          debugLog('Leaving meeting through Zoom SDK');
          zoomClient.current.leave();
          
          // Log meeting leave on server
          zoomApi.leaveZoomMeeting(meetingId).catch(err => {
            debugLog(`Error logging meeting leave: ${err.message}`);
          });
        }
      } catch (err) {
        debugLog(`Error cleaning up Zoom meeting: ${err.message}`);
      }
    };
  }, [meetingId, isJoined]);

  // Load Zoom SDK using CDN script tag approach
  useEffect(() => {
    const loadZoomSDK = () => {
      debugLog('Starting to load Zoom SDK via script tags');
      
      // Check for browser compatibility first
      if (typeof SharedArrayBuffer === 'undefined') {
        debugLog('SharedArrayBuffer is not supported in this browser or context');
        setErrorWithCallback('Ваш браузер не підтримує необхідні функції (SharedArrayBuffer). Будь ласка, використовуйте Chrome або Edge з безпечним контекстом.');
        setLoading(false);
        return;
      }
      
      if (!window.isSecureContext) {
        debugLog('Not in a secure context - required for SharedArrayBuffer');
        setErrorWithCallback('Цей сайт повинен бути завантажений у безпечному контексті (HTTPS) для використання функцій Zoom SDK.');
        setLoading(false);
        return;
      }
      
      // Add Zoom SDK to page directly
      const addScript = (src, onLoad, onError) => {
        const existingScript = document.querySelector(`script[src="${src}"]`);
        if (existingScript) {
          debugLog(`Script ${src} already exists, not adding again`);
          onLoad();
          return;
        }
        
        const script = document.createElement('script');
        script.src = src;
        script.crossOrigin = 'anonymous';
        script.async = true;
        script.defer = true;
        script.onload = onLoad;
        script.onerror = onError;
        document.body.appendChild(script);
        debugLog(`Added script: ${src}`);
      };
      
      // Add the main Zoom SDK script 
      addScript(
        'https://source.zoom.us/zoom-meeting-3.13.5.min.js',
        () => {
          debugLog('Zoom SDK loaded successfully');
          setSdkLoaded(true);
        },
        (err) => {
          debugLog(`Failed to load Zoom SDK: ${err}`);
          setErrorWithCallback('Не вдалося завантажити Zoom SDK. Спробуйте перезавантажити сторінку або використайте інший браузер.');
          setLoading(false);
        }
      );
    };
    
    loadZoomSDK();
  }, []);

  // Initialize Zoom when SDK is loaded
  useEffect(() => {
    if (sdkLoaded) {
      debugLog('SDK loaded, initializing Zoom');
      initZoom();
    }
  }, [sdkLoaded]);

  // Join meeting function
  const joinMeeting = async (meetingData, sdkData) => {
    try {
      if (!window.ZoomMtg) {
        throw new Error('Zoom SDK not initialized. Please refresh the page.');
      }
      
      // Extract and validate meeting number and password
      const meetingNumber = sdkData.meetingNumber;
      if (!meetingNumber) {
        throw new Error('Invalid Zoom meeting ID.');
      }
      
      const password = sdkData.passWord || '';
      
      // Join the meeting
      debugLog('Joining meeting with data:');
      debugLog(`Meeting Number: ${meetingNumber}`);
      debugLog(`User Name: ${sdkData.userName}`);
      debugLog(`Role: ${sdkData.role}`);
      
      await new Promise((resolve, reject) => {
        window.ZoomMtg.join({
          sdkKey: sdkData.sdkKey,
          signature: sdkData.signature,
          meetingNumber: meetingNumber,
          password: password,
          userName: sdkData.userName || sessionStorage.getItem('userName') || 'User',
          userEmail: sdkData.userEmail || sessionStorage.getItem('userEmail') || '',
          success: () => {
            debugLog('Joined Zoom meeting successfully');
            setIsJoined(true);
            resolve();
          },
          error: (error) => {
            debugLog(`Failed to join Zoom meeting: ${JSON.stringify(error)}`);
            let errorMessage = 'Error joining the meeting';
            
            // Provide more detailed error messages
            if (error.errorCode) {
              switch(error.errorCode) {
                case 1: errorMessage = 'Невірний ID зустрічі або зустріч неактивна'; break;
                case 2: errorMessage = 'Зустріч ще не розпочалася'; break;
                case 3: errorMessage = 'Невірний пароль зустрічі'; break;
                case 4: errorMessage = 'Зустріч вже завершена'; break;
                case 5: errorMessage = 'Зустріч заповнена'; break;
                default: errorMessage = error.errorMessage || 'Невідома помилка';
              }
            }
            
            reject(new Error(`Помилка приєднання до зустрічі: ${errorMessage}`));
          }
        });
      });
    } catch (error) {
      throw error;
    }
  };

  // Initialize Zoom with meeting data
  const initZoom = async () => {
    try {
      setLoading(true);
      debugLog('Initializing Zoom with meeting ID: ' + meetingId);

      // Get meeting data from backend
      debugLog('Fetching meeting data from backend');
      const joinData = await zoomApi.joinZoomMeeting(meetingId);
      debugLog("Join data received from API");
      
      setMeetingData(joinData);
      
      if (!joinData || !joinData.meeting || !joinData.sdk_data) {
        throw new Error('Failed to get necessary data to join the Zoom meeting.');
      }
      
      const { meeting, sdk_data } = joinData;
      debugLog(`Meeting topic: ${meeting.topic}`);
      
      // Initialize Zoom SDK with ZoomMtg global object
      const zoomContainer = document.getElementById('zmmtg-root');
      if (!zoomContainer) {
        throw new Error('Zoom container not found. Please refresh the page.');
      }
      
      // Clear any existing content
      while (zoomContainer.firstChild) {
        zoomContainer.removeChild(zoomContainer.firstChild);
      }

      // Set the reference to the global ZoomMtg object
      if (!window.ZoomMtg) {
        throw new Error('Zoom Meeting SDK not loaded properly. Please refresh the page.');
      }
      
      zoomClient.current = window.ZoomMtg;
      debugLog('Global ZoomMtg object found');
      
      // Set up libraries and load config
      debugLog('Configuring Zoom libraries and locale');
      zoomClient.current.setZoomJSLib('https://source.zoom.us/3.13.5/lib', '/av');
      zoomClient.current.i18n.load('en-US');
      zoomClient.current.i18n.reload('en-US');
      
      try {
        // Preload WebAssembly modules
        debugLog('Preloading WebAssembly modules...');
        zoomClient.current.preLoadWasm();
        zoomClient.current.prepareWebSDK();
        debugLog("WebAssembly modules loaded successfully");
      } catch (wasmError) {
        debugLog(`Error loading WebAssembly modules: ${wasmError.message}`);
        throw new Error('Error loading WebAssembly modules. Your browser may not support SharedArrayBuffer or has security restrictions.');
      }

      // Initialize with needed options
      debugLog('Initializing Zoom SDK...');
      await new Promise((resolve, reject) => {
        zoomClient.current.init({
          leaveUrl: sdk_data.leaveUrl || '/dashboard', 
          disableCORP: !window.crossOriginIsolated,  // Important for SharedArrayBuffer
          debug: true,
          videoDrag: true,
          showMeetingHeader: true,
          disableInvite: true,
          disableCallOut: true,
          screenShare: true,
          disablePreview: false,
          isSupportAV: true,
          isSupportChat: true,
          success: () => {
            debugLog('Zoom Meeting SDK initialized successfully');
            resolve();
          },
          error: (error) => {
            debugLog(`Failed to initialize Zoom SDK: ${JSON.stringify(error)}`);
            reject(new Error(`Error initializing Zoom SDK: ${error.errorMessage || error.reason || JSON.stringify(error)}`));
          }
        });
      });
      
      // Join the meeting
      debugLog('Calling joinMeeting function...');
      await joinMeeting(meeting, sdk_data);
      debugLog('Join meeting completed successfully');
      setLoading(false);
      
    } catch (err) {
      debugLog(`Error in initZoom: ${err.message}`);
      setErrorWithCallback(err.message || 'Connection error. Please try again later.');
      setLoading(false);
    }
  };

  // Handle leave meeting button
  const handleLeaveMeeting = () => {
    try {
      debugLog('User clicked leave meeting button');
      if (zoomClient.current && isJoined) {
        debugLog('Attempting to leave meeting via SDK');
        zoomClient.current.leave({
          success: () => {
            debugLog('Left Zoom meeting successfully');
            zoomApi.leaveZoomMeeting(meetingId).catch(err => {
              debugLog(`Error logging meeting leave: ${err.message}`);
            });
            if (onClose) onClose();
            else navigate(-1);
          },
          error: (error) => {
            debugLog(`Failed to leave Zoom meeting: ${JSON.stringify(error)}`);
            if (onClose) onClose();
            else navigate(-1);
          }
        });
      } else {
        debugLog('No active meeting to leave, simply closing');
        if (onClose) onClose();
        else navigate(-1);
      }
    } catch (err) {
      debugLog(`Error in handleLeaveMeeting: ${err.message}`);
      if (onClose) onClose();
      else navigate(-1);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="improved-zoom-container loading">
        <div className="loading-spinner-large"></div>
        <p>Підключення до Zoom зустрічі...</p>
        <div className="loading-steps">
          <div className={`loading-step ${sdkLoaded ? 'completed' : 'active'}`}>
            Завантаження Zoom SDK
          </div>
          <div className={`loading-step ${sdkLoaded && loading ? 'active' : (isJoined ? 'completed' : '')}`}>
            Ініціалізація зустрічі
          </div>
          <div className={`loading-step ${isJoined ? 'completed' : ''}`}>
            Приєднання до зустрічі
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="improved-zoom-container error">
        <div className="error-icon">
          <AlertTriangle size={40} />
        </div>
        <h3>Помилка підключення</h3>
        <p>{error}</p>
        <div className="error-debug">
          <details>
            <summary>Технічні деталі (для розробників)</summary>
            <div className="debug-log">
              {debugInfo.map((entry, index) => (
                <div key={index} className="debug-entry">
                  <span className="debug-time">{entry.time.substring(11, 19)}</span>
                  <span className="debug-message">{entry.message}</span>
                </div>
              ))}
            </div>
          </details>
        </div>
        <button onClick={handleLeaveMeeting} className="btn-primary">
          <ArrowLeft size={16} />
          Повернутися назад
        </button>
      </div>
    );
  }

  // Successfully joined meeting view
  return (
    <div className="improved-zoom-wrapper">
      <div className="improved-zoom-header">
        <h2>{meetingData?.meeting?.topic || 'Zoom Meeting'}</h2>
        <button onClick={handleLeaveMeeting} className="leave-meeting-btn">
          Покинути зустріч
        </button>
      </div>
      
      <div className="improved-zoom-content" ref={meetingContainerRef}>
        {/* Zoom SDK renders here */}
        <div id="zmmtg-root"></div>
      </div>
    </div>
  );
};

export default ImprovedZoomMeeting;