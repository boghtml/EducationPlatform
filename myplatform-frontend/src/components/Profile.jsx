import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { User, Mail, Book, Clock, Award, ChevronDown } from 'lucide-react';
import API_URL from '../api';
import '../css/WorkingWithCourse.css';

function Profile() {
  const [user, setUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { userId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const userResponse = await axios.get(`${API_URL}/users/student/${userId}/`, { withCredentials: true });
        setUser(userResponse.data);
        const coursesResponse = await axios.get(`${API_URL}/users/${userId}/courses/`, { withCredentials: true });
        setCourses(coursesResponse.data || []);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching profile:", error);
        setError("Не вдалося завантажити профіль. Спробуйте знову.");
        setLoading(false);
      }
    };
    fetchProfile();
  }, [userId]);

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
              src={user.profile_image_url || 'https://via.placeholder.com/150'}
              alt={user.username}
              className="course-wc-profile-avatar"
            />
            <div className="course-wc-profile-info">
              <h2 className="course-wc-profile-name">
                {user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : user.username}
              </h2>
              <span className="course-wc-profile-role">{user.role || 'Користувач'}</span>
              <div className="course-wc-profile-meta">
                <span><Mail className="course-wc-meta-icon" /> {user.email}</span>
                <span><Clock className="course-wc-meta-icon" /> Зареєстровано: {new Date(user.date_joined).toLocaleDateString('uk-UA')}</span>
              </div>
            </div>
          </div>

          <div className="course-wc-profile-content">
            <div className="course-wc-profile-section">
              <h3>Про себе</h3>
              <p>{user.bio || 'Користувач не додав інформацію про себе.'}</p>
            </div>

            <div className="course-wc-profile-section">
              <h3>Курси</h3>
              {courses.length === 0 ? (
                <p>Користувач не зареєстрований на жодному курсі.</p>
              ) : (
                <div className="course-wc-profile-courses">
                  {courses.map(course => (
                    <div key={course.id} className="course-wc-profile-course-card">
                      <img
                        src={course.image_url || 'https://via.placeholder.com/100'}
                        alt={course.title}
                        className="course-wc-profile-course-image"
                      />
                      <div className="course-wc-profile-course-info">
                        <h4>{course.title}</h4>
                        <p>{course.description?.substring(0, 100)}...</p>
                        <span><Book className="course-wc-meta-icon" /> {course.role}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="course-wc-profile-section">
              <h3>Досягнення</h3>
              <div className="course-wc-profile-achievements">
                <div className="course-wc-profile-achievement">
                  <Award className="course-wc-meta-icon" />
                  <span>Завершено 5 курсів</span>
                </div>
                <div className="course-wc-profile-achievement">
                  <Award className="course-wc-meta-icon" />
                  <span>Отримано 3 сертифікати</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Profile;