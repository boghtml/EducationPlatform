// src/components/zoom/CreateZoomMeeting.jsx - Виправлений
import React, { useState, useEffect } from 'react';
import './CreateZoomMeeting.css';
import axios from 'axios';
import API_URL from '../../api'; 
import { Calendar, Clock, Users, Video, Info } from 'lucide-react';

const CreateZoomMeeting = ({ courseId, onCreated, onCancel }) => {
  const [courses, setCourses] = useState([]);
  const [formData, setFormData] = useState({
    course: courseId || '',
    topic: '',
    description: '',
    start_time: formatDateTimeForInput(new Date(Date.now() + 30 * 60000)), // зустріч через 30 хв за замовчуванням
    duration: 60,
    host_video: true,
    participant_video: true,
    join_before_host: false,
    mute_upon_entry: true,
    auto_recording: 'none'
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [coursesLoading, setCoursesLoading] = useState(false);
  
  useEffect(() => {
    console.log("CreateZoomMeeting component mounted. courseId:", courseId);
    
    const fetchCourses = async () => {
      setCoursesLoading(true);
      try {
        await axios.get(`${API_URL}/get-csrf-token/`, { withCredentials: true });
        const userId = sessionStorage.getItem('userId');
        console.log("Fetching courses for teacher ID:", userId);
        
        const response = await axios.get(`${API_URL}/courses/`, {
          withCredentials: true,
          params: { teacher_id: userId }
        });
        
        console.log("Courses received:", response.data);
        setCourses(response.data || []);
        
        if (!courseId && response.data && response.data.length > 0) {
          console.log("Setting default course:", response.data[0].id);
          setFormData(prev => ({
            ...prev,
            course: response.data[0].id
          }));
        }
        setCoursesLoading(false);
      } catch (err) {
        console.error('Error fetching courses:', err);
        setError('Не вдалося завантажити список курсів. Будь ласка, спробуйте пізніше.');
        setCoursesLoading(false);
      }
    };
    
    if (!courseId) {
      fetchCourses();
    } else {
      console.log("Using provided courseId:", courseId);
      setFormData(prev => ({
        ...prev,
        course: courseId
      }));
    }
  }, [courseId]);
  
  function formatDateTimeForInput(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    console.log(`Field changed: ${name}, value: ${type === 'checkbox' ? checked : value}`);
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      if (!formData.topic.trim()) {
        throw new Error('Тема зустрічі обов\'язкова');
      }
      
      if (!formData.course) {
        throw new Error('Виберіть курс для зустрічі');
      }
      
      const startTime = new Date(formData.start_time);
      if (isNaN(startTime.getTime())) {
        throw new Error('Вкажіть коректну дату та час початку');
      }
      
      if (startTime < new Date()) {
        throw new Error('Дата та час початку не можуть бути в минулому');
      }
      
      if (formData.duration < 15 || formData.duration > 300) {
        throw new Error('Тривалість має бути від 15 до 300 хвилин');
      }
      
      await axios.get(`${API_URL}/get-csrf-token/`, { withCredentials: true });
      
      const requestData = {
        course: parseInt(formData.course),
        topic: formData.topic,
        description: formData.description,
        start_time: (new Date(formData.start_time)).toISOString(), 
        duration: parseInt(formData.duration),
        host_video: formData.host_video,
        participant_video: formData.participant_video,
        join_before_host: formData.join_before_host,
        mute_upon_entry: formData.mute_upon_entry,
        auto_recording: formData.auto_recording
      };
      
      console.log('Sending data to backend:', requestData);
      
      const response = await axios.post(`${API_URL}/zoom/meetings/`, requestData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Meeting created successfully:', response.data);
      setIsSubmitting(false);
      
      if (onCreated) {
        onCreated(response.data);
      }
      
    } catch (err) {
      setIsSubmitting(false);
      if (err.response && err.response.data) {
        console.error('Server error details:', err.response.data);
      }
      setError(err.response?.data?.error || err.message || 'Не вдалося створити Zoom зустріч');
      console.error('Error creating Zoom meeting:', err);
    }
  };

  return (
    <div className="create-zoom-meeting">
      <h2 className="form-title">
        <Video className="form-icon" />
        Створення нової Zoom зустрічі
      </h2>
      
      {error && (
        <div className="form-error">
          <Info size={18} />
          <p>{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="zoom-form">
        {/* Відображаємо вибір курсу, якщо courseId не передано */}
        {!courseId && (
          <div className="form-group">
            <label htmlFor="course">Виберіть курс*</label>
            {coursesLoading ? (
              <div className="course-loading">Завантаження курсів...</div>
            ) : courses.length > 0 ? (
              <select
                id="course"
                name="course"
                value={formData.course}
                onChange={handleChange}
                required
              >
                <option value="">-- Виберіть курс --</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id}>{course.title}</option>
                ))}
              </select>
            ) : (
              <div className="no-courses-warning">
                Курси не знайдені. Перш ніж створювати зустріч, створіть хоча б один курс.
              </div>
            )}
          </div>
        )}
        
        <div className="form-group">
          <label htmlFor="topic">Тема зустрічі*</label>
          <input
            type="text"
            id="topic"
            name="topic"
            value={formData.topic}
            onChange={handleChange}
            placeholder="Введіть тему зустрічі"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Опис зустрічі</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Додайте опис зустрічі"
            rows={3}
          ></textarea>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="start_time">
              <Calendar size={16} />
              Дата та час початку*
            </label>
            <input
              type="datetime-local"
              id="start_time"
              name="start_time"
              value={formData.start_time}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="duration">
              <Clock size={16} />
              Тривалість (хв)*
            </label>
            <input
              type="number"
              id="duration"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              min="15"
              max="300"
              required
            />
          </div>
        </div>
        
        <div className="form-divider">
          <span>Налаштування зустрічі</span>
        </div>
        
        <div className="form-checkboxes">
          <div className="form-checkbox-item">
            <input
              type="checkbox"
              id="host_video"
              name="host_video"
              checked={formData.host_video}
              onChange={handleChange}
            />
            <label htmlFor="host_video">Увімкнути відео ведучого</label>
          </div>
          
          <div className="form-checkbox-item">
            <input
              type="checkbox"
              id="participant_video"
              name="participant_video"
              checked={formData.participant_video}
              onChange={handleChange}
            />
            <label htmlFor="participant_video">Увімкнути відео учасників</label>
          </div>
          
          <div className="form-checkbox-item">
            <input
              type="checkbox"
              id="join_before_host"
              name="join_before_host"
              checked={formData.join_before_host}
              onChange={handleChange}
            />
            <label htmlFor="join_before_host">Дозволити приєднання до приходу ведучого</label>
          </div>
          
          <div className="form-checkbox-item">
            <input
              type="checkbox"
              id="mute_upon_entry"
              name="mute_upon_entry"
              checked={formData.mute_upon_entry}
              onChange={handleChange}
            />
            <label htmlFor="mute_upon_entry">Вимкнути звук у учасників при вході</label>
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="auto_recording">Автоматичний запис</label>
          <select
            id="auto_recording"
            name="auto_recording"
            value={formData.auto_recording}
            onChange={handleChange}
          >
            <option value="none">Не записувати</option>
            <option value="local">Локальний запис</option>
            <option value="cloud">Хмарний запис</option>
          </select>
        </div>
        
        <div className="form-actions">
          <button 
            type="button" 
            className="btn-cancel"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Скасувати
          </button>
          
          <button 
            type="submit" 
            className="btn-create"
            disabled={isSubmitting || (!courseId && courses.length === 0)}
          >
            {isSubmitting ? (
              <>
                <div className="loading-spinner-small"></div>
                Створення...
              </>
            ) : (
              <>
                <Video size={16} />
                Створити зустріч
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateZoomMeeting;