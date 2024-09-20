import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../api';
import '../css/LessonDetail.css'; // Створіть цей файл для стилів

function LessonDetail() {
  const { lessonId } = useParams();
  const [lesson, setLesson] = useState(null);

  useEffect(() => {
    axios.get(`${API_URL}/lessons/${lessonId}/`)
      .then(response => {
        setLesson(response.data);
      })
      .catch(error => {
        console.error("Error fetching lesson:", error);
      });
  }, [lessonId]);

  if (!lesson) {
    return <div className="loading">Loading...</div>;
  }

  // Функція для отримання ID відео з URL YouTube
  const getYouTubeVideoId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const videoId = lesson.file_type === 'url' ? getYouTubeVideoId(lesson.file_url) : null;

  return (
    <div className="lesson-detail">
      <h1 className="lesson-title">{lesson.title}</h1>
      <div className="lesson-content">
        {lesson.file_type === 'url' && videoId ? (
          <div className="video-container">
            <iframe 
              width="560" 
              height="315" 
              src={`https://www.youtube.com/embed/${videoId}`}
              title={lesson.title} 
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
              allowFullScreen>
            </iframe>
          </div>
        ) : (
          <p>{lesson.content}</p>
        )}
      </div>
      <div className="lesson-info">
        <p><strong>Створено:</strong> {new Date(lesson.created_at).toLocaleString()}</p>
        <p><strong>Оновлено:</strong> {new Date(lesson.updated_at).toLocaleString()}</p>
      </div>
    </div>
  );
}

export default LessonDetail;