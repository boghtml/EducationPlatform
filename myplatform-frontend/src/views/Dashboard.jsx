import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Sidebar, Menu, MenuItem } from 'react-pro-sidebar';
import { Bell, MessageCircle, BookOpen, FileText, Calendar } from 'lucide-react';
import { useSelector } from 'react-redux';
import '../css/dashboard.css';
import API_URL from '../api';
import Cookies from 'js-cookie';

function Dashboard() {
  const user = useSelector((state) => state.user.user);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();


  useEffect(() => {
    if (user?.id) {
      const sessionId = Cookies.get('sessionid'); 
  
      axios.get(`${API_URL}/enrollments/user-courses/${user.id}/`, {
        headers: {
          'Cookie': `sessionid=${sessionId}`
        },
        withCredentials: true 
      })
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
  }, [user]);
  

  const toggleDropdown = () => {
    const dropdown = document.getElementById('profile-dropdown');
    if (dropdown) {
      dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
    }
  };

  const handleCourseClick = (courseId) => {
    navigate(`/my-courses/${courseId}`);
  };

  return (
    <div className="dashboard-container">
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <a className="navbar-brand">Best IT School</a>
        <div className="collapse navbar-collapse">
          <ul className="navbar-nav mr-auto">
            <li className="nav-item active">
              <a className="nav-link" >Мої курси</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="/" onClick={(e) => { e.preventDefault(); window.location.href = '/'; }}>Магазин</a>
            </li>
          </ul>
          <form className="form-inline my-2 my-lg-0">
            <input className="form-control mr-sm-2" type="search" placeholder="Пошук курсів" aria-label="Search" />
          </form>
          <ul className="navbar-nav">
            <li className="nav-item">
              <img src={user?.profileImageUrl || 'https://via.placeholder.com/40'} className="rounded-circle profile-icon" id="profile-icon" alt="User Icon" onClick={toggleDropdown} />
            </li>
          </ul>
        </div>
      </nav>
      <div className="profile-dropdown" id="profile-dropdown">
        <div id="user-info">
          <p id="user-name-email">{user?.userName} ({user?.userEmail})</p>
        </div>
        <a href="profile.html">Профіль</a>
        <a href="#">Мої домашні завдання</a>
        <a href="#">Керування підпискою</a>
        <a href="#">Налаштування</a>
        <a href="#">Вихід</a>
      </div>

      <div className="main-content">
        <Sidebar className="sidebar">
          <Menu>
            <MenuItem icon={<Bell />}>Активність</MenuItem>
            <MenuItem icon={<MessageCircle />}>Чат</MenuItem>
            <MenuItem defaultSelected icon={<BookOpen />}>Курси</MenuItem>
            <MenuItem icon={<FileText />}>Завдання</MenuItem>
            <MenuItem icon={<Calendar />}>Календар</MenuItem>
          </Menu>
        </Sidebar>

        <div className="container">
          <h1>Ваші курси ! <span id="user-name">{user?.userName}</span></h1>
          <br />
          {loading ? (
            <p>Завантаження курсів...</p>
          ) : courses.length > 0 ? (
            <div className="row">
              {courses.map(course => (
                <div className="col-md-4" key={course.id} onClick={() => handleCourseClick(course.id)}>
                  <div className="card mb-4 shadow-sm position-relative">
                    <img src={course.image_url} className="card-img-top" alt={course.title} />
                    <div className={`badge ${course.status === 'free' ? 'badge-free' : 'badge-premium'}`}>
                      {course.status}
                    </div>
                    <div className="card-body">
                      <h5 className="card-title">{course.title}</h5>
                      <p className="card-text">{course.description}</p>
                      <small className="text-muted">{course.duration} тижнів</small>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>У вас немає підписаних курсів.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
