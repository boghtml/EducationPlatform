import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../api';
import Header from './Header';
import Footer from './Footer';
import '../css/dashboard.css';
import { 
  FaGraduationCap, 
  FaTasks, 
  FaCalendarAlt, 
  FaClock, 
  FaBook, 
  FaChartLine, 
  FaStar, 
  FaUsers,
  FaFilter,
  FaSearch,
  FaExclamationTriangle,
  FaRegCalendarCheck,
  FaSpinner,
  FaCheckCircle,
  FaBackward,
  FaBookmark,
} from 'react-icons/fa';

function Dashboard() {
  const [user, setUser] = useState({
    id: '',
    name: '',
    email: '',
    profileImageUrl: '',
    role: ''
  });
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalCourses: 0,
    completedLessons: 0,
    totalLessons: 0,
    pendingAssignments: 0,
    completedAssignments: 0,
    upcomingDeadlinesCount: 0
  });
  const [upcomingDeadlines, setUpcomingDeadlines] = useState([]);
  const [recommendedCourses, setRecommendedCourses] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'active', 'completed', 'premium', 'free'
  const [sortBy, setSortBy] = useState('recent'); // 'recent', 'name', 'progress'
  const navigate = useNavigate();

  useEffect(() => {
    
    const userId = sessionStorage.getItem('userId');
    const userName = sessionStorage.getItem('userName');
    const userEmail = sessionStorage.getItem('userEmail');
    const profileImageUrl = sessionStorage.getItem('profileImageUrl');
    const userRole = sessionStorage.getItem('userRole');

    if (!userId) {
      
      navigate('/login');
      return;
    }

    setUser({
      id: userId,
      name: userName || 'Користувач',
      email: userEmail || '',
      profileImageUrl: profileImageUrl || 'https://via.placeholder.com/40',
      role: userRole || 'student'
    });

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        await axios.get(`${API_URL}/get-csrf-token/`, { withCredentials: true });
        
        const response = await axios.get(`${API_URL}/users/dashboard-stats/`, {
          withCredentials: true
        });
        
        const { 
          stats: statsData, 
          courses: coursesData, 
          upcoming_deadlines, 
          recommended_courses, 
          recent_activities 
        } = response.data;
        
        setStats({
          totalCourses: statsData.total_courses,
          completedLessons: statsData.completed_lessons,
          totalLessons: statsData.total_lessons,
          pendingAssignments: statsData.pending_assignments,
          completedAssignments: statsData.completed_assignments,
          upcomingDeadlinesCount: statsData.upcoming_deadlines_count
        });
        
        setCourses(coursesData);
        setFilteredCourses(coursesData);
        setUpcomingDeadlines(upcoming_deadlines);
        setRecommendedCourses(recommended_courses);
        setRecentActivities(recent_activities);
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setError("Не вдалося завантажити дані. Будь ласка, спробуйте пізніше.");
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  useEffect(() => {
    if (courses.length === 0) return;
    
    let filtered = [...courses];
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(course => 
        course.title.toLowerCase().includes(query) || 
        (course.description && course.description.toLowerCase().includes(query))
      );
    }
    
    switch (filter) {
      case 'active':
        filtered = filtered.filter(course => 
          (course.completed_lessons / course.total_lessons) < 1 && 
          (course.completed_lessons / course.total_lessons) > 0
        );
        break;
      case 'completed':
        filtered = filtered.filter(course => 
          course.completed_lessons === course.total_lessons && course.total_lessons > 0
        );
        break;
      case 'not-started':
        filtered = filtered.filter(course => 
          course.completed_lessons === 0
        );
        break;
      case 'premium':
        filtered = filtered.filter(course => course.status === 'premium');
        break;
      case 'free':
        filtered = filtered.filter(course => course.status === 'free');
        break;
      default:
        break;
    }
    
    switch (sortBy) {
      case 'name':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'progress':
        filtered.sort((a, b) => {
          const progressA = a.total_lessons ? (a.completed_lessons / a.total_lessons) : 0;
          const progressB = b.total_lessons ? (b.completed_lessons / b.total_lessons) : 0;
          return progressB - progressA;
        });
        break;
      case 'recent':
      default:
        break;
    }
    
    setFilteredCourses(filtered);
  }, [courses, searchQuery, filter, sortBy]);

  const calculateProgress = (completedLessons, totalLessons) => {
    if (!totalLessons) return 0;
    return Math.round((completedLessons / totalLessons) * 100);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Не вказано';
    const date = new Date(dateString);
    return date.toLocaleDateString('uk-UA', { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const handleCourseClick = (courseId) => {
    navigate(`/my-courses/${courseId}`);
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'lesson_completed':
        return <FaBook className="activity-icon completed" />;
      case 'assignment_submitted':
        return <FaTasks className="activity-icon submitted" />;
      case 'course_enrolled':
        return <FaGraduationCap className="activity-icon enrolled" />;
      default:
        return <FaCalendarAlt className="activity-icon" />;
    }
  };

  const formatActivityDate = (dateString) => {
    if (!dateString) return 'Не вказано';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    
    if (diffDays > 0) {
      return `${diffDays} ${diffDays === 1 ? 'день' : diffDays < 5 ? 'дні' : 'днів'} тому`;
    } else if (diffHours > 0) {
      return `${diffHours} ${diffHours === 1 ? 'годину' : diffHours < 5 ? 'години' : 'годин'} тому`;
    } else {
      return `${diffMinutes} ${diffMinutes === 1 ? 'хвилину' : diffMinutes < 5 ? 'хвилини' : 'хвилин'} тому`;
    }
  };

  const formatDeadlineDate = (dateString) => {
    if (!dateString) return 'Не вказано';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return 'Прострочено';
    } else if (diffDays === 0) {
      return 'Сьогодні';
    } else if (diffDays === 1) {
      return 'Завтра';
    } else {
      return `${formatDate(dateString)}`;
    }
  };

  const getDeadlineStatusClass = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return 'overdue';
    } else if (diffDays <= 1) {
      return 'urgent';
    } else if (diffDays <= 3) {
      return 'approaching';
    } else {
      return 'normal';
    }
  };

  return (
    <div className="dashboard-wrapper">
      <Header />
      
      <div className="dashboard-container">
        <div className="container py-4">
          {/* Привітальна секція */}
          <div className="welcome-section">
            <div className="welcome-text">
              <h1>Вітаємо, {user.name}!</h1>
              <p>Це ваша персональна панель керування навчанням.</p>
            </div>
          </div>
          
          {/* Статистика */}
          <div className="stats-section">
            <div className="stats-card">
              <div className="stats-icon courses">
                <FaGraduationCap />
              </div>
              <div className="stats-content">
                <h3>{stats.totalCourses}</h3>
                <p>Курсів записано</p>
              </div>
            </div>
            
            <div className="stats-card">
              <div className="stats-icon lessons">
                <FaBook />
              </div>
              <div className="stats-content">
                <h3>{stats.completedLessons}/{stats.totalLessons}</h3>
                <p>Уроків завершено</p>
              </div>
            </div>
            
            <div className="stats-card">
              <div className="stats-icon assignments">
                <FaTasks />
              </div>
              <div className="stats-content">
                <h3>{stats.pendingAssignments}</h3>
                <p>Завдань на черзі</p>
              </div>
            </div>
            
            <div className="stats-card">
              <div className="stats-icon completed">
                <FaCheckCircle />
              </div>
              <div className="stats-content">
                <h3>{stats.completedAssignments}</h3>
                <p>Завдань виконано</p>
              </div>
            </div>

            <div className="dashboard-nav-item">
              <Link to="/notes-management" className="dashboard-nav-link">
                <FaBookmark className="dashboard-nav-icon" />
                <span>Мої нотатки</span>
              </Link>
            </div>
            
          </div>
          
          {/* Головний контент */}
          <div className="dashboard-content">
            {/* Секція курсів */}
            <div className="my-courses-section">
              <div className="section-header">
                <h2>Мої курси</h2>
                <Link to="/" className="browse-courses-btn">
                  Знайти нові курси
                </Link>
              </div>
              
              {/* Фільтрація та пошук курсів */}
              <div className="courses-controls">
                <div className="search-box">
                  <FaSearch className="search-icon" />
                  <input 
                    type="text" 
                    placeholder="Пошук курсів..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <div className="filters">
                  <div className="filter-group">
                    <label htmlFor="filter">
                      <FaFilter /> Фільтр:
                    </label>
                    <select 
                      id="filter" 
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                    >
                      <option value="all">Всі курси</option>
                      <option value="active">В процесі</option>
                      <option value="completed">Завершені</option>
                      <option value="not-started">Не розпочаті</option>
                      <option value="premium">Преміум</option>
                      <option value="free">Безкоштовні</option>
                    </select>
                  </div>
                  
                  <div className="filter-group">
                    <label htmlFor="sortBy">Сортувати:</label>
                    <select 
                      id="sortBy" 
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                    >
                      <option value="recent">Нещодавні</option>
                      <option value="name">За назвою</option>
                      <option value="progress">За прогресом</option>
                    </select>
                  </div>
                </div>
              </div>
              
              {/* Карточки курсів */}
              {loading ? (
                <div className="courses-loading">
                  <FaSpinner className="loading-spinner" />
                  <p>Завантаження курсів...</p>
                </div>
              ) : error ? (
                <div className="courses-error">
                  <FaExclamationTriangle />
                  <p>{error}</p>
                  <button 
                    className="btn btn-primary mt-3"
                    onClick={() => window.location.reload()}
                  >
                    Спробувати знову
                  </button>
                </div>
              ) : filteredCourses.length === 0 ? (
                <div className="no-courses">
                  <div className="no-courses-content">
                    <FaGraduationCap className="no-courses-icon" />
                    <h3>У вас поки немає курсів</h3>
                    <p>Почніть ваше навчання вже зараз</p>
                    <Link to="/" className="btn btn-primary mt-3">
                      Переглянути доступні курси
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="courses-grid">
                  {filteredCourses.map(course => {
                    const progress = calculateProgress(
                      course.completed_lessons || 0, 
                      course.total_lessons || 0
                    );
                    
                    return (
                      <div 
                        className="course-card" 
                        key={course.id}
                        onClick={() => handleCourseClick(course.id)}
                      >
                        <div className="course-image-container">
                          <img 
                            src={course.image_url || 'https://via.placeholder.com/300x200?text=Курс'} 
                            alt={course.title} 
                            className="course-image" 
                          />
                          <div className={`course-status ${course.status}`}>
                            {course.status === 'free' ? 'Безкоштовно' : 'Преміум'}
                          </div>
                        </div>
                        
                        <div className="course-content">
                          <h3 className="course-title">{course.title}</h3>
                          
                          <div className="course-progress">
                            <div className="progress-bar">
                              <div 
                                className="progress-fill"
                                style={{ width: `${progress}%` }}
                              ></div>
                            </div>
                            <div className="progress-text">
                              {progress}% завершено
                            </div>
                          </div>
                          
                          <div className="course-meta">
                            <div className="meta-item">
                              <FaClock /> {course.duration || 0} тижнів
                            </div>
                            <div className="meta-item">
                              <FaBook /> {course.total_lessons || 0} уроків
                            </div>
                          </div>
                          
                          <div className="course-footer">
                            <div className="course-teacher">
                              {course.teacher && (
                                <span>Викладач: {course.teacher.full_name}</span>
                              )}
                            </div>
                            <div className="last-activity">
                              Останнє відвідування: {formatDate(course.last_access || new Date())}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            
            {/* Бічна панель */}
            <div className="dashboard-sidebar">
              {/* Секція останніх активностей */}
              <div className="recent-activities">
                <h3>Остання активність</h3>
                {recentActivities && recentActivities.length > 0 ? (
                  <ul className="activities-list">
                    {recentActivities.map((activity, index) => (
                      <li className="activity-item" key={index}>
                        {getActivityIcon(activity.type)}
                        <div className="activity-content">
                          <h4 className="activity-title">{activity.title}</h4>
                          <p className="activity-course">{activity.course}</p>
                          <span className="activity-date">
                            {formatActivityDate(activity.date)}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="no-activities">
                    <p>У вас ще немає активностей.</p>
                  </div>
                )}
              </div>
              
              {/* Секція майбутніх дедлайнів */}
              <div className="upcoming-deadlines">
                <h3>Майбутні дедлайни</h3>
                {upcomingDeadlines && upcomingDeadlines.length > 0 ? (
                  <ul className="deadlines-list">
                    {upcomingDeadlines.map((deadline, index) => (
                      <li className="deadline-item" key={index}>
                        <FaRegCalendarCheck className={`deadline-icon ${getDeadlineStatusClass(deadline.due_date)}`} />
                        <div className="deadline-content">
                          <h4 className="deadline-title">{deadline.title}</h4>
                          <p className="deadline-course">{deadline.course_title}</p>
                          <span className={`deadline-date ${getDeadlineStatusClass(deadline.due_date)}`}>
                            {formatDeadlineDate(deadline.due_date)}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="no-deadlines">
                    <p>У вас немає найближчих дедлайнів. Чудова робота!</p>
                  </div>
                )}
              </div>
              
              {/* Секція рекомендованих курсів */}
              <div className="recommended-courses">
                <h3>Рекомендовані курси</h3>
                {recommendedCourses && recommendedCourses.length > 0 ? (
                  <>
                    {recommendedCourses.map((course, index) => (
                      <div className="recommended-course" key={index} onClick={() => navigate(`/courses/${course.id}`)}>
                        <img 
                          src={course.image_url || `https://via.placeholder.com/80x60?text=${course.title}`} 
                          alt={course.title} 
                          className="recommended-course-image" 
                        />
                        <div className="recommended-course-content">
                          <h4>{course.title}</h4>
                          <div className="recommended-course-rating">
                            {[...Array(5)].map((_, i) => {
                              const ratingValue = i + 1;
                              return (
                                <FaStar 
                                  key={i} 
                                  className={
                                    ratingValue <= course.rating 
                                      ? "star-filled" 
                                      : ratingValue <= course.rating + 0.5 && ratingValue > course.rating
                                      ? "star-half"
                                      : "star-empty"
                                  } 
                                />
                              );
                            })}
                            <span>{course.rating}</span>
                          </div>
                          <div className="recommended-course-students">
                            <FaUsers /> {course.students_count}+ студентів
                          </div>
                          <div className={`course-badge ${course.status}`}>
                            {course.status === 'free' ? 'Безкоштовно' : 'Преміум'}
                          </div>
                        </div>
                      </div>
                    ))}
                    <Link to="/" className="view-all-link">
                      Переглянути всі курси
                    </Link>
                  </>
                ) : (
                  <div className="no-recommended">
                    <p>Немає рекомендованих курсів на даний момент.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Dashboard;