// src/components/zoom/ZoomMeeting.jsx - Оновлений до актуальної версії SDK
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
  
  const SDK_VERSION = '2.11.0';

  const setErrorWithCallback = (errorMessage) => {
    console.error("Zoom error:", errorMessage);
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
      console.log('Created zmmtg-root container');
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
    const loadZoomScripts = async () => {
      try {
        console.log(`Loading Zoom SDK version ${SDK_VERSION} scripts...`);
        
        await loadScript(`https://source.zoom.us/${SDK_VERSION}/lib/vendor/react.min.js`);
        await loadScript(`https://source.zoom.us/${SDK_VERSION}/lib/vendor/react-dom.min.js`);
        await loadScript(`https://source.zoom.us/${SDK_VERSION}/lib/vendor/redux.min.js`);
        await loadScript(`https://source.zoom.us/${SDK_VERSION}/lib/vendor/redux-thunk.min.js`);
        await loadScript(`https://source.zoom.us/${SDK_VERSION}/lib/vendor/lodash.min.js`);
        await loadScript(`https://source.zoom.us/${SDK_VERSION}/zoom-meeting-${SDK_VERSION}.min.js`);
        
        console.log('Zoom SDK loaded successfully');
        setIsSDKLoaded(true);
      } catch (err) {
        console.error('Error loading Zoom SDK:', err);
        setErrorWithCallback('Error loading Zoom SDK: ' + err.message);
        setLoading(false);
      }
    };

    const loadScript = (src) => {
      return new Promise((resolve, reject) => {
        
        const existingScript = document.querySelector(`script[src="${src}"]`);
        if (existingScript) {
          console.log(`Script already loaded: ${src}`);
          resolve();
          return;
        }
        
        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        script.onload = () => {
          console.log(`Script loaded successfully: ${src}`);
          resolve();
        };
        script.onerror = (e) => {
          console.error(`Failed to load script: ${src}`, e);
          reject(new Error(`Failed to load script: ${src}`));
        };
        document.body.appendChild(script);
      });
    };

    loadZoomScripts();
  }, [SDK_VERSION]);

  useEffect(() => {
    if (isSDKLoaded) {
      initZoom();
    }
  }, [isSDKLoaded]);

  const joinMeeting = async (meetingData, sdkData) => {
    try {
      if (!zoomClient.current) {
        throw new Error('Zoom SDK not initialized. Please refresh the page.');
      }
      
      const meetingNumber = sdkData.meetingNumber;
      if (!meetingNumber) {
        throw new Error('Invalid Zoom meeting ID.');
      }
      
      const password = sdkData.passWord || '';
      
      console.log('Join meeting data:', {
        meetingNumber,
        password: password ? '[REDACTED]' : '[empty]',
        userName: sdkData.userName,
        userEmail: sdkData.userEmail,
        sdkKey: sdkData.sdkKey ? sdkData.sdkKey.substring(0, 5) + '...' : 'undefined',
        signature: sdkData.signature ? sdkData.signature.substring(0, 10) + '...' : 'undefined',
        role: sdkData.role
      });
      
      const joinConfig = {
        apiKey: sdkData.sdkKey,
        signature: sdkData.signature,
        meetingNumber: meetingNumber,
        password: password,
        userName: sdkData.userName || sessionStorage.getItem('userName') || 'User',
        userEmail: sdkData.userEmail || sessionStorage.getItem('userEmail') || '',
        success: () => {
          console.log('Joined Zoom meeting successfully');
          setIsJoined(true);
        },
        error: (error) => {
          console.error('Failed to join Zoom meeting:', error);
          let errorMessage = 'Error joining the meeting';
          
          if (error.errorCode) {
            switch(error.errorCode) {
              case 1: errorMessage = 'Invalid meeting number or meeting is not active'; break;
              case 2: errorMessage = 'Meeting has not started yet'; break;
              case 3: errorMessage = 'Incorrect meeting password'; break;
              case 4: errorMessage = 'Meeting has already ended'; break;
              case 5: errorMessage = 'Meeting is full'; break;
              default: errorMessage = error.errorMessage || 'Unknown error';
            }
          }
          
          setErrorWithCallback(`Error joining meeting: ${errorMessage}`);
        }
      };
      
      zoomClient.current.join(joinConfig);
    } catch (error) {
      throw error;
    }
  };

  const initZoom = async () => {
    try {
      setLoading(true);

      console.log(`Fetching join data for meeting ID: ${meetingId}`);
      const joinData = await zoomApi.joinZoomMeeting(meetingId);
      console.log("Join data received:", joinData);
      
      setMeetingData(joinData);
      
      if (!joinData || !joinData.meeting || !joinData.sdk_data) {
        throw new Error('Failed to get necessary data to join the Zoom meeting.');
      }
      
      const { meeting, sdk_data } = joinData;
      
      const zoomContainer = document.getElementById('zmmtg-root');
      if (!zoomContainer) {
        throw new Error('Zoom container not found. Please refresh the page.');
      }
      
      while (zoomContainer.firstChild) {
        zoomContainer.removeChild(zoomContainer.firstChild);
      }

      zoomClient.current = window.ZoomMtg;
      
      if (!zoomClient.current) {
        throw new Error('Zoom Meeting SDK not found. Please refresh the page.');
      }
      
      zoomClient.current.setZoomJSLib(`https://source.zoom.us/${SDK_VERSION}/lib`, '/av');
      zoomClient.current.preLoadWasm();
      zoomClient.current.prepareWebSDK();
      
      zoomClient.current.i18n.load('en-US');
      zoomClient.current.i18n.reload('en-US');
      
      zoomClient.current.init({
        leaveUrl: sdk_data.leaveUrl || '/dashboard',
        disableCORP: true, 
        debug: true, 
        videoDrag: true, 
        screenShare: true, 
        disablePreview: false, 
        showMeetingHeader: true,
        disableJoinAudio: false,
        isSupportAV: true,
        isSupportChat: true,
        isSupportQA: true,
        isSupportPolling: true,
        isSupportBreakout: true,
        success: () => {
          console.log('Zoom Meeting SDK initialized successfully');
          joinMeeting(meeting, sdk_data);
          setLoading(false);
        },
        error: (error) => {
          console.error('Failed to initialize Zoom SDK', error);
          setErrorWithCallback(`Error initializing Zoom SDK: ${error.errorMessage || error.reason || JSON.stringify(error)}`);
          setLoading(false);
        }
      });
      
    } catch (err) {
      console.error('Error initializing Zoom meeting:', err);
      setErrorWithCallback(err.message || 'Connection error. Please try again later.');
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
        <p>Connecting to Zoom meeting...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="zoom-meeting-container error">
        <div className="error-icon">!</div>
        <h3>Connection Error</h3>
        <p>{error}</p>
        <button onClick={handleLeaveMeeting} className="btn-primary">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="zoom-meeting-wrapper">
      <div className="zoom-meeting-header">
        <h2>{meetingData?.meeting?.topic || 'Zoom Meeting'}</h2>
        <button onClick={handleLeaveMeeting} className="leave-meeting-btn">
          Leave Meeting
        </button>
      </div>
      
      {/* Zoom SDK uses the element with id='zmmtg-root' */}
      <div className="zoom-meeting-container" ref={meetingContainerRef}></div>
    </div>
  );
};

export default ZoomMeeting;