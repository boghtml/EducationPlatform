// Updated EnhancedCreateZoomMeeting.jsx with fixes for meeting creation
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../../api';
import { Calendar, Clock, Video, Users, Settings, AlertTriangle, Info, Check } from 'lucide-react';
import './CreateZoomMeeting.css';

const CreateZoomMeeting = ({ courseId, onCreated, onCancel }) => {
  const [courses, setCourses] = useState([]);
  const [formData, setFormData] = useState({
    course: courseId || '',
    topic: '',
    description: '',
    start_time: formatDateTimeForInput(new Date(Date.now() + 30 * 60000)), // meeting in 30 min by default
    duration: 60,
    host_video: true,
    participant_video: true,
    join_before_host: false,
    mute_upon_entry: true,
    auto_recording: 'none',
    waiting_room: true
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [debugMessages, setDebugMessages] = useState([]);
  const [showDebug, setShowDebug] = useState(false);
  
  // Helper function to format date for input
  function formatDateTimeForInput(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }
  
  // Debug logger function
  const debugLog = (message, type = 'info') => {
    console.log(`[DEBUG] ${message}`);
    setDebugMessages(prev => [...prev, { message, type, timestamp: new Date().toISOString() }]);
  };
  
  // Load teacher's courses
  useEffect(() => {
    const fetchCourses = async () => {
      setCoursesLoading(true);
      try {
        debugLog('Fetching CSRF token...');
        await axios.get(`${API_URL}/get-csrf-token/`, { withCredentials: true });
        
        const userId = sessionStorage.getItem('userId');
        debugLog(`Fetching courses for teacher ID: ${userId}`);
        
        const response = await axios.get(`${API_URL}/courses/`, {
          withCredentials: true,
          params: { teacher_id: userId }
        });
        
        debugLog(`Received ${response.data?.length || 0} courses`);
        setCourses(response.data || []);
        
        if (!courseId && response.data && response.data.length > 0) {
          debugLog(`Setting default course to: ${response.data[0].id} (${response.data[0].title})`);
          setFormData(prev => ({
            ...prev,
            course: response.data[0].id
          }));
        }
        setCoursesLoading(false);
      } catch (err) {
        const errorMsg = err.response?.data?.error || err.message;
        debugLog(`Error fetching courses: ${errorMsg}`, 'error');
        setError('Не вдалося завантажити список курсів. Будь ласка, спробуйте пізніше.');
        setCoursesLoading(false);
      }
    };
    
    if (!courseId) {
      fetchCourses();
    } else {
      debugLog(`Using provided courseId: ${courseId}`);
      setFormData(prev => ({
        ...prev,
        course: courseId
      }));
    }
  }, [courseId]);
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    debugLog(`Field changed: ${name}, value: ${type === 'checkbox' ? checked : value}`);
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  // Form submission with direct API call (without using zoomApi)
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      setError(null);
      setSuccess(false);
      
      // Input validation
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
      
      debugLog('Fetching CSRF token...');
      await axios.get(`${API_URL}/get-csrf-token/`, { withCredentials: true });
      
      // Prepare data for API
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
      
      debugLog('Request data prepared:', requestData);
      debugLog(JSON.stringify(requestData));
      
      // Direct API call with proper headers
      debugLog('Sending API request to create Zoom meeting...');
      const response = await axios.post(
        `${API_URL}/zoom/meetings/`, 
        requestData, 
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': document.cookie.split('csrftoken=')[1]?.split(';')[0] || ''
          }
        }
      );
      
      debugLog('API response received:');
      debugLog(JSON.stringify(response.data));
      
      // Handle success
      setIsSubmitting(false);
      setSuccess(true);
      
      // Show success for a moment before closing
      setTimeout(() => {
        if (onCreated) {
          onCreated(response.data);
        }
      }, 1500);
      
    } catch (err) {
      setIsSubmitting(false);
      
      // Detailed error logging
      debugLog(`Error: ${err.message}`, 'error');
      
      if (err.response) {
        debugLog(`Response status: ${err.response.status}`, 'error');
        debugLog(`Response data: ${JSON.stringify(err.response.data)}`, 'error');
      }
      
      setError(err.response?.data?.error || err.message || 'Не вдалося створити Zoom зустріч');
    }
  };
  
  // Toggle debug console
  const toggleDebug = () => {
    setShowDebug(prev => !prev);
  };

  return (
    <div className="create-zoom-meeting">
      <h2 className="form-title">
        <Video className="form-icon" />
        Створення нової Zoom зустрічі
      </h2>
      
      {error && (
        <div className="form-error">
          <AlertTriangle size={18} />
          <p>{error}</p>
        </div>
      )}
      
      {success && (
        <div className="form-success">
          <Check size={18} />
          <p>Zoom зустріч успішно створена!</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="zoom-form">
        {/* Course selection */}
        {!courseId && (
          <div className="form-group">
            <label htmlFor="course">
              <Video size={16} />
              Виберіть курс*
            </label>
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
                <AlertTriangle size={16} />
                <span>Курси не знайдені. Спочатку створіть хоча б один курс.</span>
              </div>
            )}
          </div>
        )}
        
        {/* Meeting topic */}
        <div className="form-group">
          <label htmlFor="topic">
            <Info size={16} />
            Тема зустрічі*
          </label>
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
        
        {/* Meeting description */}
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
        
        {/* Date and time selection */}
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
        
        {/* Meeting settings */}
        <div className="form-divider">
          <Settings size={16} />
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
        
        {/* Form actions */}
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
      
      {/* Debug information toggle button */}
      <div className="troubleshooting-section">
        <button className="troubleshooting-btn" onClick={toggleDebug}>
          {showDebug ? 'Сховати' : 'Показати'} інформацію для розробників
        </button>
        
        {showDebug && (
          <div className="form-logs">
            {debugMessages.map((message, index) => (
              <div key={index} className={`log-message log-${message.type}`}>
                [{message.timestamp.slice(11, 19)}] {message.message}
              </div>
            ))}
            {debugMessages.length === 0 && (
              <div className="log-empty">Немає повідомлень</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateZoomMeeting;