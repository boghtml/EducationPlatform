import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../api';
import VideoPlayer from './VideoPlayer';
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

  return (
    <div className="lesson-detail">
      <h1 className="lesson-title">{lesson.title}</h1>
      <div className="lesson-content">
        {lesson.file_type === 'url' || lesson.file_type === 'mp4' ? (
          <VideoPlayer 
            url={lesson.file_url} 
            title={lesson.title}
            type={lesson.file_type}
          />
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