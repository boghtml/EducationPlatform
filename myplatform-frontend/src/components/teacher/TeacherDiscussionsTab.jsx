import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import TeacherSidebar from './TeacherSidebar';
import TeacherHeader from './TeacherHeader';
import '../../css/teacher/TeacherDiscussionsTab.css';
import ChatComponent from '../chat/ChatComponent';
import ZoomMeetingsList from '../zoom/ZoomMeetingsList';
import ZoomModal from '../zoom/ZoomModal';
import CreateZoomMeeting from '../zoom/CreateZoomMeeting';
import { Video, MessageCircle, Plus, AlertTriangle } from 'lucide-react';
import axios from 'axios';
import API_URL from '../../api';

function TeacherDiscussionsTab() {
  const { courseId } = useParams();
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' або 'zoom'
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [showCreateMeeting, setShowCreateMeeting] = useState(false);
  const [courses, setCourses] = useState([]);
  const [currentCourse, setCurrentCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    // Отримання списку курсів викладача для відображення у формі створення зустрічі
    const fetchTeacherCourses = async () => {
      try {
        setLoading(true);
        await axios.get(`${API_URL}/get-csrf-token/`, { withCredentials: true });
        const userId = sessionStorage.getItem('userId');
        const response = await axios.get(`${API_URL}/courses/`, {
          withCredentials: true,
          params: { teacher_id: userId }
        });
        setCourses(response.data || []);
        
        // Якщо вибраний courseId в URL, знаходимо його дані
        if (courseId) {
          const course = response.data.find(c => c.id === parseInt(courseId));
          if (course) {
            setCurrentCourse(course);
          }
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching teacher courses:', err);
        setError('Не вдалося завантажити дані курсів. Будь ласка, спробуйте пізніше.');
        setLoading(false);
      }
    };

    fetchTeacherCourses();
  }, [courseId]);
  
  // Обробник перемикання вкладок
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };
  
  // Обробник вибору Zoom зустрічі
  const handleSelectMeeting = (meeting) => {
    setSelectedMeeting(meeting);
  };
  
  // Обробник закриття модального вікна Zoom
  const handleCloseZoomModal = () => {
    setSelectedMeeting(null);
  };
  
  // Обробник відображення форми створення зустрічі
  const handleShowCreateForm = () => {
    setShowCreateMeeting(true);
  };
  
  // Обробник скасування створення зустрічі
  const handleCancelCreate = () => {
    setShowCreateMeeting(false);
  };
  
  // Обробник успішного створення зустрічі
  const handleMeetingCreated = (newMeeting) => {
    setShowCreateMeeting(false);
    // Перезавантажуємо сторінку для оновлення списку зустрічей
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="teacher-page">
        <TeacherHeader />
        <div className="teacher-container">
          <TeacherSidebar />
          <div className="teacher-content-loading">
            <div className="loading-spinner"></div>
            <p>Завантаження даних...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="teacher-page">
        <TeacherHeader />
        <div className="teacher-container">
          <TeacherSidebar />
          <div className="teacher-content-error">
            <AlertTriangle size={32} />
            <h3>Помилка завантаження</h3>
            <p>{error}</p>
            <button 
              className="retry-button"
              onClick={() => window.location.reload()}
            >
              Спробувати знову
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="teacher-page">
      <TeacherHeader />
      <div className="teacher-container">
        <TeacherSidebar />
        
        <div className="teacher-discussions-content">
          <div className="teacher-discussions-header">
            <div className="discussions-header-content">
              <h1>Обговорення {currentCourse ? `курсу "${currentCourse.title}"` : ''}</h1>
              <p>Спілкуйтеся зі студентами в чаті або організовуйте відеоконференції Zoom</p>
              
              {activeTab === 'zoom' && !showCreateMeeting && (
                <button className="create-meeting-btn" onClick={handleShowCreateForm}>
                  <Plus size={16} />
                  Створити Zoom зустріч
                </button>
              )}
            </div>
            
            {/* Перемикач вкладок Чат/Zoom */}
            <div className="discussions-tabs">
              <button 
                className={`discussions-tab-btn ${activeTab === 'chat' ? 'active' : ''}`} 
                onClick={() => handleTabChange('chat')}
              >
                <MessageCircle size={18} />
                <span>Чат</span>
              </button>
              <button 
                className={`discussions-tab-btn ${activeTab === 'zoom' ? 'active' : ''}`} 
                onClick={() => handleTabChange('zoom')}
              >
                <Video size={18} />
                <span>Відеоконференції</span>
              </button>
            </div>
          </div>
          
          {/* Вкладка з чатом */}
          {activeTab === 'chat' && (
            <div className="discussions-chat-container">
              <ChatComponent courseId={courseId} />
            </div>
          )}
          
          {/* Вкладка з Zoom зустрічами */}
          {activeTab === 'zoom' && !showCreateMeeting && (
            <div className="discussions-zoom-container">
              <ZoomMeetingsList
                courseId={courseId || (currentCourse ? currentCourse.id : null)}
                onSelectMeeting={handleSelectMeeting}
              />
            </div>
          )}
          
          {/* Форма створення Zoom зустрічі */}
          {activeTab === 'zoom' && showCreateMeeting && (
            <div className="discussions-create-meeting-container">
              <CreateZoomMeeting
                courseId={courseId || (currentCourse ? currentCourse.id : (courses.length > 0 ? courses[0].id : null))}
                onCreated={handleMeetingCreated}
                onCancel={handleCancelCreate}
              />
            </div>
          )}
          
          {/* Модальне вікно для Zoom зустрічі */}
          {selectedMeeting && (
            <ZoomModal
              meetingId={selectedMeeting.id}
              onClose={handleCloseZoomModal}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default TeacherDiscussionsTab;