// src/components/teacher/TeacherZoomMeetings.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TeacherSidebar from './TeacherSidebar';
import TeacherHeader from './TeacherHeader';
import '../../css/teacher/TeacherZoomMeetings.css';
import zoomApi from '../../api/zoomApi';
import ZoomMeetingsList from '../zoom/ZoomMeetingsList';
import ZoomModal from '../zoom/ZoomModal';
import CreateZoomMeeting from '../zoom/CreateZoomMeeting';
import { Video, Plus, Filter, Search, Calendar } from 'lucide-react';

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

  useEffect(() => {
    // Отримання списку курсів викладача
    const fetchTeacherCourses = async () => {
      try {
        await axios.get(`${API_URL}/get-csrf-token/`, { withCredentials: true });
        const userId = sessionStorage.getItem('userId');
        const response = await axios.get(`${API_URL}/teacher/${userId}/courses/`, {
          withCredentials: true
        });
        setCourses(response.data || []);
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
        setMeetings(response.data || []);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching zoom meetings:', err);
        setError('Не вдалося завантажити Zoom зустрічі. Будь ласка, спробуйте пізніше.');
        setLoading(false);
      }
    };

    fetchTeacherCourses();
    fetchAllMeetings();
  }, []);

  // Оновлення списку зустрічей при зміні фільтра курсу
  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        setLoading(true);
        await axios.get(`${API_URL}/get-csrf-token/`, { withCredentials: true });
        
        let url = `${API_URL}/zoom/meetings/`;
        if (selectedCourseId !== 'all') {
          url = `${API_URL}/zoom/course/${selectedCourseId}/meetings/`;
        }
        
        const response = await axios.get(url, {
          withCredentials: true
        });
        
        setMeetings(response.data || []);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching zoom meetings:', err);
        setError('Не вдалося завантажити Zoom зустрічі. Будь ласка, спробуйте пізніше.');
        setLoading(false);
      }
    };

    if (selectedCourseId) {
      fetchMeetings();
    }
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
    setShowCreateForm(true);
  };

  // Обробник успішного створення зустрічі
  const handleMeetingCreated = (newMeeting) => {
    setShowCreateForm(false);
    setMeetings(prev => [newMeeting, ...prev]);
  };

  // Обробник скасування створення зустрічі
  const handleCancelCreate = () => {
    setShowCreateForm(false);
  };

  // Обробник видалення зустрічі
  const handleDeleteMeeting = async (meetingId) => {
    if (window.confirm('Ви дійсно хочете видалити цю Zoom зустріч?')) {
      try {
        await zoomApi.deleteZoomMeeting(meetingId);
        setMeetings(prev => prev.filter(meeting => meeting.id !== meetingId));
      } catch (err) {
        console.error('Error deleting meeting:', err);
        alert('Не вдалося видалити зустріч. Будь ласка, спробуйте пізніше.');
      }
    }
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
                courseId={selectedCourseId === 'all' ? (courses.length > 0 ? courses[0].id : null) : selectedCourseId}
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
              
              <div className="teacher-zoom-meetings-list">
                {getFilteredMeetings().length === 0 ? (
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
                    {getFilteredMeetings().map(meeting => (
                      <div key={meeting.id} className="meeting-card">
                        <div className={`meeting-status ${meeting.status}`}>
                          {meeting.status === 'scheduled' && 'Заплановано'}
                          {meeting.status === 'live' && 'В процесі'}
                          {meeting.status === 'ended' && 'Завершено'}
                          {meeting.status === 'canceled' && 'Скасовано'}
                        </div>
                        
                        <h3 className="meeting-title">{meeting.topic}</h3>
                        
                        <div className="meeting-info">
                          <div className="info-item">
                            <Calendar size={14} />
                            <span>{new Date(meeting.start_time).toLocaleDateString('uk-UA')}</span>
                          </div>
                          <div className="info-item">
                            <Clock size={14} />
                            <span>
                              {new Date(meeting.start_time).toLocaleTimeString('uk-UA', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                          <div className="info-item">
                            <Book size={14} />
                            <span>{meeting.course_data?.title}</span>
                          </div>
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
                    ))}
                  </div>
                )}
              </div>
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