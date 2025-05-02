import React from 'react';
import '../css/VideoPlayer.css';

const VideoPlayer = ({ url, title, type = 'url' }) => {
  // Function to get YouTube video ID from URL
  const getYouTubeVideoId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const renderVideo = () => {
    if (type === 'url') {
      const videoId = getYouTubeVideoId(url);
      if (videoId) {
        return (
          <div className="video-container">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}`}
              title={title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            ></iframe>
          </div>
        );
      }
    }

    // For local MP4 files
    return (
      <div className="video-container">
        <video controls>
          <source src={url} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
    );
  };

  return (
    <div className="video-player">
      {renderVideo()}
    </div>
  );
};

export default VideoPlayer; 