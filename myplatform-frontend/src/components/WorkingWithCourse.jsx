import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  FileText, 
  Book, 
  ClipboardList, 
  Edit3, 
  Star, 
  MessageCircle, 
  ChevronDown, 
  ChevronUp,
  CheckCircle,
  Clock,
  Calendar,
  Award,
  Lock,
  GitHub,
  ExternalLink,
  Play,
  PlayCircle,
  Download,
  Users,
  HelpCircle,
  File,
  Paperclip,
  Search
} from 'lucide-react';
import API_URL from '../api';
import '../css/WorkingWithCourse.css';

function WorkingWithCourse() {
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [activeTab, setActiveTab] = useState('lessons');
  const [expandedModules, setExpandedModules] = useState({});
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [courseProgress, setCourseProgress] = useState({
    completed_lessons: 0, 
    total_lessons: 0,
    completed_modules: 0,
    total_modules: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [completingLesson, setCompletingLesson] = useState(false);
  const [assignments, setAssignments] = useState([]);
  const [filteredAssignments, setFilteredAssignments] = useState([]);
  const [assignmentFilter, setAssignmentFilter] = useState('all');
  const [assignmentSearch, setAssignmentSearch] = useState('');
  const [materials, setMaterials] = useState([]);
  const [participants, setParticipants] = useState({
    students: [],
    teachers: [],
    admins: []
  });
  const [discussions, setDiscussions] = useState([]);
  const [newQuestion, setNewQuestion] = useState({ title: '', description: '' });
  const [csrfToken, setCsrfToken] = useState('');
  const { courseId } = useParams();
  const navigate = useNavigate();

  // Get CSRF token
  const getCsrfToken = async () => {
    try {
      const response = await axios.get(`${API_URL}/get-csrf-token/`, { withCredentials: true });
      if (response.data && response.data.csrftoken) {
        setCsrfToken(response.data.csrftoken);
        axios.defaults.headers.common['X-CSRFToken'] = response.data.csrftoken;
        return response.data.csrftoken;
      }
    } catch (error) {
      console.error('Error fetching CSRF token:', error);
    }
    return null;
  };

  // Initial data fetching
  useEffect(() => {
    axios.defaults.withCredentials = true;
    
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        await getCsrfToken();
        
        const courseResponse = await axios.get(`${API_URL}/courses/${courseId}/`);
        setCourse(courseResponse.data);
        
        try {
          const progressResponse = await axios.get(`${API_URL}/progress/courses/${courseId}/progress/`);
          setCourseProgress(progressResponse.data);
        } catch (progressError) {
          console.error("Error fetching course progress:", progressError);
        }
        
        try {
          const materialsResponse = await axios.get(`${API_URL}/materials/?course=${courseId}`);
          setMaterials(materialsResponse.data || []);
        } catch (materialsError) {
          console.error("Error fetching course materials:", materialsError);
        }
        
        try {
          const participantsResponse = await axios.get(`${API_URL}/course/${courseId}/participants/`);
          setParticipants({
            students: participantsResponse.data.students || [],
            teachers: participantsResponse.data.teachers || [],
            admins: participantsResponse.data.admins || []
          });
        } catch (participantsError) {
          console.error("Error fetching participants:", participantsError);
        }
        
        try {
          const discussionsResponse = await axios.get(`${API_URL}/questions/course/${courseId}/`);
          setDiscussions(discussionsResponse.data || []);
        } catch (discussionsError) {
          console.error("Error fetching discussions:", discussionsError);
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching course:", error);
        setError("Не вдалося завантажити курс. Будь ласка, спробуйте пізніше.");
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [courseId]);

  // Fetch modules or assignments based on active tab
  useEffect(() => {
    if (activeTab === 'lessons' && course && !loading) {
      fetchModules();
    } else if (activeTab === 'assignments' && course && !loading) {
      fetchAssignments();
    }
  }, [activeTab, course, loading]);

  const fetchModules = async () => {
    try {
      await getCsrfToken();
      const response = await axios.get(`${API_URL}/modules/get_modules/${courseId}/`, { withCredentials: true });
      if (response.data && Array.isArray(response.data)) {
        setModules(response.data);
        if (response.data.length > 0) {
          fetchLessons(response.data[0].id);
        }
      } else {
        console.error("Invalid modules data format:", response.data);
      }
    } catch (error) {
      console.error("Error fetching modules:", error);
      setError("Не вдалося завантажити модулі курсу. Спробуйте оновити сторінку.");
    }
  };

  const fetchAssignments = async () => {
    try {
      await getCsrfToken();
      const response = await axios.get(`${API_URL}/assignments/student/course/${courseId}/assignments/`, { withCredentials: true });
      if (Array.isArray(response.data)) {
        setAssignments(response.data);
        setFilteredAssignments(response.data);
      } else {
        console.error("Invalid assignments data format:", response.data);
        setAssignments([]);
        setFilteredAssignments([]);
      }
    } catch (error) {
      console.error("Error fetching assignments:", error);
      setAssignments([]);
      setFilteredAssignments([]);
    }
  };

  const fetchLessons = async (moduleId) => {
    if (expandedModules[moduleId]) {
      setExpandedModules(prev => ({ ...prev, [moduleId]: !prev[moduleId] }));
      return;
    }
    try {
      await getCsrfToken();
      const response = await axios.get(`${API_URL}/lessons/get_lessons/${moduleId}/`, { withCredentials: true });
      if (response.data) {
        setModules(prevModules => 
          prevModules.map(module => 
            module.id === moduleId ? { ...module, lessons: response.data } : module
          )
        );
        setExpandedModules(prev => ({ ...prev, [moduleId]: true }));
      }
    } catch (error) {
      console.error("Error fetching lessons:", error);
      setModules(prevModules => 
        prevModules.map(module => 
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
        links: linksResponse.data || []
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
      setSelectedLesson(prev => ({ ...prev, is_completed: true }));
      setModules(prevModules => 
        prevModules.map(module => {
          if (!module.lessons) return module;
          return {
            ...module,
            lessons: module.lessons.map(lesson => 
              lesson.id === selectedLesson.id ? { ...lesson, is_completed: true } : lesson
            )
          };
        })
      );
      setCourseProgress(prev => ({ ...prev, completed_lessons: prev.completed_lessons + 1 }));
      setCompletingLesson(false);
    } catch (error) {
      console.error("Error marking lesson as completed:", error);
      setCompletingLesson(false);
    }
  };

  // Assignment filtering and search
  useEffect(() => {
    let filtered = assignments;
    if (assignmentFilter !== 'all') {
      filtered = filtered.filter(a => a.status === assignmentFilter);
    }
    if (assignmentSearch) {
      filtered = filtered.filter(a => 
        a.title.toLowerCase().includes(assignmentSearch.toLowerCase()) ||
        a.description?.toLowerCase().includes(assignmentSearch.toLowerCase())
      );
    }
    setFilteredAssignments(filtered);
  }, [assignmentFilter, assignmentSearch, assignments]);

  // Create new question
  const handleCreateQuestion = async (e) => {
    e.preventDefault();
    try {
      await getCsrfToken();
      const response = await axios.post(`${API_URL}/questions/course/${courseId}/`, newQuestion, { withCredentials: true });
      setDiscussions(prev => [...prev, response.data]);
      setNewQuestion({ title: '', description: '' });
    } catch (error) {
      console.error("Error creating question:", error);
      setError("Не вдалося створити запитання. Спробуйте знову.");
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

  const calculateProgress = () => {
    if (!courseProgress.total_lessons || courseProgress.total_lessons === 0) return 0;
    return Math.round((courseProgress.completed_lessons / courseProgress.total_lessons) * 100);
  };

  const isLessonCompleted = (lessonId) => {
    if (selectedLesson && selectedLesson.id === lessonId) return selectedLesson.is_completed;
    for (const module of modules) {
      if (!module.lessons) continue;
      const lesson = module.lessons.find(l => l.id === lessonId);
      if (lesson && lesson.is_completed) return true;
    }
    return false;
  };

  const formatAssignmentStatus = (status) => {
    switch(status) {
      case 'assigned': return { label: 'Призначено', color: '#6c757d' };
      case 'submitted': return { label: 'Надіслано', color: '#007bff' };
      case 'graded': return { label: 'Оцінено', color: '#28a745' };
      case 'returned': return { label: 'Повернуто', color: '#ffc107' };
      default: return { label: status, color: '#6c757d' };
    }
  };

  const getTimeRemaining = (dueDate) => {
    if (!dueDate) return "Немає терміну";
    const due = new Date(dueDate);
    const now = new Date();
    if (due < now) return "Прострочено";
    const diffTime = Math.abs(due - now);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Сьогодні";
    if (diffDays === 1) return "Завтра";
    return `${diffDays} днів`;
  };

  if (loading) {
    return (
      <div className="course-wc-interface-container">
        <div className="course-wc-loading-spinner">
          <div className="course-wc-spinner"></div>
          <p>Завантаження курсу...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="course-wc-interface-container">
        <div className="course-wc-error-container">
          <div className="course-wc-error-icon">!</div>
          <h3>Помилка завантаження</h3>
          <p>{error}</p>
          <button className="course-wc-btn-primary" onClick={() => window.location.reload()}>
            Спробувати знову
          </button>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="course-wc-interface-container">
        <div className="course-wc-error-container">
          <div className="course-wc-error-icon">?</div>
          <h3>Курс не знайдено</h3>
          <p>Запитаний курс не знайдено. Можливо, його було видалено або у вас немає до нього доступу.</p>
          <Link to="/dashboard" className="course-wc-btn-primary">
            Назад до Панелі
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="course-wc-interface-container">
      <aside className="course-wc-sidebar">
        <div className="course-wc-sidebar-header">
          <img 
            src={course.image_url || 'https://via.placeholder.com/300x150?text=Курс'} 
            alt={course.title} 
            className="course-wc-course-image" 
          />
          <h2 className="course-wc-course-title">{course.title}</h2>
          <div className="course-wc-progress-container">
            <div className="course-wc-progress-label">
              <span>Ваш прогрес</span>
              <span>{calculateProgress()}%</span>
            </div>
            <div className="course-wc-progress-bar">
              <div 
                className="course-wc-progress-fill" 
                style={{ width: `${calculateProgress()}%` }}
              ></div>
            </div>
            <div className="course-wc-progress-stats">
              <div className="course-wc-progress-stat">
                <span className="course-wc-stat-value">{courseProgress.completed_lessons}/{courseProgress.total_lessons}</span>
                <span className="course-wc-stat-label">Уроків</span>
              </div>
              <div className="course-wc-progress-stat">
                <span className="course-wc-stat-value">{courseProgress.completed_modules}/{courseProgress.total_modules}</span>
                <span className="course-wc-stat-label">Модулів</span>
              </div>
            </div>
          </div>
        </div>
        
        <nav className="course-wc-course-nav">
          <button 
            className={`course-wc-nav-item ${activeTab === 'lessons' ? 'active' : ''}`}
            onClick={() => setActiveTab('lessons')}
          >
            <Book className="course-wc-nav-icon" />
            <span>Матеріали та уроки</span>
          </button>
          
          <button 
            className={`course-wc-nav-item ${activeTab === 'assignments' ? 'active' : ''}`}
            onClick={() => setActiveTab('assignments')}
          >
            <ClipboardList className="course-wc-nav-icon" />
            <span>Завдання</span>
          </button>
          
          <button 
            className={`course-wc-nav-item ${activeTab === 'tests' ? 'active' : ''}`}
            onClick={() => setActiveTab('tests')}
          >
            <Edit3 className="course-wc-nav-icon" />
            <span>Тести</span>
          </button>
          
          <button 
            className={`course-wc-nav-item ${activeTab === 'discussions' ? 'active' : ''}`}
            onClick={() => setActiveTab('discussions')}
          >
            <MessageCircle className="course-wc-nav-icon" />
            <span>Обговорення</span>
          </button>
          
          <button 
            className={`course-wc-nav-item ${activeTab === 'qa' ? 'active' : ''}`}
            onClick={() => setActiveTab('qa')}
          >
            <HelpCircle className="course-wc-nav-icon" />
            <span>Q&A Сесії</span>
          </button>
          
          <button 
            className={`course-wc-nav-item ${activeTab === 'participants' ? 'active' : ''}`}
            onClick={() => setActiveTab('participants')}
          >
            <Users className="course-wc-nav-icon" />
            <span>Учасники курсу</span>
          </button>
          
          <button 
            className={`course-wc-nav-item ${activeTab === 'grades' ? 'active' : ''}`}
            onClick={() => setActiveTab('grades')}
          >
            <Star className="course-wc-nav-icon" />
            <span>Оцінки</span>
          </button>
        </nav>

        <div className="course-wc-course-teacher">
          <div className="course-wc-teacher-info">
            <img 
              src={course.teacher?.profile_image_url || 'https://via.placeholder.com/40'} 
              alt={course.teacher?.full_name || 'Викладач'} 
              className="course-wc-teacher-image" 
            />
            <div>
              <span className="course-wc-teacher-label">Викладач</span>
              <span className="course-wc-teacher-name">
                {course.teacher ? (course.teacher.first_name && course.teacher.last_name ? 
                  `${course.teacher.first_name} ${course.teacher.last_name}` : 
                  course.teacher.username) : 'Невідомий викладач'}
              </span>
            </div>
          </div>
        </div>
      </aside>
      
      <main className="course-wc-content">
        {activeTab === 'lessons' && (
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
                            {material.files && material.files.map((file) => (
                              <a 
                                key={file.id}
                                href={file.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="course-wc-file-item"
                              >
                                {getFileIcon(file.file_type)}
                                <div className="course-wc-file-info">
                                  <span className="course-wc-file-name">{file.file_name || getFilenameFromUrl(file.file_url)}</span>
                                  <span className="course-wc-file-type">
                                    {file.file_type?.toUpperCase() || 'FILE'} • {((file.file_size || 0) / 1024 / 1024).toFixed(2)} MB
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
                        <div className="course-wc-content-text">
                          {selectedLesson.content}
                        </div>
                      </div>
                    )}
                    
                    {selectedLesson.files && selectedLesson.files.length > 0 && (
                      <div className="course-wc-lesson-resources">
                        <h3>Матеріали заняття</h3>
                        <div className="course-wc-files-list">
                          {selectedLesson.files.map(file => (
                            <a 
                              key={file.id}
                              href={file.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="course-wc-file-item"
                            >
                              {getFileIcon(file.file_type)}
                              <div className="course-wc-file-info">
                                <span className="course-wc-file-name">{file.file_name || getFilenameFromUrl(file.file_url)}</span>
                                <span className="course-wc-file-type">{file.file_type?.toUpperCase() || 'FILE'} • {((file.file_size || 0) / 1024 / 1024).toFixed(2)} MB</span>
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
                          {selectedLesson.links.map(link => (
                            <a 
                              key={link.id}
                              href={link.link_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="course-wc-link-item"
                            >
                              <ExternalLink className="course-wc-link-icon" />
                              <div className="course-wc-link-info">
                                <span className="course-wc-link-title">{link.description || 'Додатковий ресурс'}</span>
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
          </div>
        )}
        
        {activeTab === 'assignments' && (
          <div className="course-wc-assignments-tab">
            <div className="course-wc-content-header">
              <h2>Завдання курсу</h2>
              <div className="course-wc-content-meta">
                <span><ClipboardList className="course-wc-meta-icon" /> {filteredAssignments.length} завдань</span>
              </div>
            </div>
            
            <div className="course-wc-assignments-header">
              <div className="course-wc-assignments-filters">
                <select 
                  className="course-wc-assignments-filter"
                  value={assignmentFilter}
                  onChange={(e) => setAssignmentFilter(e.target.value)}
                >
                  <option value="all">Всі завдання</option>
                  <option value="assigned">Призначено</option>
                  <option value="submitted">Надіслано</option>
                  <option value="graded">Оцінено</option>
                  <option value="returned">Повернуто</option>
                </select>
                <div className="course-wc-assignments-search-container">
                  <Search className="course-wc-search-icon" />
                  <input
                    type="text"
                    className="course-wc-assignments-search"
                    placeholder="Пошук завдань..."
                    value={assignmentSearch}
                    onChange={(e) => setAssignmentSearch(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="course-wc-assignments-list">
              {filteredAssignments.length === 0 ? (
                <div className="course-wc-no-content-message">
                  <h3>Немає доступних завдань</h3>
                  <p>У цьому курсі поки що немає завдань або жодне завдання не відповідає вашим критеріям пошуку.</p>
                </div>
              ) : (
                filteredAssignments.map(assignment => {
                  const statusInfo = formatAssignmentStatus(assignment.status);
                  const timeRemaining = getTimeRemaining(assignment.due_date);
                  
                  return (
                    <div key={assignment.id} className="course-wc-assignment-card">
                      <div className="course-wc-assignment-header">
                        <h3 className="course-wc-assignment-title">{assignment.title}</h3>
                        <div 
                          className="course-wc-assignment-status" 
                          style={{ backgroundColor: statusInfo.color }}
                        >
                          {statusInfo.label}
                        </div>
                      </div>
                      
                      <p className="course-wc-assignment-description">
                        {assignment.description ? 
                          assignment.description.length > 150 ? 
                            `${assignment.description.substring(0, 150)}...` : 
                            assignment.description
                          : 'Немає опису.'
                        }
                      </p>
                      
                      <div className="course-wc-assignment-meta">
                        <div className="course-wc-meta-item">
                          <Calendar className="course-wc-meta-icon" />
                          <span>Термін: {assignment.due_date ? 
                            new Date(assignment.due_date).toLocaleDateString('uk-UA') : 
                            'Немає терміну'
                          }</span>
                        </div>
                        
                        <div className="course-wc-meta-item course-wc-time-remaining">
                          <Clock className="course-wc-meta-icon" />
                          <span>{timeRemaining}</span>
                        </div>
                        
                        {assignment.status === 'graded' && (
                          <div className="course-wc-meta-item course-wc-grade">
                            <Award className="course-wc-meta-icon" />
                            <span>Оцінка: {assignment.grade}/100</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="course-wc-assignment-actions">
                        <Link 
                          to={`/assignments/${assignment.id}`} 
                          className="course-wc-btn-assignment"
                        >
                          {assignment.status === 'assigned' ? 'Розпочати завдання' : 'Переглянути завдання'}
                        </Link>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
        
        {activeTab === 'tests' && (
          <div className="course-wc-tests-tab">
            <div className="course-wc-content-header">
              <h2>Тести курсу</h2>
            </div>
            
            <div className="course-wc-no-content-message">
              <h3>Немає доступних тестів</h3>
              <p>У цьому курсі поки що немає тестів. Перевірте пізніше або зв'яжіться з викладачем.</p>
            </div>
          </div>
        )}
        
        {activeTab === 'discussions' && (
          <div className="course-wc-discussions-tab">
            <div className="course-wc-content-header">
              <h2>Обговорення курсу</h2>
            </div>
            
            <div className="course-wc-discussion-forums">
              <div className="course-wc-forum-card">
                <h3>Загальне обговорення</h3>
                <p>Ставте запитання, діліться ідеями та спілкуйтеся з іншими студентами в цьому загальному форумі.</p>
                <div className="course-wc-forum-meta">
                  <div className="course-wc-meta-item">
                    <MessageCircle className="course-wc-meta-icon" />
                    <span>15 тем</span>
                  </div>
                  <div className="course-wc-meta-item">
                    <Clock className="course-wc-meta-icon" />
                    <span>Останній пост: 2 дні тому</span>
                  </div>
                </div>
                <button className="course-wc-btn-forum">Перейти до форуму</button>
              </div>
              
              <div className="course-wc-forum-card">
                <h3>Допомога з завданнями</h3>
                <p>Отримайте допомогу з завданнями від викладачів та інших студентів.</p>
                <div className="course-wc-forum-meta">
                  <div className="course-wc-meta-item">
                    <MessageCircle className="course-wc-meta-icon" />
                    <span>8 тем</span>
                  </div>
                  <div className="course-wc-meta-item">
                    <Clock className="course-wc-meta-icon" />
                    <span>Останній пост: 5 днів тому</span>
                  </div>
                </div>
                <button className="course-wc-btn-forum">Перейти до форуму</button>
              </div>
              
              <div className="course-wc-forum-card">
                <h3>Навчальні групи</h3>
                <p>Координуйтеся з іншими студентами для формування навчальних груп та спільного навчання.</p>
                <div className="course-wc-forum-meta">
                  <div className="course-wc-meta-item">
                    <MessageCircle className="course-wc-meta-icon" />
                    <span>3 теми</span>
                  </div>
                  <div className="course-wc-meta-item">
                    <Clock className="course-wc-meta-icon" />
                    <span>Останній пост: 1 тиждень тому</span>
                  </div>
                </div>
                <button className="course-wc-btn-forum">Перейти до форуму</button>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'qa' && (
          <div className="course-wc-qa-tab">
            <div className="course-wc-content-header">
              <h2>Q&A Сесії</h2>
            </div>
            
            <div className="course-wc-qa-container">
              <div className="course-wc-qa-header">
                <div className="course-wc-qa-create-form">
                  <h3>Створити нове запитання</h3>
                  <div className="course-wc-qa-form">
                    <input
                      type="text"
                      placeholder="Заголовок запитання"
                      value={newQuestion.title}
                      onChange={(e) => setNewQuestion(prev => ({ ...prev, title: e.target.value }))}
                      className="course-wc-qa-input"
                    />
                    <textarea
                      placeholder="Опишіть ваше запитання"
                      value={newQuestion.description}
                      onChange={(e) => setNewQuestion(prev => ({ ...prev, description: e.target.value }))}
                      className="course-wc-qa-textarea"
                    />
                    <button 
                      className="course-wc-btn-qa-create"
                      onClick={handleCreateQuestion}
                      disabled={!newQuestion.title || !newQuestion.description}
                    >
                      Опублікувати запитання
                    </button>
                  </div>
                </div>
                <div className="course-wc-qa-filters">
                  <select className="course-wc-qa-filter">
                    <option value="all">Всі запитання</option>
                    <option value="answered">Відповідені</option>
                    <option value="unanswered">Без відповіді</option>
                  </select>
                  <input type="text" className="course-wc-qa-search" placeholder="Пошук запитань..." />
                </div>
              </div>
              
              {discussions.length === 0 ? (
                <div className="course-wc-no-content-message">
                  <h3>Поки що немає Q&A сесій</h3>
                  <p>Будьте першим, хто створить запитання для цього курсу!</p>
                </div>
              ) : (
                <div className="course-wc-qa-list">
                  {discussions.map(discussion => (
                    <div key={discussion.id} className="course-wc-qa-item">
                      <div className="course-wc-qa-item-header">
                        <div className="course-wc-qa-item-author">
                          <img 
                            src={discussion.teacher?.profile_image_url || 'https://via.placeholder.com/40'} 
                            alt={discussion.teacher?.username || 'User'} 
                            className="course-wc-qa-avatar" 
                          />
                          <div className="course-wc-qa-author-info">
                            <span className="course-wc-qa-author-name">{discussion.teacher?.username || 'Користувач'}</span>
                            <span className="course-wc-qa-date">{new Date(discussion.created_at).toLocaleDateString('uk-UA')}</span>
                          </div>
                        </div>
                        <div className="course-wc-qa-stats">
                          <span className="course-wc-qa-answers">{discussion.answers?.length || 0} відповідей</span>
                        </div>
                      </div>
                      <h3 className="course-wc-qa-title">{discussion.title}</h3>
                      <p className="course-wc-qa-description">{discussion.description}</p>
                      <div className="course-wc-qa-actions">
                        <Link to={`/qa/${discussion.id}`} className="course-wc-btn-qa">
                          Переглянути деталі
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
        
        {activeTab === 'participants' && (
          <div className="course-wc-participants-tab">
            <div className="course-wc-content-header">
              <h2>Учасники курсу</h2>
            </div>
            
            <div className="course-wc-participants-container">
              <div className="course-wc-participants-section">
                <h3 className="course-wc-participants-title">
                  <Users className="course-wc-section-icon" /> Викладачі ({participants.teachers.length})
                </h3>
                <div className="course-wc-participants-list">
                  {participants.teachers.length === 0 ? (
                    <p className="course-wc-no-participants">Немає доступних викладачів</p>
                  ) : (
                    participants.teachers.map(teacher => (
                      <div key={teacher.id} className="course-wc-participant-card">
                        <img 
                          src={teacher.profile_image_url || 'https://via.placeholder.com/60'} 
                          alt={teacher.username} 
                          className="course-wc-participant-avatar" 
                        />
                        <div className="course-wc-participant-info">
                          <h4 className="course-wc-participant-name">
                            {teacher.first_name && teacher.last_name 
                              ? `${teacher.first_name} ${teacher.last_name}` 
                              : teacher.username}
                          </h4>
                          <span className="course-wc-participant-role">Викладач</span>
                          <span className="course-wc-participant-email">{teacher.email}</span>
                          <button className="course-wc-btn-view-profile" onClick={() => navigate(`/profile/${teacher.id}`)}>
                            Переглянути профіль
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
              
              <div className="course-wc-participants-section">
                <h3 className="course-wc-participants-title">
                  <Users className="course-wc-section-icon" /> Студенти ({participants.students.length})
                </h3>
                <div className="course-wc-participants-list">
                  {participants.students.length === 0 ? (
                    <p className="course-wc-no-participants">Немає доступних студентів</p>
                  ) : (
                    participants.students.map(student => (
                      <div key={student.id} className="course-wc-participant-card">
                        <img 
                          src={student.profile_image_url || 'https://via.placeholder.com/60'} 
                          alt={student.username} 
                          className="course-wc-participant-avatar" 
                        />
                        <div className="course-wc-participant-info">
                          <h4 className="course-wc-participant-name">
                            {student.first_name && student.last_name 
                              ? `${student.first_name} ${student.last_name}` 
                              : student.username}
                          </h4>
                          <span className="course-wc-participant-role">Студент</span>
                          <span className="course-wc-participant-email">{student.email}</span>
                          <button className="course-wc-btn-view-profile" onClick={() => navigate(`/profile/${student.id}`)}>
                            Переглянути профіль
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
              
              {participants.admins && participants.admins.length > 0 && (
                <div className="course-wc-participants-section">
                  <h3 className="course-wc-participants-title">
                    <Users className="course-wc-section-icon" /> Адміністратори ({participants.admins.length})
                  </h3>
                  <div className="course-wc-participants-list">
                    {participants.admins.map(admin => (
                      <div key={admin.id} className="course-wc-participant-card">
                        <img 
                          src={admin.profile_image_url || 'https://via.placeholder.com/60'} 
                          alt={admin.username} 
                          className="course-wc-participant-avatar" 
                        />
                        <div className="course-wc-part personally identifiable information was removed for privacy reasons -participant-info">
                          <h4 className="course-wc-participant-name">
                            {admin.first_name && admin.last_name 
                              ? `${admin.first_name} ${admin.last_name}` 
                              : admin.username}
                          </h4>
                          <span className="course-wc-participant-role">Адміністратор</span>
                          <span className="course-wc-participant-email">{admin.email}</span>
                          <button className="course-wc-btn-view-profile" onClick={() => navigate(`/profile/${admin.id}`)}>
                            Переглянути профіль
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        
        {activeTab === 'grades' && (
          <div className="course-wc-grades-tab">
            <div className="course-wc-content-header">
              <h2>Оцінки курсу</h2>
            </div>
            
            <div className="course-wc-grades-summary">
              <div className="course-wc-grade-summary-card">
                <h3>Загальна оцінка</h3>
                <div className="course-wc-grade-circle">
                  <span className="course-wc-grade-value">85%</span>
                </div>
                <p className="course-wc-grade-status">Добрий прогрес!</p>
              </div>
              
              <div className="course-wc-grade-stats">
                <div className="course-wc-grade-stat-item">
                  <h4>Завдання</h4>
                  <div className="course-wc-grade-stat-value">80%</div>
                  <div className="course-wc-grade-progress-bar">
                    <div className="course-wc-grade-progress-fill" style={{width: '80%'}}></div>
                  </div>
                </div>
                
                <div className="course-wc-grade-stat-item">
                  <h4>Тести</h4>
                  <div className="course-wc-grade-stat-value">90%</div>
                  <div className="course-wc-grade-progress-bar">
                    <div className="course-wc-grade-progress-fill" style={{width: '90%'}}></div>
                  </div>
                </div>
                
                <div className="course-wc-grade-stat-item">
                  <h4>Фінальний проект</h4>
                  <div className="course-wc-grade-stat-value">85%</div>
                  <div className="course-wc-grade-progress-bar">
                    <div className="course-wc-grade-progress-fill" style={{width: '85%'}}></div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="course-wc-grades-details">
              <h3>Деталі оцінок</h3>
              <table className="course-wc-grades-table">
                <thead>
                  <tr>
                    <th>Завдання</th>
                    <th>Категорія</th>
                    <th>Термін</th>
                    <th>Бали</th>
                    <th>Оцінка</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Завдання 1: Вступ</td>
                    <td>Завдання</td>
                    <td>15 Жовт, 2023</td>
                    <td>18/20</td>
                    <td>90%</td>
                  </tr>
                  <tr>
                    <td>Тест 1: Основи</td>
                    <td>Тест</td>
                    <td>22 Жовт, 2023</td>
                    <td>9/10</td>
                    <td>90%</td>
                  </tr>
                  <tr>
                    <td>Завдання 2: Аналіз</td>
                    <td>Завдання</td>
                    <td>5 Лист, 2023</td>
                    <td>35/50</td>
                    <td>70%</td>
                  </tr>
                  <tr>
                    <td>Фінальний проект: Впровадження</td>
                    <td>Проект</td>
                    <td>10 Груд, 2023</td>
                    <td>85/100</td>
                    <td>85%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default WorkingWithCourse;