import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TeacherSidebar from './TeacherSidebar';
import TeacherHeader from './TeacherHeader';
import '../../css/teacher/TeacherZoomMeetings.css';
import zoomApi from '../api/zoomApi';
import ZoomMeetingsList from '../zoom/ZoomMeetingsList';
import ZoomModal from '../zoom/ZoomModal';
import CreateZoomMeeting from '../zoom/CreateZoomMeeting';
import { 
  Video, Plus, Filter, Search, Calendar, Clock, Book, 
  Eye, Edit, Trash, AlertTriangle, VideoOff, CheckCircle, 
  X, Calendar as CalendarIcon, Info
} from 'lucide-react';
import axios from 'axios';
import API_URL from '../../api';

function TeacherZoomMeetings() {
  
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCourseId, setSelectedCourseId] = useState('all');
  const [courses, setCourses] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all'); 
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);
  const navigate = useNavigate();

  const fetchTeacherCourses = async () => {
    try {
      setLoadingCourses(true);
      await axios.get(`${API_URL}/get-csrf-token/`, { withCredentials: true });
      const userId = sessionStorage.getItem('userId');
      console.log("Отримання курсів для викладача з ID:", userId);
      
      if (!userId) {
        console.error("ID користувача відсутній у sessionStorage");
        setError('Не вдалося визначити ID викладача. Спробуйте вийти і увійти знову.');
        setLoadingCourses(false);
        return;
      }
      
      const response = await axios.get(`${API_URL}/courses/`, {
        withCredentials: true,
        params: { teacher_id: userId }
      });
      
      console.log("Відповідь щодо курсів:", response.data);
      
      setCourses(response.data || []);
      setLoadingCourses(false);
      
      if (response.data && response.data.length > 0) {
        console.log("Знайдено перший курс:", response.data[0]);
      } else {
        console.log("Не знайдено курсів для цього викладача");
      }
    } catch (err) {
      console.error('Помилка отримання курсів викладача:', err);
      setError('Не вдалося завантажити курси. Будь ласка, спробуйте пізніше.');
      setLoadingCourses(false);
    }
  };

  const fetchAllMeetings = async () => {
    try {
      setLoading(true);
      await axios.get(`${API_URL}/get-csrf-token/`, { withCredentials: true });
      const response = await axios.get(`${API_URL}/zoom/meetings/`, {
        withCredentials: true
      });
      
      console.log("Відповідь щодо Zoom зустрічей:", response.data);
      setMeetings(response.data || []);
      setLoading(false);
    } catch (err) {
      console.error('Помилка отримання Zoom зустрічей:', err);
      setError('Не вдалося завантажити Zoom зустрічі. Будь ласка, спробуйте пізніше.');
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("Компонент TeacherZoomMeetings змонтовано");
    
    const initData = async () => {
      await fetchTeacherCourses();
      await fetchAllMeetings();
    };
    
    initData();
  }, []);

  useEffect(() => {
    if (!selectedCourseId) return;
    
    console.log("Фільтр курсу змінено на:", selectedCourseId);
    
    const fetchMeetings = async () => {
      try {
        setLoading(true);
        await axios.get(`${API_URL}/get-csrf-token/`, { withCredentials: true });
        
        let url = `${API_URL}/zoom/meetings/`;
        if (selectedCourseId !== 'all') {
          url = `${API_URL}/zoom/course/${selectedCourseId}/meetings/`;
        }
        
        console.log("Отримання зустрічей з URL:", url);
        
        const response = await axios.get(url, {
          withCredentials: true
        });
        
        console.log("Відповідь відфільтрованих зустрічей:", response.data);
        setMeetings(response.data || []);
        setLoading(false);
      } catch (err) {
        console.error('Помилка отримання Zoom зустрічей:', err);
        setError('Не вдалося завантажити Zoom зустрічі. Будь ласка, спробуйте пізніше.');
        setLoading(false);
      }
    };

    fetchMeetings();
  }, [selectedCourseId]);

  const getFilteredMeetings = () => {
    let filtered = [...meetings];
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(meeting => 
        meeting.topic.toLowerCase().includes(query) || 
        (meeting.description && meeting.description.toLowerCase().includes(query))
      );
    }
    
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

  const handleSelectMeeting = (meeting) => {
    setSelectedMeeting(meeting);
  };

  const handleCloseModal = () => {
    setSelectedMeeting(null);
  };

  const handleCreateMeeting = () => {
    if (courses.length === 0) {
      if (window.confirm('У вас немає жодного курсу. Спочатку створіть курс, щоб мати можливість створювати зустрічі. Перейти до створення курсу?')) {
        navigate('/teacher/courses/create');
      }
      return;
    }
    
    setShowCreateForm(true);
    
    setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }, 100);
  };

  const handleMeetingCreated = (newMeeting) => {
    console.log("Зустріч успішно створено:", newMeeting);
    setShowCreateForm(false);
    
    setMeetings(prev => {
      const updated = [newMeeting, ...prev];
      return updated;
    });
    
    const successMessage = document.createElement('div');
    successMessage.className = 'success-message';
    successMessage.innerHTML = `
      <div class="success-content">
        <span class="success-icon">✓</span>
        <span>Зустріч "${newMeeting.topic}" успішно створена!</span>
      </div>
    `;
    document.body.appendChild(successMessage);
    
    setTimeout(() => {
      document.body.removeChild(successMessage);
    }, 3000);
  };

  const handleCancelCreate = () => {
    setShowCreateForm(false);
  };

  const handleDeleteMeeting = async (meetingId) => {
    
    setDeleteConfirmation(meetingId);
  };
  
  const confirmDelete = async (meetingId) => {
    try {
      console.log("Видалення зустрічі з ID:", meetingId);
      await zoomApi.deleteZoomMeeting(meetingId);
      console.log("Зустріч успішно видалено");
      
      setMeetings(prev => prev.filter(meeting => meeting.id !== meetingId));
      setDeleteConfirmation(null);
      
      const successMessage = document.createElement('div');
      successMessage.className = 'success-message';
      successMessage.innerHTML = `
        <div class="success-content">
          <span class="success-icon">✓</span>
          <span>Зустріч успішно видалено!</span>
        </div>
      `;
      document.body.appendChild(successMessage);
      
      setTimeout(() => {
        document.body.removeChild(successMessage);
      }, 3000);
    } catch (err) {
      console.error('Помилка видалення зустрічі:', err);
      alert('Не вдалося видалити зустріч. Будь ласка, спробуйте пізніше.');
      setDeleteConfirmation(null);
    }
  };
  
  const cancelDelete = () => {
    setDeleteConfirmation(null);
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return 'Невідомо';
    return new Date(dateString).toLocaleDateString('uk-UA', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };
  
  const formatTime = (dateString) => {
    if (!dateString) return 'Невідомо';
    return new Date(dateString).toLocaleTimeString('uk-UA', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const getMeetingStatus = (meeting) => {
    const now = new Date();
    const startTime = new Date(meeting.start_time);
    const endTime = new Date(meeting.end_time);
    
    if (meeting.status === 'canceled') {
      return { text: 'Скасовано', className: 'canceled' };
    }
    
    if (meeting.is_active || (now >= startTime && now <= endTime)) {
      return { text: 'В процесі', className: 'live' };
    }
    
    if (now < startTime) {
      
      const diffMs = startTime - now;
      const diffMins = Math.round(diffMs / 60000);
      
      if (diffMins < 60) {
        return { text: `Почнеться через ${diffMins} хв`, className: 'scheduled' };
      } else {
        const diffHours = Math.round(diffMs / 3600000);
        if (diffHours < 24) {
          return { text: `Почнеться через ${diffHours} год`, className: 'scheduled' };
        } else {
          return { text: 'Заплановано', className: 'scheduled' };
        }
      }
    }
    
    return { text: 'Завершено', className: 'ended' };
  };

  const getStatusIcon = (statusClassName) => {
    switch (statusClassName) {
      case 'live':
        return <Video size={16} />;
      case 'scheduled':
        return <Calendar size={16} />;
      case 'ended':
        return <CheckCircle size={16} />;
      case 'canceled':
        return <X size={16} />;
      default:
        return <VideoOff size={16} />;
    }
  };

  const sortMeetings = (meetings) => {
    const now = new Date();
    
    return meetings.sort((a, b) => {
      const aTime = new Date(a.start_time);
      const bTime = new Date(b.start_time);
      
      if (a.is_active && !b.is_active) return -1;
      if (!a.is_active && b.is_active) return 1;
      
      if (aTime > now && bTime > now) return aTime - bTime;
      
      if (aTime > now && bTime <= now) return -1;
      if (aTime <= now && bTime > now) return 1;
      
      return bTime - aTime;
    });
  };

  const getMeetingCardClass = (meeting) => {
    if (meeting.status === 'canceled') return 'canceled';
    if (meeting.is_active) return 'live';
    
    const now = new Date();
    const startTime = new Date(meeting.start_time);
    const endTime = new Date(meeting.end_time);
    
    if (now < startTime) return 'scheduled';
    if (now > endTime) return 'ended';
    
    return 'live';
  };

  const getFilterText = () => {
    switch (filter) {
      case 'upcoming':
        return 'Заплановані зустрічі';
      case 'active':
        return 'Активні зустрічі';
      case 'past':
        return 'Завершені зустрічі';
      case 'canceled':
        return 'Скасовані зустрічі';
      default:
        return 'Усі Zoom зустрічі';
    }
  };

  return (
    <div className="teacher-zoom-page">
      <TeacherHeader />
      <div className="teacher-zoom-container">
        <TeacherSidebar />
        
        <div className="teacher-zoom-content">
          {/* Заголовок сторінки */}
          <div className="teacher-zoom-header">
            <div className="teacher-zoom-title">
              <h1>
                <Video className="title-icon" />
                Управління Zoom зустрічами
              </h1>
              <p>Створюйте та керуйте відеоконференціями для ваших курсів</p>
            </div>
            
            {!showCreateForm && (
              <button className="create-meeting-button" onClick={handleCreateMeeting}>
                <Plus size={16} />
                Створити нову зустріч
              </button>
            )}
          </div>
          
          {/* Форма створення або список зустрічей */}
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
              {/* Фільтри для зустрічей */}
              <div className="teacher-zoom-filters">
                <div className="filters-row">
                  {/* Фільтр за курсом */}
                  <div className="course-filter">
                    <label htmlFor="course-select">
                      <Filter size={16} />
                      Курс:
                    </label>
                    <select 
                      id="course-select" 
                      value={selectedCourseId}
                      onChange={(e) => setSelectedCourseId(e.target.value)}
                      disabled={loadingCourses}
                    >
                      <option value="all">Всі курси</option>
                      {courses.map(course => (
                        <option key={course.id} value={course.id}>{course.title}</option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Фільтр за статусом */}
                  <div className="status-filter">
                    <label htmlFor="status-select">Статус:</label>
                    <select 
                      id="status-select" 
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                    >
                      <option value="all">Всі зустрічі</option>
                      <option value="active">Активні</option>
                      <option value="upcoming">Заплановані</option>
                      <option value="past">Завершені</option>
                      <option value="canceled">Скасовані</option>
                    </select>
                  </div>
                  
                  {/* Пошук зустрічей */}
                  <div className="search-filter">
                    <Search size={16} />
                    <input 
                      type="text"
                      placeholder="Пошук зустрічей..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      aria-label="Пошук зустрічей"
                    />
                  </div>
                </div>
              </div>
              
              {/* Відображення зустрічей або станів завантаження/помилок */}
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
                  {searchQuery ? (
                    <>
                      <Search size={48} />
                      <h3>Зустрічей не знайдено</h3>
                      <p>
                        Не знайдено зустрічей, що відповідають запиту "{searchQuery}".
                        Спробуйте змінити критерії пошуку.
                      </p>
                    </>
                  ) : filter !== 'all' ? (
                    <>
                      <CalendarIcon size={48} />
                      <h3>Немає {filter === 'upcoming' ? 'запланованих' : 
                            filter === 'active' ? 'активних' : 
                            filter === 'past' ? 'завершених' : 'скасованих'} зустрічей</h3>
                      <p>
                        Змініть фільтр або створіть нову зустріч.
                      </p>
                    </>
                  ) : (
                    <>
                      <Video size={48} />
                      <h3>Немає зустрічей</h3>
                      <p>
                        У вас ще немає створених Zoom зустрічей. Створіть свою першу зустріч!
                      </p>
                    </>
                  )}
                  <button className="create-first-meeting" onClick={handleCreateMeeting}>
                    <Plus size={16} />
                    Створити зустріч
                  </button>
                </div>
              ) : (
                <>
                  {/* Заголовок результатів */}
                  <h2 className="filtered-results-title">
                    {getFilterText()}
                    {searchQuery && <span> за запитом "{searchQuery}"</span>}
                    <span className="results-count"> ({getFilteredMeetings().length})</span>
                  </h2>

                  {/* Сітка зустрічей */}
                  <div className="meetings-grid">
                    {sortMeetings(getFilteredMeetings()).map(meeting => {
                      const status = getMeetingStatus(meeting);
                      const cardClass = getMeetingCardClass(meeting);
                      
                      return (
                        <div key={meeting.id} className={`meeting-card ${cardClass}`}>
                          <div className={`meeting-status ${status.className}`}>
                            {getStatusIcon(status.className)}
                            <span>{status.text}</span>
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
                              aria-label="Переглянути деталі зустрічі"
                              title="Переглянути деталі"
                            >
                              <Eye size={14} />
                              Деталі
                            </button>
                            
                            <button 
                              className="btn-edit"
                              onClick={() => navigate(`/teacher/zoom/edit/${meeting.id}`)}
                              aria-label="Редагувати зустріч"
                              title="Редагувати зустріч"
                            >
                              <Edit size={14} />
                              Редагувати
                            </button>
                            
                            <button 
                              className="btn-delete"
                              onClick={() => handleDeleteMeeting(meeting.id)}
                              aria-label="Видалити зустріч"
                              title="Видалити зустріч"
                            >
                              <Trash size={14} />
                              Видалити
                            </button>
                            
                            {meeting.can_join && (
                              <button 
                                className="btn-join"
                                onClick={() => handleSelectMeeting(meeting)}
                                aria-label="Приєднатися до зустрічі"
                                title="Приєднатися зараз"
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
                </>
              )}
            </>
          )}
        </div>
      </div>
      
      {/* Модальні вікна */}
      {selectedMeeting && (
        <ZoomModal
          meetingId={selectedMeeting.id}
          onClose={handleCloseModal}
        />
      )}
      
      {/* Діалог підтвердження видалення */}
      {deleteConfirmation && (
        <div className="delete-confirmation-overlay">
          <div className="delete-confirmation-modal">
            <AlertTriangle size={32} className="delete-icon" />
            <h3>Підтвердіть видалення</h3>
            <p>Ви впевнені, що хочете видалити цю Zoom зустріч?</p>
            <p className="delete-warning">Це призведе до скасування зустрічі для всіх учасників.</p>
            <div className="delete-actions">
              <button className="btn-cancel" onClick={cancelDelete}>
                Скасувати
              </button>
              <button className="btn-confirm-delete" onClick={() => confirmDelete(deleteConfirmation)}>
                Видалити
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Інформаційний банер, коли немає курсів */}
      {!loading && courses.length === 0 && (
        <div className="info-banner">
          <Info size={20} />
          <div className="info-content">
            <p>Ви не можете створювати Zoom зустрічі без курсів.</p>
            <button 
              className="create-course-btn"
              onClick={() => navigate('/teacher/courses/create')}
            >
              Створити курс
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default TeacherZoomMeetings;