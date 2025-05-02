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
  Download,
  FileType,
  Video,
  Newspaper,
  Info,
  List
} from 'lucide-react';
import API_URL from '../api';
import '../css/WorkingWithCourse.css';
import '../css/QuickNote.css';
import '../css/MaterialsDisplay.css'; // Додаємо новий файл стилів
import NotesPanel from './NotesPanel';
import QuickNote from './QuickNote';
import VideoPlayer from './VideoPlayer';

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
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedMaterial, setExpandedMaterial] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        await getCsrfToken();
        const [materialsResponse, modulesResponse] = await Promise.all([
          axios.get(`${API_URL}/materials/?course=${course.id}`, { withCredentials: true }),
          axios.get(`${API_URL}/modules/get_modules/${course.id}/`, { withCredentials: true })
        ]);
        setMaterials(materialsResponse.data || []);
        setModules(modulesResponse.data || []);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching lessons tab data:", error);
        setError("Не вдалося завантажити дані курсу. Будь ласка, спробуйте пізніше.");
        setLoading(false);
      }
    };
    if (course) fetchData();
  }, [course, getCsrfToken]);

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
    setSelectedFile(null);
    try {
      await getCsrfToken();
      const [detailsResponse, filesResponse, linksResponse] = await Promise.all([
        axios.get(`${API_URL}/lessons/${lesson.id}/`, { withCredentials: true }),
        axios.get(`${API_URL}/lessons/${lesson.id}/files/`, { withCredentials: true }),
        axios.get(`${API_URL}/lessons/${lesson.id}/links/`, { withCredentials: true })
      ]);
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
      await axios.post(`${API_URL}/progress/lessons/${selectedLesson.id}/complete/`, {}, {
        withCredentials: true
      });
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
    } catch (error) {
      console.error("Error marking lesson as completed:", error);
    } finally {
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

  const truncateUrl = (url, maxLength = 40) => {
    if (!url) return "Посилання";
    if (url.length <= maxLength) return url;
    return url.substring(0, maxLength - 3) + '...';
  };

  const getFileIcon = (fileType) => {
    if (!fileType) return <File className="course-wc-file-icon" />;
    const type = fileType.toLowerCase();
    if (type.includes('pdf')) return <FileText className="course-wc-file-icon" />;
    if (type.includes('doc')) return <Newspaper className="course-wc-file-icon" />;
    if (type.includes('vid') || type.includes('mp4')) return <Video className="course-wc-file-icon" />;
    if (type.includes('xls') || type.includes('sheet')) return <FileType className="course-wc-file-icon" />;
    return <Paperclip className="course-wc-file-icon" />;
  };

  const isVideoFile = (fileType, fileUrl) => {
    if (!fileType && !fileUrl) return false;
    if (fileType) {
      const type = fileType.toLowerCase();
      if (type.includes('video') || type.includes('mp4') || type.includes('webm')) return true;
    }
    if (fileUrl) {
      const url = fileUrl.toLowerCase();
      if (url.endsWith('.mp4') || url.endsWith('.webm') || url.endsWith('.avi') || url.endsWith('.mov') ||
          url.includes('youtube.com') || url.includes('youtu.be')) {
        return true;
      }
    }
    return false;
  };

  const isPdfFile = (fileType, fileUrl) => {
    if (!fileType && !fileUrl) return false;
    if (fileType) {
      const type = fileType.toLowerCase();
      if (type.includes('pdf')) return true;
    }
    if (fileUrl) {
      const url = fileUrl.toLowerCase();
      if (url.endsWith('.pdf')) return true;
    }
    return false;
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

  const handleFileClick = (file) => {
    setSelectedFile(file);
  };

  const toggleMaterialExpand = (materialId) => {
    if (expandedMaterial === materialId) {
      setExpandedMaterial(null);
    } else {
      setExpandedMaterial(materialId);
    }
  };

  const openNotesPanel = () => {
    setIsNotesPanelOpen(true);
    setIsQuickNoteOpen(false);
  };

  const closeNotesPanel = () => {
    setIsNotesPanelOpen(false);
  };

  const toggleQuickNote = () => {
    setIsQuickNoteOpen(!isQuickNoteOpen);
  };

  const handleQuickNoteSaved = (note) => {
    console.log("Нотатка збережена:", note);
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 B";
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return (bytes / Math.pow(1024, i)).toFixed(2) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="course-wc-loading-spinner">
        <div className="course-wc-spinner"></div>
        <p>Завантаження матеріалів курсу...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="course-wc-error-container">
        <div className="course-wc-error-icon">!</div>
        <h3>Помилка завантаження</h3>
        <p>{error}</p>
        <button className="course-wc-btn-primary" onClick={() => window.location.reload()}>
          Спробувати знову
        </button>
      </div>
    );
  }

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
          {materials.length > 0 && (
            <div className="course-wc-materials-section">
              <h3 className="course-wc-section-title">
                <Paperclip className="course-wc-section-icon" />
                Загальні матеріали курсу
              </h3>
              <div className="materials-grid">
                {materials.map((material) => (
                  <div 
                    key={material.id} 
                    className={`material-card ${expandedMaterial === material.id ? 'expanded' : ''}`}
                  >
                    <div 
                      className="material-header" 
                      onClick={() => toggleMaterialExpand(material.id)}
                    >
                      <div className="material-title-container">
                        <Info className="material-icon" />
                        <h4 className="material-title">{material.title}</h4>
                      </div>
                      <button className="material-expand-button">
                        {expandedMaterial === material.id ? 
                          <ChevronUp className="material-expand-icon" /> : 
                          <ChevronDown className="material-expand-icon" />
                        }
                      </button>
                    </div>
                    
                    {expandedMaterial === material.id && (
                      <div className="material-content">
                        {material.description && (
                          <div className="material-description">
                            <h5 className="material-section-title">Опис</h5>
                            <p>{material.description}</p>
                          </div>
                        )}
                        
                        {material.files?.length > 0 && (
                          <div className="material-files">
                            <h5 className="material-section-title">
                              <List className="material-section-icon" /> 
                              Файли ({material.files.length})
                            </h5>
                            <div className="material-files-list">
                              {material.files.map((file) => {
                                const fileName = file.file_name || getFilenameFromUrl(file.file_url);
                                const isVideo = isVideoFile(file.file_type, file.file_url);
                                const isPdf = isPdfFile(file.file_type, file.file_url);
                                
                                return (
                                  <div 
                                    key={file.id} 
                                    className={`material-file-item ${isVideo ? 'video-file' : ''} ${isPdf ? 'pdf-file' : ''}`}
                                  >
                                    <div className="material-file-info">
                                      {getFileIcon(file.file_type)}
                                      <div className="material-file-details">
                                        <span className="material-file-name" title={fileName}>
                                          {fileName}
                                        </span>
                                        <span className="material-file-meta">
                                          {file.file_type?.toUpperCase() || 'ФАЙЛ'} • {formatFileSize(file.file_size)}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="material-file-actions">
                                        <a
                                        href={file.file_url}
                                        download
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                        className="material-download-button"
                                        title="Завантажити файл"
                                      >
                                        <Download size={16} />
                                        <span>Завантажити</span>
                                      </a>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
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
              onClick={() => {
                setSelectedLesson(null);
                setSelectedFile(null);
              }}
            >
              <ChevronDown className="course-wc-back-icon" /> Назад до модулів
            </button>
            <h2 className="course-wc-lesson-title">{selectedLesson.title}</h2>

            <div className="course-wc-lesson-actions">
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

              {selectedFile && (
                <div className="course-wc-selected-file-container">
                  <div className="course-wc-selected-file-header">
                    <button
                      className="course-wc-back-button"
                      onClick={() => setSelectedFile(null)}
                    >
                      <ChevronDown className="course-wc-back-icon" /> Назад до файлів
                    </button>
                  </div>
                  <VideoPlayer
                    fileUrl={selectedFile.file_url}
                    fileType={selectedFile.file_type}
                    fileName={selectedFile.file_name || getFilenameFromUrl(selectedFile.file_url)}
                  />
                </div>
              )}

              {!selectedFile && selectedLesson.files?.length > 0 && (
                <div className="course-wc-lesson-resources">
                  <h3>Матеріали заняття</h3>
                  <div className="course-wc-files-list">
                    {selectedLesson.files.map((file) => {
                      const fileName = file.file_name || getFilenameFromUrl(file.file_url);
                      const isVideo = isVideoFile(file.file_type, file.file_url);
                      const isPdf = isPdfFile(file.file_type, file.file_url);
                      return (
                        <div
                          key={file.id}
                          className={`course-wc-file-item ${isVideo ? 'video-file' : ''} ${isPdf ? 'pdf-file' : ''}`}
                          onClick={isVideo || isPdf ? () => handleFileClick(file) : undefined}
                        >
                          {getFileIcon(file.file_type)}
                          <div className="course-wc-file-info">
                            <span className="course-wc-file-name" title={fileName}>
                              {fileName}
                            </span>
                            <span className="course-wc-file-type">
                              {file.file_type?.toUpperCase() || 'FILE'} •{' '}
                              {((file.file_size || 0) / 1024 / 1024).toFixed(2)} MB
                            </span>
                          </div>
                          {(isVideo || isPdf) ? (
                            <button className="course-wc-view-btn">
                              <Play size={16} /> Переглянути
                            </button>
                          ) : (
                            <a
                              href={file.file_url}
                              download
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="course-wc-download-btn"
                            >
                              <Download size={16} />
                            </a>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {!selectedFile && selectedLesson.links?.length > 0 && (
                <div className="course-wc-lesson-links">
                  <h3>Додаткові ресурси</h3>
                  <div className="course-wc-links-list">
                    {selectedLesson.links.map((link) => {
                      const isYoutubeLink = link.link_url?.includes('youtube.com') || link.link_url?.includes('youtu.be');
                      const displayUrl = truncateUrl(link.link_url);
                      return (
                        <div
                          key={link.id}
                          className={`course-wc-link-item ${isYoutubeLink ? 'youtube-link' : ''}`}
                          onClick={isYoutubeLink ? () => handleFileClick({
                            file_url: link.link_url,
                            file_type: 'video/youtube',
                            file_name: link.description || 'Відео з YouTube'
                          }) : undefined}
                        >
                          {isYoutubeLink ? (
                            <PlayCircle className="course-wc-link-icon" />
                          ) : (
                            <ExternalLink className="course-wc-link-icon" />
                          )}
                          <div className="course-wc-link-info">
                            <span className="course-wc-link-title">
                              {link.description || 'Додатковий ресурс'}
                            </span>
                            <span className="course-wc-link-url" title={link.link_url}>
                              {displayUrl}
                            </span>
                          </div>
                          {isYoutubeLink ? (
                            <button className="course-wc-view-btn">
                              <Play size={16} /> Переглянути
                            </button>
                          ) : (
                            <a
                              href={link.link_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="course-wc-external-link-btn"
                            >
                              <ExternalLink size={16} />
                            </a>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <NotesPanel
        lessonId={selectedLesson?.id}
        courseId={course?.id}
        isOpen={isNotesPanelOpen}
        onClose={closeNotesPanel}
      />

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