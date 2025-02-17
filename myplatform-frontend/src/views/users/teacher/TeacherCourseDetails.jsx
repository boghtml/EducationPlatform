import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Sidebar, Menu, MenuItem } from 'react-pro-sidebar';
import { FileText, Book, ClipboardList, Edit3, Star, MessageCircle, ChevronDown, ChevronUp, Trash2, PlusCircle } from 'lucide-react';
import API_URL from '../../../api';
import Cookies from 'js-cookie';


function TeacherCoursePage() {
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [activeTab, setActiveTab] = useState('description');
  const [expandedModules, setExpandedModules] = useState({});
  const { courseId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`${API_URL}/courses/${courseId}/`)
      .then(response => {
        setCourse(response.data);
      })
      .catch(error => {
        console.error("Error fetching course:", error);
      });
  }, [courseId]);

  useEffect(() => {
    if (activeTab === 'lessons') {
    const sessionId = Cookies.get('sessionid'); 
        
      axios.get(`${API_URL}/modules/get_modules/${courseId}/`,{
        headers: {
            'Cookie': `sessionid=${sessionId}`
          },
          withCredentials: true 
  
      })
        .then(response => {
          setModules(response.data);
        })
        .catch(error => {
          console.error("Error fetching modules:", error);
        });
    }
  }, [activeTab, courseId]);

  const fetchLessons = (moduleId) => {
    if (!expandedModules[moduleId]) {
        const sessionId = Cookies.get('sessionid'); 

      axios.get(`${API_URL}/lessons/get_lessons/${moduleId}/`,{
        headers: {
            'Cookie': `sessionid=${sessionId}`
          },
          withCredentials: true 
      })
        .then(response => {
          const updatedModules = modules.map((module) =>
            module.id === moduleId ? { ...module, lessons: response.data } : module
          );
          setModules(updatedModules);
          setExpandedModules({ ...expandedModules, [moduleId]: true });
        })
        .catch(error => {
          console.error("Error fetching lessons:", error);
        });
    } else {
      setExpandedModules({ ...expandedModules, [moduleId]: !expandedModules[moduleId] });
    }
  };

  const handleDeleteCourse = () => {
    if (window.confirm("Ви впевнені, що хочете видалити цей курс?")) {
      axios.delete(`${API_URL}/courses/${courseId}/`)
        .then(() => {
          navigate('/dashboard-teacher');
        })
        .catch(error => {
          console.error("Error deleting course:", error);
        });
    }
  };

  if (!course) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="course-detail-container">
      <Sidebar className="course-sidebar">
        <div className="sidebar-header">
          <img src={course.image_url} alt={course.title} className="course-image" />
          <h4>{course.title}</h4>
        </div>
        <Menu>
          <MenuItem icon={<FileText />} onClick={() => setActiveTab('description')}>Опис курсу</MenuItem>
          <MenuItem icon={<Book />} onClick={() => setActiveTab('lessons')}>Модулі та заняття</MenuItem>
          <MenuItem icon={<ClipboardList />} onClick={() => setActiveTab('assignments')}>Завдання</MenuItem>
          <MenuItem icon={<Edit3 />} onClick={() => setActiveTab('tests')}>Тестування</MenuItem>
          <MenuItem icon={<Star />} onClick={() => setActiveTab('grades')}>Оцінки</MenuItem>
          <MenuItem icon={<MessageCircle />} onClick={() => setActiveTab('general-chat')}>Загальний чат</MenuItem>
          <MenuItem icon={<Trash2 />} onClick={handleDeleteCourse}>Видалити курс</MenuItem>
        </Menu>
      </Sidebar>

      <div className="course-content">
        {activeTab === 'description' && (
          <div className="course-description">
            <h1>{course.title}</h1>
            <p>{course.description}</p>
          </div>
        )}

        {activeTab === 'lessons' && (
          <div className="modules-list">
            <h2>Модулі та заняття</h2>
            <button className="add-module-button" onClick={() => navigate(`/courses/${courseId}/add-module`)}>
              <PlusCircle /> Додати модуль
            </button>
            {modules.map((module) => (
              <div key={module.id} className="module">
                <div className="module-header" onClick={() => fetchLessons(module.id)}>
                  <h3>{module.title}</h3>
                  {expandedModules[module.id] ? <ChevronUp /> : <ChevronDown />}
                </div>
                <p className="module-description">{module.description}</p>
                {expandedModules[module.id] && module.lessons && (
                  <ul className="lessons-list">
                    {module.lessons.map((lesson) => (
                      <li key={lesson.id} className="lesson-item">
                        {lesson.title}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'assignments' && <div>Тут будуть завдання</div>}
        {activeTab === 'tests' && <div>Тут будуть тести</div>}
        {activeTab === 'grades' && <div>Тут будуть оцінки</div>}
        {activeTab === 'general-chat' && <div>Тут буде загальний чат курсу</div>}
      </div>
    </div>
  );
}

export default TeacherCoursePage;
