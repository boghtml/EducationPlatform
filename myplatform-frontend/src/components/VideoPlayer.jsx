import React, { useState, useEffect } from 'react';

const VideoPlayer = ({ fileUrl, fileType, fileName }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Функція для отримання ID відео з URL YouTube
  const getYouTubeVideoId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url?.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };
  
  // Перевірка, чи є URL посиланням на YouTube
  const isYoutubeUrl = (url) => {
    return url?.includes('youtube.com') || url?.includes('youtu.be');
  };
  
  // Перевірка, чи є файл з S3
  const isS3Url = (url) => {
    return url?.includes('amazonaws.com') || url?.includes('s3.');
  };
  
  // Форматування довгої назви файлу
  const formatFileName = (name) => {
    if (!name) return "Файл";
    if (name.length > 40) {
      return name.substring(0, 35) + '...';
    }
    return name;
  };
  
  useEffect(() => {
    if (fileUrl) {
      // Затримка для відображення завантаження
      const timer = setTimeout(() => {
        setLoading(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [fileUrl]);
  
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
        <a 
          href={fileUrl} 
          download 
          className="file-download-link"
          target="_blank"
          rel="noopener noreferrer"
        >
          Спробуйте завантажити файл
        </a>
      </div>
    );
  }
  
  // Обробляємо відео з YouTube
  if (isYoutubeUrl(fileUrl)) {
    const videoId = getYouTubeVideoId(fileUrl);
    if (videoId) {
      const formattedTitle = formatFileName(fileName);
      
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
        </div>
      );
    }
  }
  
  // Обробляємо власні відеофайли (MP4, WebM тощо)
  if (fileType?.toLowerCase().includes('video') || fileUrl?.toLowerCase().endsWith('.mp4') || fileUrl?.toLowerCase().endsWith('.webm')) {
    const formattedTitle = formatFileName(fileName);
    const corsProxyUrl = isS3Url(fileUrl) ? fileUrl : fileUrl; // якщо потрібно, можна додати проксі
    
    return (
      <div className="video-player native-player">
        <h4 className="video-title">{formattedTitle}</h4>
        <div className="video-container">
          <video 
            controls 
            width="100%" 
            height="auto"
            preload="metadata"
            className="lesson-video"
            controlsList="nodownload" // обмеження завантаження, хоча не 100% надійне
            onError={(e) => {
              console.error("Помилка відтворення відео:", e);
              setError("Не вдалося відтворити відео. Формат може не підтримуватися в браузері або файл недоступний.");
            }}
          >
            <source src={corsProxyUrl} type={fileType || "video/mp4"} />
            Ваш браузер не підтримує відтворення відео.
          </video>
        </div>
        <div className="video-player-footer">
          <p className="video-note">Якщо відео не відтворюється, ви можете <a href={fileUrl} download target="_blank" rel="noopener noreferrer">завантажити його</a>.</p>
        </div>
      </div>
    );
  }
  
  // Обробляємо PDF файли
  if (fileType?.toLowerCase().includes('pdf') || fileUrl?.toLowerCase().endsWith('.pdf')) {
    const formattedTitle = formatFileName(fileName);
    
    // Для PDF з S3 та інших джерел можемо використати Viewer API від Google
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
          <p className="pdf-note">Якщо документ не відображається, ви можете <a href={fileUrl} download target="_blank" rel="noopener noreferrer">завантажити його</a>.</p>
        </div>
      </div>
    );
  }
  
  // Для інших типів файлів показуємо посилання для завантаження
  const formattedTitle = formatFileName(fileName);
  
  return (
    <div className="file-download">
      <p>Цей тип файлу не може бути відтворений безпосередньо. Будь ласка, завантажте його.</p>
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