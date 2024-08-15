import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../css/style.css';
import { Link } from 'react-router-dom';

function Dashboard() {
  const [user, setUser] = useState({ name: 'User', email: 'user@example.com', profileImageUrl: 'https://via.placeholder.com/40' });
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userName = sessionStorage.getItem('userName') || 'User';
    const userEmail = sessionStorage.getItem('userEmail') || 'undefined';
    const profileImageUrl = sessionStorage.getItem('profileImageUrl') || 'https://via.placeholder.com/40';
    const userId = sessionStorage.getItem('userId'); // Отримуємо userId з sessionStorage

    setUser({ name: userName, email: userEmail, profileImageUrl: profileImageUrl });
    console.log("User data from session:", { userName, userEmail, profileImageUrl, userId });

    // Отримуємо курси користувача
    if (userId) {
      axios.get(`http://localhost:8000/api/enrollments/user-courses/${userId}/`)
        .then(response => {
          setCourses(response.data.courses);
          setLoading(false);
        })
        .catch(error => {
          console.error("Error fetching courses:", error);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const toggleDropdown = () => {
    const dropdown = document.getElementById('profile-dropdown');
    if (dropdown) {
      dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
    }
  };

  return (
    <div className="dashboard">
      <nav className="dashboard__navbar">
        <a className="dashboard__brand" href="#">Best IT School</a>
        <div className="dashboard__collapse" id="navbarNav">
          <ul className="dashboard__nav">
            <li className="dashboard__nav-item">
              <a className="dashboard__nav-link" href="#">Мої курси</a>
            </li>
            <li className="dashboard__nav-item">
              <a className="dashboard__nav-link" href="/" onClick={(e) => { e.preventDefault(); window.location.href = '/'; }}>Магазин</a>
            </li>
          </ul>
          <form className="dashboard__search-form">
            <input className="dashboard__search-input" type="search" placeholder="Пошук курсів" aria-label="Search" />
          </form>
          <ul className="dashboard__profile-nav">
            <li className="dashboard__profile-item">
              <img src={user.profileImageUrl} className="dashboard__profile-icon" id="profile-icon" alt="User Icon" onClick={toggleDropdown} />
            </li>
          </ul>
        </div>
      </nav>
      <div className="dashboard__profile-dropdown" id="profile-dropdown">
        <div className="dashboard__user-info">
          <p className="dashboard__user-name-email">{user.name} ({user.email})</p>
        </div>
        <a href="profile.html" className="dashboard__profile-link">Профіль</a>
        <a href="#" className="dashboard__profile-link">Мої домашні завдання</a>
        <a href="#" className="dashboard__profile-link">Керування підпискою</a>
        <a href="#" className="dashboard__profile-link">Налаштування</a>
        <a href="#" className="dashboard__profile-link">Вихід</a>
      </div>
      <div className="dashboard__container">
        <h1 className="dashboard__welcome-title">Ласкаво просимо, <span className="dashboard__user-name">{user.name}</span>!</h1>
        {loading ? (
          <p className="dashboard__loading-text">Завантаження курсів...</p>
        ) : courses.length > 0 ? (
          <div className="dashboard__courses-row">
            {courses.map(course => (
              <div className="dashboard__course-col" key={course.id}>
                <div className="dashboard__course-card">
                  <img src={course.image_url} className="dashboard__course-img" alt={course.title} />
                  <div className={`dashboard__badge ${course.status === 'free' ? 'dashboard__badge-free' : 'dashboard__badge-premium'}`}>
                    {course.status}
                  </div>
                  <div className="dashboard__course-body">
                    <Link to={`/courses/${course.id}`} className="dashboard__course-link">
                      <h5 className="dashboard__course-title">{course.title}</h5>
                    </Link>
                    <p className="dashboard__course-description">{course.description}</p>
                    <small className="dashboard__course-duration">{course.duration} тижнів</small>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="dashboard__no-courses-text">У вас немає підписаних курсів.</p>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
