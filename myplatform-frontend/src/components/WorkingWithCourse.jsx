import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, Outlet } from 'react-router-dom';
import axios from 'axios';
import { Book, ClipboardList, Edit3, Star, MessageCircle, Users, HelpCircle } from 'lucide-react';
import API_URL from '../api';
import '../css/WorkingWithCourse.css';

function WorkingWithCourse() {
  const [course, setCourse] = useState(null);
  const [courseProgress, setCourseProgress] = useState({
    completed_lessons: 0,
    total_lessons: 0,
    completed_modules: 0,
    total_modules: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { courseId } = useParams();
  const navigate = useNavigate();

  const getCsrfToken = async () => {
    try {
      const response = await axios.get(`${API_URL}/get-csrf-token/`, { withCredentials: true });
      if (response.data && response.data.csrftoken) {
        axios.defaults.headers.common['X-CSRFToken'] = response.data.csrftoken;
        return response.data.csrftoken;
      }
    } catch (error) {
      console.error('Error fetching CSRF token:', error);
    }
    return null;
  };

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

        setLoading(false);
      } catch (error) {
        console.error("Error fetching course:", error);
        setError("Не вдалося завантажити курс. Будь ласка, спробуйте пізніше.");
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [courseId]);

  const calculateProgress = () => {
    if (!courseProgress.total_lessons || courseProgress.total_lessons === 0) return 0;
    return Math.round((courseProgress.completed_lessons / courseProgress.total_lessons) * 100);
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
                <span className="course-wc-stat-value">
                  {courseProgress.completed_lessons}/{courseProgress.total_lessons}
                </span>
                <span className="course-wc-stat-label">Уроків</span>
              </div>
              <div className="course-wc-progress-stat">
                <span className="course-wc-stat-value">
                  {courseProgress.completed_modules}/{courseProgress.total_modules}
                </span>
                <span className="course-wc-stat-label">Модулів</span>
              </div>
            </div>
          </div>
        </div>

        <nav className="course-wc-course-nav">
          <Link
            to={`/my-courses/${courseId}/lessons`}
            className={`course-wc-nav-item ${window.location.pathname.includes('lessons') ? 'active' : ''}`}
          >
            <Book className="course-wc-nav-icon" />
            <span>Матеріали та уроки</span>
          </Link>
          <Link
            to={`/my-courses/${courseId}/assignments`}
            className={`course-wc-nav-item ${window.location.pathname.includes('assignments') ? 'active' : ''}`}
          >
            <ClipboardList className="course-wc-nav-icon" />
            <span>Завдання</span>
          </Link>
          <Link
            to={`/my-courses/${courseId}/tests`}
            className={`course-wc-nav-item ${window.location.pathname.includes('tests') ? 'active' : ''}`}
          >
            <Edit3 className="course-wc-nav-icon" />
            <span>Тести</span>
          </Link>
          <Link
            to={`/my-courses/${courseId}/discussions`}
            className={`course-wc-nav-item ${window.location.pathname.includes('discussions') ? 'active' : ''}`}
          >
            <MessageCircle className="course-wc-nav-icon" />
            <span>Обговорення</span>
          </Link>
          <Link
            to={`/my-courses/${courseId}/qa`}
            className={`course-wc-nav-item ${window.location.pathname.includes('qa') ? 'active' : ''}`}
          >
            <HelpCircle className="course-wc-nav-icon" />
            <span>Q&A Сесії</span>
          </Link>
          <Link
            to={`/my-courses/${courseId}/participants`}
            className={`course-wc-nav-item ${window.location.pathname.includes('participants') ? 'active' : ''}`}
          >
            <Users className="course-wc-nav-icon" />
            <span>Учасники курсу</span>
          </Link>
          <Link
            to={`/my-courses/${courseId}/grades`}
            className={`course-wc-nav-item ${window.location.pathname.includes('grades') ? 'active' : ''}`}
          >
            <Star className="course-wc-nav-icon" />
            <span>Оцінки</span>
          </Link>
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
                {course.teacher
                  ? course.teacher.first_name && course.teacher.last_name
                    ? `${course.teacher.first_name} ${course.teacher.last_name}`
                    : course.teacher.username
                  : 'Невідомий викладач'}
              </span>
            </div>
          </div>
        </div>
      </aside>

      <main className="course-wc-content">
        <Outlet context={{ course, courseProgress, getCsrfToken }} />
      </main>
    </div>
  );
}

export default WorkingWithCourse;