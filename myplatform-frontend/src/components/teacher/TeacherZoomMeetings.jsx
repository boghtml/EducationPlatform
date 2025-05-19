import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TeacherSidebar from './TeacherSidebar';
import TeacherHeader from './TeacherHeader';
import '../../css/teacher/TeacherZoomMeetings.css';
import zoomApi from '../api/zoomApi';
import ZoomMeetingsList from '../zoom/ZoomMeetingsList';
import ZoomModal from '../zoom/ZoomModal';
import CreateZoomMeeting from '../zoom/CreateZoomMeeting';
import { Video, Plus, Filter, Search, Calendar, Clock, Book, Eye, Edit, Trash, AlertTriangle } from 'lucide-react';
import axios from 'axios';
import API_URL from '../../api'; // Правильний шлях до API_URL

function TeacherZoomMeetings() {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCourseId, setSelectedCourseId] = useState('all');
  const [courses, setCourses] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'upcoming', 'past', 'active'
  const navigate = useNavigate();

  // Отримання списку курсів викладача
  const fetchTeacherCourses = async () => {
    try {
      await axios.get(`${API_URL}/get-csrf-token/`, { withCredentials: true });
      const userId = sessionStorage.getItem('userId');
      console.log("Fetching teacher courses, user ID:", userId);
      
      if (!userId) {
        console.error("User ID is missing from sessionStorage");
        setError('Не вдалося визначити ID викладача. Спробуйте вийти і увійти знову.');
        return;
      }
      
      const response = await axios.get(`${API_URL}/courses/`, {
        withCredentials: true,
        params: { teacher_id: userId }
      });
      
      console.log("Courses response:", response.data);
      
      setCourses(response.data || []);
      
      if (response.data && response.data.length > 0) {
        console.log("First course found:", response.data[0]);
      } else {
        console.log("No courses found for this teacher");
      }
    } catch (err) {
      console.error('Error fetching teacher courses:', err);
      setError('Не вдалося завантажити курси. Будь ласка, спробуйте пізніше.');
    }
  };

  // Отримання всіх Zoom зустрічей
  const fetchAllMeetings = async () => {
    try {
      setLoading(true);
      await axios.get(`${API_URL}/get-csrf-token/`, { withCredentials: true });
      const response = await axios.get(`${API_URL}/zoom/meetings/`, {
        withCredentials: true
      });
      
      console.log("Zoom meetings response:", response.data);
      setMeetings(response.data || []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching zoom meetings:', err);
      setError('Не вдалося завантажити Zoom зустрічі. Будь ласка, спробуйте пізніше.');
      setLoading(false);
    }
  };

  // Початкове завантаження даних
  useEffect(() => {
    console.log("TeacherZoomMeetings component mounted");
    
    const initData = async () => {
      await fetchTeacherCourses();
      await fetchAllMeetings();
    };
    
    initData();
  }, []);

  // Оновлення списку зустрічей при зміні фільтра курсу
  useEffect(() => {
    if (!selectedCourseId) return;
    
    console.log("Course filter changed to:", selectedCourseId);
    
    const fetchMeetings = async () => {
      try {
        setLoading(true);
        await axios.get(`${API_URL}/get-csrf-token/`, { withCredentials: true });
        
        let url = `${API_URL}/zoom/meetings/`;
        if (selectedCourseId !== 'all') {
          url = `${API_URL}/zoom/course/${selectedCourseId}/meetings/`;
        }
        
        console.log("Fetching meetings from URL:", url);
        
        const response = await axios.get(url, {
          withCredentials: true
        });
        
        console.log("Filtered meetings response:", response.data);
        setMeetings(response.data || []);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching zoom meetings:', err);
        setError('Не вдалося завантажити Zoom зустрічі. Будь ласка, спробуйте пізніше.');
        setLoading(false);
      }
    };

    fetchMeetings();
  }, [selectedCourseId]);

  // Фільтрування зустрічей за пошуком та типом
  const getFilteredMeetings = () => {
    let filtered = [...meetings];
    
    // Фільтр по пошуку
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(meeting => 
        meeting.topic.toLowerCase().includes(query) || 
        (meeting.description && meeting.description.toLowerCase().includes(query))
      );
    }
    
    // Фільтр по статусу
    const now = new Date();
    switch (filter) {
      case 'upcoming':
        filtered = filtered.filter(meeting => 
          new Date(meeting.start_time) > now && 
          meeting.status === 'scheduled'
        );
        break;
      case 'past':
        filtered = filtered.filter(meeting => 
          new Date(meeting.end_time) < now || 
          meeting.status === 'ended'
        );
        break;
      case 'active':
        filtered = filtered.filter(meeting => meeting.is_active);
        break;
      case 'canceled':
        filtered = filtered.filter(meeting => meeting.status === 'canceled');
        break;
      default:
        break;
    }
    
    return filtered;
  };

  // Обробник вибору зустрічі
  const handleSelectMeeting = (meeting) => {
    setSelectedMeeting(meeting);
  };

  // Обробник закриття модального вікна
  const handleCloseModal = () => {
    setSelectedMeeting(null);
  };

  // Обробник створення нової зустрічі
  const handleCreateMeeting = () => {
    if (courses.length === 0) {
      if (window.confirm('У вас немає жодного курсу. Спочатку створіть курс, щоб мати можливість створювати зустрічі. Перейти до створення курсу?')) {
        navigate('/teacher/courses/create');
      }
      return;
    }
    
    setShowCreateForm(true);
  };

  // Обробник успішного створення зустрічі
  const handleMeetingCreated = (newMeeting) => {
    console.log("Meeting created successfully:", newMeeting);
    setShowCreateForm(false);
    
    // Оновлюємо список зустрічей з сервера
    fetchAllMeetings();
  };

  // Обробник скасування створення зустрічі
  const handleCancelCreate = () => {
    setShowCreateForm(false);
  };

  // Обробник видалення зустрічі
  const handleDeleteMeeting = async (meetingId) => {
    if (window.confirm('Ви дійсно хочете видалити цю Zoom зустріч?')) {
      try {
        console.log("Deleting meeting with ID:", meetingId);
        await zoomApi.deleteZoomMeeting(meetingId);
        console.log("Meeting deleted successfully");
        setMeetings(prev => prev.filter(meeting => meeting.id !== meetingId));
      } catch (err) {
        console.error('Error deleting meeting:', err);
        alert('Не вдалося видалити зустріч. Будь ласка, спробуйте пізніше.');
      }
    }
  };
  
  // Форматування дати
  const formatDate = (dateString) => {
    if (!dateString) return 'Невідомо';
    return new Date(dateString).toLocaleDateString('uk-UA', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };
  
  // Форматування часу
  const formatTime = (dateString) => {
    if (!dateString) return 'Невідомо';
    return new Date(dateString).toLocaleTimeString('uk-UA', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="teacher-zoom-page">
      <TeacherHeader />
      <div className="teacher-zoom-container">
        <TeacherSidebar />
        
        <div className="teacher-zoom-content">
          <div className="teacher-zoom-header">
            <div className="teacher-zoom-title">
              <h1>
                <Video className="title-icon" />
                Управління Zoom зустрічами
              </h1>
              <p>Створюйте та керуйте відеоконференціями для ваших курсів</p>
            </div>
            
            <button className="create-meeting-button" onClick={handleCreateMeeting}>
              <Plus size={16} />
              Створити нову зустріч
            </button>
          </div>
          
          {showCreateForm ? (
            <div className="teacher-zoom-create-form">
              <CreateZoomMeeting
                courseId={selectedCourseId !== 'all' ? parseInt(selectedCourseId) : null}
                onCreated={handleMeetingCreated}
                onCancel={handleCancelCreate}
              />
            </div>
          ) : (
            <>
              <div className="teacher-zoom-filters">
                <div className="filters-row">
                  <div className="course-filter">
                    <label htmlFor="course-select">
                      <Filter size={16} />
                      Курс:
                    </label>
                    <select 
                      id="course-select" 
                      value={selectedCourseId}
                      onChange={(e) => setSelectedCourseId(e.target.value)}
                    >
                      <option value="all">Всі курси</option>
                      {courses.map(course => (
                        <option key={course.id} value={course.id}>{course.title}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="status-filter">
                    <label htmlFor="status-select">Статус:</label>
                    <select 
                      id="status-select" 
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                    >
                      <option value="all">Всі зустрічі</option>
                      <option value="upcoming">Заплановані</option>
                      <option value="active">Активні</option>
                      <option value="past">Завершені</option>
                      <option value="canceled">Скасовані</option>
                    </select>
                  </div>
                  
                  <div className="search-filter">
                    <Search size={16} />
                    <input 
                      type="text"
                      placeholder="Пошук зустрічей..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              
              {loading ? (
                <div className="zoom-loading">
                  <div className="loading-spinner"></div>
                  <p>Завантаження Zoom зустрічей...</p>
                </div>
              ) : error ? (
                <div className="zoom-error">
                  <AlertTriangle size={40} />
                  <h3>Помилка</h3>
                  <p>{error}</p>
                  <button 
                    className="retry-button"
                    onClick={() => window.location.reload()}
                  >
                    Спробувати знову
                  </button>
                </div>
              ) : getFilteredMeetings().length === 0 ? (
                <div className="no-meetings">
                  <Calendar size={48} />
                  <h3>Немає зустрічей</h3>
                  <p>
                    {searchQuery ? 
                      'Немає зустрічей, що відповідають пошуковому запиту.' : 
                      'У вас ще немає створених Zoom зустрічей. Створіть свою першу зустріч!'
                    }
                  </p>
                  <button className="create-first-meeting" onClick={handleCreateMeeting}>
                    <Plus size={16} />
                    Створити зустріч
                  </button>
                </div>
              ) : (
                <div className="meetings-grid">
                  {getFilteredMeetings().map(meeting => {
                    // Визначення статусу для відображення
                    let statusText;
                    switch(meeting.status) {
                      case 'scheduled': statusText = 'Заплановано'; break;
                      case 'live': statusText = 'В процесі'; break;
                      case 'ended': statusText = 'Завершено'; break;
                      case 'canceled': statusText = 'Скасовано'; break;
                      default: statusText = 'Заплановано';
                    }
                    
                    return (
                      <div key={meeting.id} className="meeting-card">
                        <div className={`meeting-status ${meeting.status}`}>
                          {statusText}
                        </div>
                        
                        <h3 className="meeting-title">{meeting.topic}</h3>
                        
                        <div className="meeting-info">
                          <div className="info-item">
                            <Calendar size={14} />
                            <span>{formatDate(meeting.start_time)}</span>
                          </div>
                          <div className="info-item">
                            <Clock size={14} />
                            <span>{formatTime(meeting.start_time)}</span>
                          </div>
                          {meeting.course_data && (
                            <div className="info-item">
                              <Book size={14} />
                              <span>{meeting.course_data.title}</span>
                            </div>
                          )}
                        </div>
                        
                        {meeting.description && (
                          <p className="meeting-description">{meeting.description}</p>
                        )}
                        
                        <div className="meeting-actions">
                          <button 
                            className="btn-view"
                            onClick={() => navigate(`/zoom/meetings/${meeting.id}`)}
                          >
                            <Eye size={14} />
                            Деталі
                          </button>
                          
                          <button 
                            className="btn-edit"
                            onClick={() => navigate(`/teacher/zoom/edit/${meeting.id}`)}
                          >
                            <Edit size={14} />
                            Редагувати
                          </button>
                          
                          <button 
                            className="btn-delete"
                            onClick={() => handleDeleteMeeting(meeting.id)}
                          >
                            <Trash size={14} />
                            Видалити
                          </button>
                          
                          {meeting.can_join && (
                            <button 
                              className="btn-join"
                              onClick={() => handleSelectMeeting(meeting)}
                            >
                              <Video size={14} />
                              Приєднатися
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
      
      {/* Модальне вікно для Zoom зустрічі */}
      {selectedMeeting && (
        <ZoomModal
          meetingId={selectedMeeting.id}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}

export default TeacherZoomMeetings;