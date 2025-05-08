import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../../api';
import TeacherSidebar from './TeacherSidebar';
import TeacherHeader from './TeacherHeader';
import '../../css/teacher/TeacherDashboard.css';
import { 
  FaGraduationCap, 
  FaTasks, 
  FaUsers, 
  FaChartLine, 
  FaCalendarAlt, 
  FaBookOpen,
  FaSpinner,
  FaExclamationTriangle,
  FaPlus
} from 'react-icons/fa';

function TeacherDashboard() {
  const [user, setUser] = useState({
    id: '',
    name: '',
    email: '',
    profileImageUrl: '',
    role: ''
  });
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    activeAssignments: 0,
    averageProgress: 0,
    submissionsToGrade: 0
  });
  const [courses, setCourses] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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

    if (userRole !== 'teacher') {
      navigate('/dashboard');
      return;
    }

    setUser({
      id: userId,
      name: userName || 'Викладач',
      email: userEmail || '',
      profileImageUrl: profileImageUrl || 'https://via.placeholder.com/40',
      role: userRole || 'teacher'
    });

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        await axios.get(`${API_URL}/get-csrf-token/`, { withCredentials: true });
        
        const coursesResponse = await axios.get(`${API_URL}/courses/`, {
          withCredentials: true,
          params: { teacher_id: userId }
        });
        
        if (coursesResponse.data) {
          setCourses(coursesResponse.data);
          
          const totalStudents = coursesResponse.data.reduce((total, course) => total + (course.students_count || 0), 0);
          
          setStats({
            totalCourses: coursesResponse.data.length,
            totalStudents: totalStudents,
            activeAssignments: Math.floor(Math.random() * 15) + 5, // Тестові дані
            averageProgress: Math.floor(Math.random() * 70) + 20, // Тестові дані
            submissionsToGrade: Math.floor(Math.random() * 20) + 1 // Тестові дані
          });
        }
        
        generateTestData();
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching teacher dashboard data:", error);
        setError("Не вдалося завантажити дані. Будь ласка, спробуйте пізніше.");
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  const generateTestData = () => {
    
    const activities = [
      { type: 'new_student', title: 'Новий студент записався на курс "Основи програмування"', time: '2 години тому' },
      { type: 'submission', title: 'Олександр Петренко надіслав роботу "Проект веб-додатку"', time: '5 годин тому' },
      { type: 'question', title: 'Нове питання у форумі курсу "Розробка мобільних додатків"', time: '1 день тому' },
      { type: 'feedback', title: 'Ви отримали новий відгук на курс "JavaScript для початківців"', time: '2 дні тому' },
      { type: 'graded', title: 'Ви оцінили 5 робіт з курсу "Алгоритми та структури даних"', time: '3 дні тому' }
    ];
    
    setRecentActivities(activities);
    
    const today = new Date();
    const deadlines = [
      { 
        title: 'Дедлайн завдання "Фінальний проект"', 
        course: 'Веб-розробка',
        date: new Date(today.getTime() + 1000 * 60 * 60 * 24 * 2), // через 2 дні
        submissions: 15,
        totalStudents: 25
      },
      { 
        title: 'Дедлайн тесту "Основи JavaScript"', 
        course: 'JavaScript для початківців',
        date: new Date(today.getTime() + 1000 * 60 * 60 * 24 * 5), // через 5 днів
        submissions: 8,
        totalStudents: 20
      },
      { 
        title: 'Дедлайн проекту "Мобільний додаток"', 
        course: 'Розробка мобільних додатків',
        date: new Date(today.getTime() + 1000 * 60 * 60 * 24 * 7), // через 7 днів
        submissions: 3,
        totalStudents: 18
      }
    ];
    
    setUpcomingDeadlines(deadlines);
  };

  const formatDate = (date) => {
    if (!date) return 'Не визначено';
    return new Date(date).toLocaleDateString('uk-UA', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getDeadlineStatus = (date) => {
    const today = new Date();
    const deadlineDate = new Date(date);
    const diffDays = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 2) return 'urgent';
    if (diffDays <= 5) return 'approaching';
    return 'normal';
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'new_student':
        return <FaUsers className="activity-icon new-student" />;
      case 'submission':
        return <FaTasks className="activity-icon submission" />;
      case 'question':
        return <FaBookOpen className="activity-icon question" />;
      case 'feedback':
        return <FaChartLine className="activity-icon feedback" />;
      case 'graded':
        return <FaGraduationCap className="activity-icon graded" />;
      default:
        return <FaCalendarAlt className="activity-icon" />;
    }
  };

  if (loading) {
    return (
      <div className="teacher-dashboard-wrapper">
        <TeacherHeader />
        <div className="teacher-dashboard-container">
          <TeacherSidebar />
          <div className="teacher-dashboard-loading">
            <FaSpinner className="loading-spinner" />
            <p>Завантаження даних...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="teacher-dashboard-wrapper">
        <TeacherHeader />
        <div className="teacher-dashboard-container">
          <TeacherSidebar />
          <div className="teacher-dashboard-error">
            <FaExclamationTriangle />
            <h3>Помилка завантаження</h3>
            <p>{error}</p>
            <button 
              className="btn-primary"
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
    <div className="teacher-dashboard-wrapper">
      <TeacherHeader />
      
      <div className="teacher-dashboard-container">
        <TeacherSidebar />
        
        <div className="teacher-dashboard-content">
          <div className="teacher-dashboard-welcome">
            <div>
              <h1>Вітаємо, {user.name}!</h1>
              <p>Це ваша викладацька панель управління. Тут ви можете керувати курсами, завданнями та переглядати статистику.</p>
            </div>
            <Link to="/teacher/courses/create" className="btn-create-course">
              <FaPlus /> Створити новий курс
            </Link>
          </div>
          
          {/* Статистика */}
          <div className="teacher-stats-section">
            <div className="teacher-stat-card">
              <div className="teacher-stat-icon courses">
                <FaGraduationCap />
              </div>
              <div className="teacher-stat-content">
                <h3>{stats.totalCourses}</h3>
                <p>Курсів</p>
              </div>
            </div>
            
            <div className="teacher-stat-card">
              <div className="teacher-stat-icon students">
                <FaUsers />
              </div>
              <div className="teacher-stat-content">
                <h3>{stats.totalStudents}</h3>
                <p>Студентів</p>
              </div>
            </div>
            
            <div className="teacher-stat-card">
              <div className="teacher-stat-icon assignments">
                <FaTasks />
              </div>
              <div className="teacher-stat-content">
                <h3>{stats.activeAssignments}</h3>
                <p>Активних завдань</p>
              </div>
            </div>
            
            <div className="teacher-stat-card">
              <div className="teacher-stat-icon submissions">
                <FaBookOpen />
              </div>
              <div className="teacher-stat-content">
                <h3>{stats.submissionsToGrade}</h3>
                <p>Робіт на перевірку</p>
              </div>
            </div>
            
            <div className="teacher-stat-card">
              <div className="teacher-stat-icon progress">
                <FaChartLine />
              </div>
              <div className="teacher-stat-content">
                <h3>{stats.averageProgress}%</h3>
                <p>Середній прогрес</p>
              </div>
            </div>
          </div>
          
          {/* Основний контент */}
          <div className="teacher-dashboard-main">
            {/* Секція курсів */}
            <div className="teacher-courses-section">
              <div className="section-header">
                <h2>Мої курси</h2>
                <Link to="/teacher/courses" className="view-all-link">
                  Переглянути всі
                </Link>
              </div>
              
              {courses.length === 0 ? (
                <div className="no-courses">
                  <div className="no-courses-content">
                    <FaGraduationCap className="no-courses-icon" />
                    <h3>У вас поки немає курсів</h3>
                    <p>Створіть свій перший курс, щоб почати викладання</p>
                    <Link to="/teacher/courses/create" className="btn-primary">
                      Створити курс
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="teacher-courses-grid">
                  {courses.slice(0, 3).map(course => (
                    <div className="teacher-course-card" key={course.id}>
                      <div className="teacher-course-image-container">
                        <img 
                          src={course.image_url || 'https://via.placeholder.com/300x150?text=Курс'} 
                          alt={course.title} 
                          className="teacher-course-image" 
                        />
                        <div className={`teacher-course-status ${course.status}`}>
                          {course.status === 'free' ? 'Безкоштовно' : 'Преміум'}
                        </div>
                      </div>
                      
                      <div className="teacher-course-content">
                        <h3 className="teacher-course-title">{course.title}</h3>
                        
                        <div className="teacher-course-meta">
                          <div className="meta-item">
                            <FaUsers /> {course.students_count || 0} студентів
                          </div>
                          <div className="meta-item">
                            <FaCalendarAlt /> Створено: {formatDate(course.created_at)}
                          </div>
                        </div>
                        
                        <div className="teacher-course-actions">
                          <Link to={`/teacher/courses/${course.id}`} className="btn-secondary">
                            Управління
                          </Link>
                          <Link to={`/teacher/courses/${course.id}/analytics`} className="btn-outline">
                            Аналітика
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Панель справа */}
            <div className="teacher-dashboard-sidebar">
              {/* Останні активності */}
              <div className="teacher-recent-activities">
                <h3>Остання активність</h3>
                {recentActivities.length > 0 ? (
                  <ul className="teacher-activities-list">
                    {recentActivities.map((activity, index) => (
                      <li className="teacher-activity-item" key={index}>
                        {getActivityIcon(activity.type)}
                        <div className="teacher-activity-content">
                          <p className="teacher-activity-title">{activity.title}</p>
                          <span className="teacher-activity-time">{activity.time}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="teacher-no-data">
                    <p>Немає нових активностей</p>
                  </div>
                )}
              </div>
              
              {/* Майбутні дедлайни */}
              <div className="teacher-upcoming-deadlines">
                <h3>Майбутні дедлайни</h3>
                {upcomingDeadlines.length > 0 ? (
                  <ul className="teacher-deadlines-list">
                    {upcomingDeadlines.map((deadline, index) => (
                      <li className={`teacher-deadline-item ${getDeadlineStatus(deadline.date)}`} key={index}>
                        <div className="teacher-deadline-date">
                          <FaCalendarAlt />
                          <span>{formatDate(deadline.date)}</span>
                        </div>
                        <div className="teacher-deadline-content">
                          <h4>{deadline.title}</h4>
                          <p>Курс: {deadline.course}</p>
                          <div className="teacher-deadline-progress">
                            <div className="teacher-progress-text">
                              Здано: {deadline.submissions} з {deadline.totalStudents}
                            </div>
                            <div className="teacher-progress-bar">
                              <div 
                                className="teacher-progress-fill"
                                style={{ width: `${(deadline.submissions / deadline.totalStudents) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="teacher-no-data">
                    <p>Немає найближчих дедлайнів</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TeacherDashboard;