// src/components/zoom/ZoomMeeting.jsx
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

  const setErrorWithCallback = (errorMessage) => {
    setError(errorMessage);
    if (onError) {
      onError(errorMessage);
    }
  };

  // Set up Zoom container and cleanup
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

  // Load Zoom SDK scripts
  useEffect(() => {
    const loadZoomScripts = async () => {
      try {
        console.log('Loading Zoom SDK scripts...');
        
        await loadScript('https://source.zoom.us/3.13.5/lib/vendor/react.min.js');
        await loadScript('https://source.zoom.us/3.13.5/lib/vendor/react-dom.min.js');
        await loadScript('https://source.zoom.us/3.13.5/lib/vendor/redux.min.js');
        await loadScript('https://source.zoom.us/3.13.5/lib/vendor/redux-thunk.min.js');
        await loadScript('https://source.zoom.us/3.13.5/zoom-meeting-3.13.5.min.js');
        
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
        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        script.onload = resolve;
        script.onerror = (e) => reject(new Error(`Failed to load script: ${src}`));
        document.body.appendChild(script);
      });
    };

    loadZoomScripts();
  }, []);

  // Initialize Zoom when SDK is loaded
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
      
      // Extract and validate meeting number and password
      const meetingNumber = sdkData.meetingNumber;
      if (!meetingNumber) {
        throw new Error('Invalid Zoom meeting ID.');
      }
      
      const password = sdkData.passWord || '';
      
      // Join the meeting
      console.log('Joining meeting with data:', {
        meetingNumber,
        password: password ? '******' : '[empty]',
        userName: sdkData.userName,
        userEmail: sdkData.userEmail,
        sdkKey: sdkData.sdkKey,
        role: sdkData.role,
      });
      
      await new Promise((resolve, reject) => {
        zoomClient.current.join({
          sdkKey: sdkData.sdkKey,
          signature: sdkData.signature,
          meetingNumber: meetingNumber,
          password: password,
          userName: sdkData.userName || sessionStorage.getItem('userName') || 'User',
          userEmail: sdkData.userEmail || sessionStorage.getItem('userEmail') || '',
          success: () => {
            console.log('Joined Zoom meeting successfully');
            setIsJoined(true);
            resolve();
          },
          error: (error) => {
            console.error('Failed to join Zoom meeting:', error);
            let errorMessage = 'Error joining the meeting';
            
            // Provide more detailed error messages
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
            
            reject(new Error(`Error joining meeting: ${errorMessage}`));
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

      // Get meeting data from backend
      const joinData = await zoomApi.joinZoomMeeting(meetingId);
      console.log("Join data received:", joinData);
      
      setMeetingData(joinData);
      
      if (!joinData || !joinData.meeting || !joinData.sdk_data) {
        throw new Error('Failed to get necessary data to join the Zoom meeting.');
      }
      
      const { meeting, sdk_data } = joinData;
      
      // Initialize Zoom SDK
      const zoomContainer = document.getElementById('zmmtg-root');
      if (!zoomContainer) {
        throw new Error('Zoom container not found. Please refresh the page.');
      }
      
      // Clear any existing content
      while (zoomContainer.firstChild) {
        zoomContainer.removeChild(zoomContainer.firstChild);
      }

      zoomClient.current = window.ZoomMtg;
      
      if (!zoomClient.current) {
        throw new Error('Zoom Meeting SDK not found. Please refresh the page.');
      }
      
      // Set up the SDK libraries
      zoomClient.current.setZoomJSLib('https://source.zoom.us/3.13.5/lib', '/av');
      zoomClient.current.i18n.load('en-US');
      zoomClient.current.i18n.reload('en-US');
      
      try {
        zoomClient.current.preLoadWasm();
        zoomClient.current.prepareWebSDK();
        console.log("WebAssembly modules loaded successfully");
      } catch (wasmError) {
        console.error("Error loading WebAssembly modules:", wasmError);
        throw new Error('Error loading WebAssembly modules: ' + wasmError.message);
      }

      // Initialize the SDK with required parameters
      await new Promise((resolve, reject) => {
        zoomClient.current.init({
          leaveUrl: sdk_data.leaveUrl || '/dashboard',
          disableCORP: true, 
          debug: true, 
          videoDrag: true, 
          screenShare: true, 
          disablePreview: false, 
          showMeetingHeader: true,
          disableJoinAudio: false,
          success: () => {
            console.log('Zoom Meeting SDK initialized successfully');
            resolve();
          },
          error: (error) => {
            console.error('Failed to initialize Zoom SDK', error);
            reject(new Error(`Error initializing Zoom SDK: ${error.errorMessage || error.reason || JSON.stringify(error)}`));
          }
        });
      });
      
      // Join the meeting
      await joinMeeting(meeting, sdk_data);
      setLoading(false);
      
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