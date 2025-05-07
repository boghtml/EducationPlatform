import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { 
  User, 
  Mail, 
  Book, 
  Clock, 
  Award, 
  ChevronDown, 
  Calendar, 
  Phone, 
  MapPin,
  Briefcase,
  FileText,
  Globe,
  AlertCircle
} from 'lucide-react';
import API_URL from '../api';
import '../css/WorkingWithCourse.css';
import '../css/Profile.css';
import { getDefaultAvatar } from '../utils/userUtils';

function Profile() {
  const [user, setUser] = useState(null);
  const [userDetails, setUserDetails] = useState({
    courses: [],
    bio: '',
    stats: {
      completed_courses: 0,
      active_courses: 0,
      total_assignments: 0,
      completed_assignments: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { userId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const searchParams = new URLSearchParams(location.search);
  const userRole = searchParams.get('role') || 'student';

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        
        let userEndpoint;
        switch(userRole) {
          case 'teacher':
            userEndpoint = `${API_URL}/users/teacher/${userId}/`;
            break;
          case 'admin':
            userEndpoint = `${API_URL}/users/admin/${userId}/`;
            break;
          case 'student':
          default:
            userEndpoint = `${API_URL}/users/student/${userId}/`;
            break;
        }
        
        const userResponse = await axios.get(userEndpoint, { withCredentials: true });
        
        if (userResponse.data && userResponse.data.data) {
          setUser(userResponse.data.data);
        } else if (userResponse.data) {
          setUser(userResponse.data);
        } else {
          throw new Error("Invalid user data format");
        }
        
        // Fetch user courses
        try {
          const coursesResponse = await axios.get(`${API_URL}/users/${userId}/courses/`, { withCredentials: true });
          if (coursesResponse.data) {
            setUserDetails(prev => ({
              ...prev,
              courses: Array.isArray(coursesResponse.data) ? coursesResponse.data : [],
              stats: {
                ...prev.stats,
                active_courses: Array.isArray(coursesResponse.data) ? 
                  coursesResponse.data.filter(c => 
                    (c.completed_lessons / c.total_lessons) < 1 && (c.completed_lessons / c.total_lessons) > 0
                  ).length : 0,
                completed_courses: Array.isArray(coursesResponse.data) ? 
                  coursesResponse.data.filter(c => 
                    c.completed_lessons === c.total_lessons && c.total_lessons > 0
                  ).length : 0
              }
            }));
          }
        } catch (coursesError) {
          console.error("Error fetching user courses:", coursesError);
          // Non-critical error, continue without courses data
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching profile:", error);
        setError("Не вдалося завантажити профіль. Спробуйте знову.");
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, [userId, userRole]);

  const getUserDisplayName = (user) => {
    if (!user) return '';
    return user.first_name && user.last_name 
      ? `${user.first_name} ${user.last_name}` 
      : user.username;
  };

  const getUserAvatar = (user) => {
    if (!user) return '';
    if (user.profile_image_url) {
      return user.profile_image_url;
    }
    
    const displayName = getUserDisplayName(user);
    return getDefaultAvatar(displayName, user.role || userRole);
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

  const calculateProgress = (completedLessons, totalLessons) => {
    if (!totalLessons || totalLessons === 0) return 0;
    return Math.round((completedLessons / totalLessons) * 100);
  };

  if (loading) {
    return (
      <div className="course-wc-interface-container">
        <div className="course-wc-loading-spinner">
          <div className="course-wc-spinner"></div>
          <p>Завантаження профілю...</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="course-wc-interface-container">
        <div className="course-wc-error-container">
          <div className="course-wc-error-icon">!</div>
          <h3>{error ? 'Помилка завантаження' : 'Користувач не знайдений'}</h3>
          <p>{error || 'Запитаний профіль не знайдено. Можливо, користувача не існує.'}</p>
          <button className="course-wc-btn-primary" onClick={() => navigate(-1)}>
            Повернутися назад
          </button>
        </div>
      </div>
    );
  }

  const getRoleName = (role) => {
    switch(role) {
      case 'teacher': return 'Викладач';
      case 'admin': return 'Адміністратор';
      case 'student': return 'Студент';
      default: return role || 'Користувач';
    }
  };

  return (
    <div className="course-wc-interface-container">
      <main className="course-wc-content">
        <div className="course-wc-profile">
          <button 
            className="course-wc-back-button"
            onClick={() => navigate(-1)}
          >
            <ChevronDown className="course-wc-back-icon" /> Назад
          </button>
          
          <div className="course-wc-profile-header">
            <img
              src={getUserAvatar(user)}
              alt={getUserDisplayName(user)}
              className="course-wc-profile-avatar"
            />
            <div className="course-wc-profile-info">
              <h2 className="course-wc-profile-name">
                {getUserDisplayName(user)}
              </h2>
              <span className="course-wc-profile-role">{getRoleName(user.role || userRole)}</span>
              <div className="course-wc-profile-meta">
                <span><Mail className="course-wc-meta-icon" /> {user.email}</span>
                {user.phone_number && (
                  <span><Phone className="course-wc-meta-icon" /> {user.phone_number}</span>
                )}
                <span><Calendar className="course-wc-meta-icon" /> Зареєстровано: {formatDate(user.date_joined)}</span>
                {user.last_login && (
                  <span><Clock className="course-wc-meta-icon" /> Останній вхід: {formatDate(user.last_login)}</span>
                )}
              </div>
            </div>
          </div>

          {/* User Stats Section */}
          {userRole === 'student' && (
            <div className="course-wc-profile-stats">
              <div className="course-wc-profile-stat-card">
                <div className="course-wc-stat-icon courses">
                  <Book />
                </div>
                <div className="course-wc-stat-content">
                  <h3>{userDetails.courses.length}</h3>
                  <p>Усього курсів</p>
                </div>
              </div>
              
              <div className="course-wc-profile-stat-card">
                <div className="course-wc-stat-icon active">
                  <Clock />
                </div>
                <div className="course-wc-stat-content">
                  <h3>{userDetails.stats.active_courses}</h3>
                  <p>Активних курсів</p>
                </div>
              </div>
              
              <div className="course-wc-profile-stat-card">
                <div className="course-wc-stat-icon completed">
                  <Award />
                </div>
                <div className="course-wc-stat-content">
                  <h3>{userDetails.stats.completed_courses}</h3>
                  <p>Завершених курсів</p>
                </div>
              </div>
            </div>
          )}

          <div className="course-wc-profile-content">
            <div className="course-wc-profile-section">
              <h3>Про {userRole === 'teacher' ? 'викладача' : userRole === 'admin' ? 'адміністратора' : 'студента'}</h3>
              <p>{user.bio || `Користувач не додав інформацію про себе.`}</p>
            </div>

            <div className="course-wc-profile-section">
              <h3>{userRole === 'teacher' ? 'Курси викладача' : 'Курси користувача'}</h3>
              {userDetails.courses.length === 0 ? (
                <div className="course-wc-no-courses">
                  <AlertCircle className="course-wc-no-courses-icon" />
                  <p>Користувач не має жодного курсу</p>
                </div>
              ) : (
                <div className="course-wc-profile-courses">
                  {userDetails.courses.map(course => (
                    <div key={course.id} className="course-wc-profile-course-card" onClick={() => navigate(`/courses/${course.id}`)}>
                      <img
                        src={course.image_url || getDefaultAvatar(course.title, 'course')}
                        alt={course.title}
                        className="course-wc-profile-course-image"
                      />
                      <div className="course-wc-profile-course-info">
                        <h4>{course.title}</h4>
                        <p>{course.description?.substring(0, 100)}...</p>
                        
                        {userRole === 'student' && course.completed_lessons !== undefined && course.total_lessons !== undefined && (
                          <div className="course-wc-profile-course-progress">
                            <div className="profile-progress-bar">
                              <div 
                                className="profile-progress-fill"
                                style={{ width: `${calculateProgress(course.completed_lessons, course.total_lessons)}%` }}
                              ></div>
                            </div>
                            <span className="profile-progress-text">
                              {calculateProgress(course.completed_lessons, course.total_lessons)}% завершено
                            </span>
                          </div>
                        )}
                        
                        <div className="course-wc-profile-course-meta">
                          <span><Book className="course-wc-meta-icon" /> {course.total_lessons || 0} уроків</span>
                          <span><Calendar className="course-wc-meta-icon" /> Початок: {formatDate(course.start_date)}</span>
                          {course.status && (
                            <span className={`course-wc-profile-course-status ${course.status}`}>
                              {course.status === 'free' ? 'Безкоштовний' : 'Преміум'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {userRole === 'student' && (
              <div className="course-wc-profile-section">
                <h3>Досягнення</h3>
                <div className="course-wc-profile-achievements">
                  {userDetails.stats.completed_courses > 0 ? (
                    <>
                      <div className="course-wc-profile-achievement">
                        <Award className="course-wc-achievement-icon" />
                        <span>Завершено {userDetails.stats.completed_courses} {
                          userDetails.stats.completed_courses === 1 ? 'курс' : 
                          userDetails.stats.completed_courses < 5 ? 'курси' : 'курсів'
                        }</span>
                      </div>
                      
                      {userDetails.stats.completed_courses >= 5 && (
                        <div className="course-wc-profile-achievement">
                          <Award className="course-wc-achievement-icon gold" />
                          <span>Золота відзнака навчання</span>
                        </div>
                      )}
                      
                      {userDetails.stats.completed_courses >= 3 && (
                        <div className="course-wc-profile-achievement">
                          <Award className="course-wc-achievement-icon silver" />
                          <span>Срібна відзнака завзятості</span>
                        </div>
                      )}
                    </>
                  ) : (
                    <p>Користувач ще не отримав жодних досягнень</p>
                  )}
                </div>
              </div>
            )}
            
            {userRole === 'teacher' && (
              <div className="course-wc-profile-section">
                <h3>Спеціалізація</h3>
                <div className="course-wc-profile-specializations">
                  {user.specializations ? (
                    <ul className="course-wc-specialization-list">
                      {user.specializations.map((spec, index) => (
                        <li key={index} className="course-wc-specialization-item">
                          <Briefcase className="course-wc-meta-icon" />
                          <span>{spec}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>Інформація про спеціалізацію не вказана</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default Profile;