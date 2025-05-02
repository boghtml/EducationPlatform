import React, { useState, useEffect, useRef } from 'react';
import '../css/VideoPlayer.css';

const VideoPlayer = ({ fileUrl, fileType, fileName }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const videoRef = useRef(null);
  
  const getYouTubeVideoId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };
  
  const isYoutubeUrl = (url) => {
    return url?.includes('youtube.com') || url?.includes('youtu.be');
  };
  
  const isS3Url = (url) => {
    return url?.includes('amazonaws.com') || url?.includes('s3.');
  };
  
  const formatFileName = (name) => {
    if (!name) return "Файл";
    if (name.length > 40) {
      return name.substring(0, 35) + '...';
    }
    return name;
  };

  const determineContentType = (url, type) => {
    if (isYoutubeUrl(url)) return 'youtube';
    
    if (type) {
      const lowerType = type.toLowerCase();
      if (lowerType.includes('video') || lowerType.includes('mp4')) return 'video';
      if (lowerType.includes('pdf')) return 'pdf';
    }
    
    if (url) {
      const lowerUrl = url.toLowerCase();
      if (lowerUrl.endsWith('.mp4')) return 'video';
      if (lowerUrl.endsWith('.webm')) return 'video';
      if (lowerUrl.endsWith('.pdf')) return 'pdf';
    }
    
    return 'unknown';
  };
  
  useEffect(() => {
    if (fileUrl) {
      
      const timer = setTimeout(() => {
        setLoading(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [fileUrl]);

  const handleVideoError = (e) => {
    console.error("Помилка відтворення відео:", e);
    setError("Не вдалося відтворити відео. Формат може не підтримуватися в браузері або файл недоступний.");
  };

  const retryVideoLoad = () => {
    if (videoRef.current) {
      setError(null);
      videoRef.current.load();
    }
  };
  
  if (loading) {
    return (
      <div className="video-player-loading">
        <div className="spinner"></div>
        <p>Завантаження медіа...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="video-player-error">
        <p>Помилка відтворення: {error}</p>
        <div className="video-error-actions">
          <button onClick={retryVideoLoad} className="video-retry-button">
            Спробувати ще раз
          </button>
          <a 
            href={fileUrl} 
            download 
            className="file-download-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            Завантажити файл
          </a>
        </div>
      </div>
    );
  }
  
  const contentType = determineContentType(fileUrl, fileType);
  const formattedTitle = formatFileName(fileName);
  
  if (contentType === 'youtube') {
    const videoId = getYouTubeVideoId(fileUrl);
    if (videoId) {
      return (
        <div className="video-player youtube-player">
          <h4 className="video-title">{formattedTitle}</h4>
          <div className="video-container">
            <iframe 
              width="100%" 
              height="450" 
              src={`https://www.youtube.com/embed/${videoId}`}
              title={formattedTitle || "YouTube video player"}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
          <div className="video-player-footer">
            <p className="video-note">Відтворюється відео з YouTube</p>
          </div>
        </div>
      );
    }
  }
  
  if (contentType === 'video') {
    const corsProxyUrl = fileUrl; 

    let mimeType = 'video/mp4'; 
    if (fileType?.toLowerCase().includes('webm')) {
      mimeType = 'video/webm';
    } else if (fileUrl?.toLowerCase().endsWith('.webm')) {
      mimeType = 'video/webm';
    }
    
    return (
      <div className="video-player native-player">
        <h4 className="video-title">{formattedTitle}</h4>
        <div className="video-container">
          <video 
            ref={videoRef}
            controls 
            width="100%" 
            height="auto"
            preload="metadata"
            className="lesson-video"
            controlsList="nodownload" 
            onError={handleVideoError}
            autoPlay
            playsInline
          >
            <source src={corsProxyUrl} type={mimeType} />
            Ваш браузер не підтримує відтворення відео.
          </video>
        </div>
        <div className="video-player-footer">
          <p className="video-note">
            Якщо відео не відтворюється, ви можете 
            <a href={fileUrl} download target="_blank" rel="noopener noreferrer"> завантажити його</a>.
          </p>
        </div>
      </div>
    );
  }
  
  if (contentType === 'pdf') {
    
    const pdfViewerUrl = isS3Url(fileUrl) 
      ? `https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true` 
      : `${fileUrl}#toolbar=1&view=FitH`;
    
    return (
      <div className="pdf-viewer">
        <h4 className="pdf-title">{formattedTitle}</h4>
        <div className="pdf-container">
          <iframe
            src={pdfViewerUrl}
            width="100%"
            height="600px"
            title={formattedTitle || "PDF document"}
            onError={() => setError("Не вдалося завантажити PDF. Перевірте з'єднання з інтернетом або спробуйте завантажити файл.")}
          ></iframe>
        </div>
        <div className="pdf-viewer-footer">
          <p className="pdf-note">
            Якщо документ не відображається, ви можете 
            <a href={fileUrl} download target="_blank" rel="noopener noreferrer"> завантажити його</a>.
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="file-download">
      <p>Цей тип файлу ({fileType || 'невідомий'}) не може бути відтворений безпосередньо. Будь ласка, завантажте його.</p>
      <a 
        href={fileUrl} 
        download 
        className="file-download-link"
        target="_blank"
        rel="noopener noreferrer"
      >
        Завантажити файл {formattedTitle}
      </a>
    </div>
  );
};

export default VideoPlayer;