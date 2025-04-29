import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  FileText,
  Book,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Play,
  Clock,
  Paperclip,
  PlayCircle,
  File,
  ExternalLink,
  Award,
  BookOpen,
  Pencil,
  Plus
} from 'lucide-react';
import API_URL from '../api';
import '../css/WorkingWithCourse.css';
import '../css/QuickNote.css';
import NotesPanel from './NotesPanel';
import QuickNote from './QuickNote';

function LessonsTab() {
  const { course, courseProgress, getCsrfToken } = useOutletContext();
  const [modules, setModules] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [expandedModules, setExpandedModules] = useState({});
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [completingLesson, setCompletingLesson] = useState(false);
  const [isNotesPanelOpen, setIsNotesPanelOpen] = useState(false);
  const [isQuickNoteOpen, setIsQuickNoteOpen] = useState(false);
  const [showQuickNoteButton, setShowQuickNoteButton] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        await getCsrfToken();
        const materialsResponse = await axios.get(`${API_URL}/materials/?course=${course.id}`);
        setMaterials(materialsResponse.data || []);
        const modulesResponse = await axios.get(`${API_URL}/modules/get_modules/${course.id}/`, { withCredentials: true });
        setModules(modulesResponse.data || []);
      } catch (error) {
        console.error("Error fetching lessons tab data:", error);
      }
    };
    if (course) fetchData();
  }, [course, getCsrfToken]);

  // Показувати кнопку швидкого створення нотаток тільки тоді, коли урок вибрано
  useEffect(() => {
    setShowQuickNoteButton(!!selectedLesson);
  }, [selectedLesson]);

  const fetchLessons = async (moduleId) => {
    if (expandedModules[moduleId]) {
      setExpandedModules((prev) => ({ ...prev, [moduleId]: !prev[moduleId] }));
      return;
    }
    try {
      await getCsrfToken();
      const response = await axios.get(`${API_URL}/lessons/get_lessons/${moduleId}/`, { withCredentials: true });
      if (response.data) {
        setModules((prevModules) =>
          prevModules.map((module) =>
            module.id === moduleId ? { ...module, lessons: response.data } : module
          )
        );
        setExpandedModules((prev) => ({ ...prev, [moduleId]: true }));
      }
    } catch (error) {
      console.error("Error fetching lessons:", error);
      setModules((prevModules) =>
        prevModules.map((module) =>
          module.id === moduleId ? { ...module, error: "Не вдалося завантажити заняття. Спробуйте знову." } : module
        )
      );
    }
  };

  const handleLessonClick = async (moduleId, lesson) => {
    setSelectedLesson(null);
    try {
      await getCsrfToken();
      const detailsResponse = await axios.get(`${API_URL}/lessons/${lesson.id}/`, { withCredentials: true });
      const filesResponse = await axios.get(`${API_URL}/lessons/${lesson.id}/files/`, { withCredentials: true });
      const linksResponse = await axios.get(`${API_URL}/lessons/${lesson.id}/links/`, { withCredentials: true });
      setSelectedLesson({
        ...detailsResponse.data,
        files: filesResponse.data || [],
        links: linksResponse.data || [],
      });
    } catch (error) {
      console.error("Error fetching lesson details:", error);
      setSelectedLesson({ ...lesson, error: "Не вдалося завантажити деталі уроку. Спробуйте знову." });
    }
  };

  const markLessonAsCompleted = async () => {
    if (!selectedLesson) return;
    setCompletingLesson(true);
    try {
      await getCsrfToken();
      await axios.post(`${API_URL}/progress/lessons/${selectedLesson.id}/complete/`, {}, { withCredentials: true });
      setSelectedLesson((prev) => ({ ...prev, is_completed: true }));
      setModules((prevModules) =>
        prevModules.map((module) => {
          if (!module.lessons) return module;
          return {
            ...module,
            lessons: module.lessons.map((lesson) =>
              lesson.id === selectedLesson.id ? { ...lesson, is_completed: true } : lesson
            ),
          };
        })
      );
      setCompletingLesson(false);
    } catch (error) {
      console.error("Error marking lesson as completed:", error);
      setCompletingLesson(false);
    }
  };

  const formatDuration = (minutes) => {
    if (!minutes) return "N/A";
    if (minutes < 60) return `${minutes} хв`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes === 0 ? `${hours} год` : `${hours} год ${remainingMinutes} хв`;
  };

  const getFilenameFromUrl = (url) => {
    if (!url) return "Файл";
    try {
      const decodedUrl = decodeURIComponent(url);
      return decodedUrl.split('/').pop();
    } catch (e) {
      return url.split('/').pop();
    }
  };

  const getFileIcon = (fileType) => {
    if (!fileType) return <File className="course-wc-file-icon" />;
    const type = fileType.toLowerCase();
    if (type.includes('pdf')) return <FileText className="course-wc-file-icon" />;
    if (type.includes('doc')) return <FileText className="course-wc-file-icon" />;
    if (type.includes('vid') || type.includes('mp4')) return <PlayCircle className="course-wc-file-icon" />;
    if (type.includes('xls') || type.includes('sheet')) return <FileText className="course-wc-file-icon" />;
    return <Paperclip className="course-wc-file-icon" />;
  };

  const isLessonCompleted = (lessonId) => {
    if (selectedLesson && selectedLesson.id === lessonId) return selectedLesson.is_completed;
    for (const module of modules) {
      if (!module.lessons) continue;
      const lesson = module.lessons.find((l) => l.id === lessonId);
      if (lesson && lesson.is_completed) return true;
    }
    return false;
  };

  // Функція для відкриття панелі нотаток
  const openNotesPanel = () => {
    setIsNotesPanelOpen(true);
    setIsQuickNoteOpen(false);
  };

  // Функція для закриття панелі нотаток
  const closeNotesPanel = () => {
    setIsNotesPanelOpen(false);
  };
  
  // Функція для відкриття швидкої нотатки
  const toggleQuickNote = () => {
    setIsQuickNoteOpen(!isQuickNoteOpen);
  };
  
  // Обробка збереження швидкої нотатки
  const handleQuickNoteSaved = (note) => {
    // Тут можна додати логіку оновлення списку нотаток або показати сповіщення
    console.log("Нотатка збережена:", note);
  };

  return (
    <div className="course-wc-lessons-tab">
      <div className="course-wc-content-header">
        <h2>Матеріали курсу</h2>
        <div className="course-wc-content-meta">
          <span><Book className="course-wc-meta-icon" /> {courseProgress.total_lessons} уроків</span>
          <span><Clock className="course-wc-meta-icon" /> {course.duration} тижнів</span>
          <span><Award className="course-wc-meta-icon" /> Сертифікат після завершення</span>
        </div>
      </div>

      {!selectedLesson ? (
        <div className="course-wc-lessons-content">
          {materials && materials.length > 0 && (
            <div className="course-wc-materials-section">
              <h3 className="course-wc-section-title">
                <Paperclip className="course-wc-section-icon" />
                Матеріали курсу
              </h3>
              <div className="course-wc-materials-list">
                {materials.map((material) => (
                  <div key={material.id} className="course-wc-material-card">
                    <div className="course-wc-material-header">
                      <h4>{material.title}</h4>
                    </div>
                    <p className="course-wc-material-description">{material.description}</p>
                    <div className="course-wc-material-files">
                      {material.files &&
                        material.files.map((file) => (
                          <a
                            key={file.id}
                            href={file.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="course-wc-file-item"
                          >
                            {getFileIcon(file.file_type)}
                            <div className="course-wc-file-info">
                              <span className="course-wc-file-name">
                                {file.file_name || getFilenameFromUrl(file.file_url)}
                              </span>
                              <span className="course-wc-file-type">
                                {file.file_type?.toUpperCase() || 'FILE'} •{' '}
                                {((file.file_size || 0) / 1024 / 1024).toFixed(2)} MB
                              </span>
                            </div>
                          </a>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="course-wc-modules-section">
            <h3 className="course-wc-section-title">
              <Book className="course-wc-section-icon" />
              Модулі та уроки
            </h3>
            <div className="course-wc-modules-list">
              {modules.length === 0 ? (
                <div className="course-wc-no-content-message">
                  <h3>Немає доступних модулів</h3>
                  <p>У цьому курсі поки що немає модулів. Перевірте пізніше або зв'яжіться з викладачем.</p>
                </div>
              ) : (
                modules.map((module) => (
                  <div key={module.id} className="course-wc-module">
                    <div
                      className="course-wc-module-header"
                      onClick={() => fetchLessons(module.id)}
                    >
                      <div className="course-wc-module-header-content">
                        <h3 className="course-wc-module-title">{module.title}</h3>
                        <div className="course-wc-module-info">
                          {module.error ? (
                            <span className="course-wc-error-message">{module.error}</span>
                          ) : (
                            <span className="course-wc-module-lessons-count">
                              {module.lessons ? `${module.lessons.length} занять` : 'Завантаження...'}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="course-wc-module-toggle">
                        {expandedModules[module.id] ? (
                          <ChevronUp className="course-wc-toggle-icon" />
                        ) : (
                          <ChevronDown className="course-wc-toggle-icon" />
                        )}
                      </div>
                    </div>

                    {expandedModules[module.id] && module.lessons && (
                      <ul className="course-wc-lessons-list">
                        {module.lessons.map((lesson) => (
                          <li
                            key={lesson.id}
                            className={`course-wc-lesson-item ${isLessonCompleted(lesson.id) ? 'completed' : ''}`}
                            onClick={() => handleLessonClick(module.id, lesson)}
                          >
                            <div className="course-wc-lesson-item-content">
                              <div className="course-wc-lesson-status">
                                {isLessonCompleted(lesson.id) ? (
                                  <CheckCircle className="course-wc-lesson-completed-icon" />
                                ) : (
                                  <Play className="course-wc-lesson-play-icon" />
                                )}
                              </div>
                              <div className="course-wc-lesson-details">
                                <h4 className="course-wc-lesson-title">{lesson.title}</h4>
                                <div className="course-wc-lesson-meta">
                                  <span className="course-wc-lesson-duration">
                                    <Clock className="course-wc-meta-icon" /> {formatDuration(lesson.duration)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="course-wc-lesson-view">
          <div className="course-wc-lesson-header">
            <button
              className="course-wc-back-button"
              onClick={() => setSelectedLesson(null)}
            >
              <ChevronDown className="course-wc-back-icon" /> Назад до модулів
            </button>
            <h2 className="course-wc-lesson-title">{selectedLesson.title}</h2>

            <div className="course-wc-lesson-actions">
              {/* Кнопка відкриття нотаток */}
              <button 
                className="course-wc-btn course-wc-btn-notes"
                onClick={openNotesPanel}
                title="Мої нотатки"
              >
                <BookOpen className="course-wc-button-icon" /> Нотатки
              </button>
              
              {selectedLesson.is_completed ? (
                <button className="course-wc-btn course-wc-btn-completed" disabled>
                  <CheckCircle className="course-wc-button-icon" /> Завершено
                </button>
              ) : (
                <button
                  className="course-wc-btn course-wc-btn-complete"
                  onClick={markLessonAsCompleted}
                  disabled={completingLesson}
                >
                  {completingLesson ? (
                    <>
                      <div className="course-wc-spinner-small"></div> Позначення як виконаного...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="course-wc-button-icon" /> Позначити як виконане
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
          <div className="course-wc-lesson-content">
            {selectedLesson.error && (
              <div className="course-wc-error-message">
                {selectedLesson.error}
              </div>
            )}

            <div className="course-wc-content-section">
              {selectedLesson.content && (
                <div className="course-wc-lesson-description">
                  <h3>Зміст заняття</h3>
                  <div className="course-wc-content-text">{selectedLesson.content}</div>
                </div>
              )}

              {selectedLesson.files && selectedLesson.files.length > 0 && (
                <div className="course-wc-lesson-resources">
                  <h3>Матеріали заняття</h3>
                  <div className="course-wc-files-list">
                    {selectedLesson.files.map((file) => (
                      <a
                        key={file.id}
                        href={file.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="course-wc-file-item"
                      >
                        {getFileIcon(file.file_type)}
                        <div className="course-wc-file-info">
                          <span className="course-wc-file-name">
                            {file.file_name || getFilenameFromUrl(file.file_url)}
                          </span>
                          <span className="course-wc-file-type">
                            {file.file_type?.toUpperCase() || 'FILE'} •{' '}
                            {((file.file_size || 0) / 1024 / 1024).toFixed(2)} MB
                          </span>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {selectedLesson.links && selectedLesson.links.length > 0 && (
                <div className="course-wc-lesson-links">
                  <h3>Додаткові ресурси</h3>
                  <div className="course-wc-links-list">
                    {selectedLesson.links.map((link) => (
                      <a
                        key={link.id}
                        href={link.link_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="course-wc-link-item"
                      >
                        <ExternalLink className="course-wc-link-icon" />
                        <div className="course-wc-link-info">
                          <span className="course-wc-link-title">
                            {link.description || 'Додатковий ресурс'}
                          </span>
                          <span className="course-wc-link-url">{link.link_url}</span>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Компонент панелі нотаток */}
      <NotesPanel 
        lessonId={selectedLesson?.id} 
        courseId={course?.id}
        isOpen={isNotesPanelOpen} 
        onClose={closeNotesPanel} 
      />
      
      {/* Кнопка для швидкого створення нотатки */}
      {showQuickNoteButton && (
        <>
          {isQuickNoteOpen ? (
            <QuickNote 
              lessonId={selectedLesson?.id}
              onClose={toggleQuickNote}
              onSaved={handleQuickNoteSaved}
            />
          ) : (
            <button 
              className="quick-note-button"
              onClick={toggleQuickNote}
              title="Швидка нотатка"
            >
              <Pencil size={24} />
            </button>
          )}
        </>
      )}
    </div>
  );
}

export default LessonsTab;