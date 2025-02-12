import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Sidebar, Menu, MenuItem } from 'react-pro-sidebar';
import { FileText, Book, ClipboardList, Edit3, Star, MessageCircle, ChevronDown, ChevronUp } from 'lucide-react';
import API_URL from '../api';
import '../css/WorkingWithCourse.css';

function WorkingWithCourse() {
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [activeTab, setActiveTab] = useState('description');
  const [expandedModules, setExpandedModules] = useState({});
  const [selectedLesson, setSelectedLesson] = useState(null);
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
      axios.get(`${API_URL}/modules/get_modules/${courseId}/`)
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
      axios.get(`${API_URL}/lessons/get_lessons/${moduleId}/`)
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

  const handleLessonClick = (moduleId, lesson) => {
    setSelectedLesson(lesson);
    navigate(`/courses/${courseId}/modules/${moduleId}/lessons/${lesson.id}`);
  };

  if (!course) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="course-detail-container">
      <Sidebar className="course-sidebar">
        <div className="sidebar-header">
        <img src={course.image_url} alt={course.title} className="course-image" />
        <h4 >{course.title}</h4>
        </div>
        <Menu>
          <MenuItem icon={<FileText />} onClick={() => setActiveTab('description')}>Опис курсу</MenuItem>
          <MenuItem icon={<Book />} onClick={() => setActiveTab('lessons')}>Заняття</MenuItem>
          <MenuItem icon={<ClipboardList />} onClick={() => setActiveTab('assignments')}>Завдання</MenuItem>
          <MenuItem icon={<Edit3 />} onClick={() => setActiveTab('tests')}>Тестування</MenuItem>
          <MenuItem icon={<Star />} onClick={() => setActiveTab('grades')}>Оцінки</MenuItem>
          {course.isTeacher && (
            <MenuItem icon={<ClipboardList />} onClick={() => setActiveTab('check-assignments')}>Перевірка завдань</MenuItem>
          )}
          <MenuItem icon={<MessageCircle />} onClick={() => setActiveTab('general-chat')}>Загальний чат</MenuItem>
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
                      <li key={lesson.id} onClick={() => handleLessonClick(module.id, lesson)} className="lesson-item">
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
        {activeTab === 'check-assignments' && course.isTeacher && <div>Тут буде інтерфейс для перевірки завдань</div>}
        {activeTab === 'general-chat' && <div>Тут буде загальний чат курсу</div>}
      </div>

      {selectedLesson && (
        <div className="lesson-content">
          <h3>{selectedLesson.title}</h3>
          {selectedLesson.file_type === 'url' && (
            <iframe
              width="560"
              height="315"
              src={selectedLesson.file_url}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          )}
          <p>{selectedLesson.content}</p>
        </div>
      )}
    </div>
  );
}

export default WorkingWithCourse;