import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Sidebar, Menu, MenuItem } from 'react-pro-sidebar';
import { Bell, MessageCircle, BookOpen, FileText, Calendar, PlusCircle } from 'lucide-react';
import { useSelector } from 'react-redux';
import Cookies from 'js-cookie';
import API_URL from '../../../api';

function TeacherDashboard() {
  const user = useSelector((state) => state.user.user);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.id) {
      const sessionId = Cookies.get('sessionid'); 
  
      axios.get(`${API_URL}/courses/`, {
        headers: {
          'Cookie': `sessionid=${sessionId}`
        },
        withCredentials: true 
      })
        .then(response => {
          const teacherCourses = response.data.filter(course => course.teacher === user.id);
          setCourses(teacherCourses);
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

  const handleCourseClick = (courseId) => {
    navigate(`/teacher-courses/${courseId}`);
  };

  const handleCreateCourse = () => {
    navigate('/create-course');
  };

  return (
    <div className="dashboard-container">
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <a className="navbar-brand">Best IT School</a>
        <div className="collapse navbar-collapse">
          <ul className="navbar-nav mr-auto">
            <li className="nav-item active">
              <a className="nav-link">Мої курси</a>
            </li>
          </ul>
          <ul className="navbar-nav">
            <li className="nav-item">
              <img src={user?.profileImageUrl || 'https://via.placeholder.com/40'} className="rounded-circle profile-icon" alt="User Icon" />
            </li>
          </ul>
        </div>
      </nav>

      <div className="main-content">
        <Sidebar className="sidebar">
          <Menu>
            <MenuItem icon={<Bell />}>Активність</MenuItem>
            <MenuItem icon={<MessageCircle />}>Чат</MenuItem>
            <MenuItem defaultSelected icon={<BookOpen />}>Курси</MenuItem>
            <MenuItem icon={<FileText />}>Завдання</MenuItem>
            <MenuItem icon={<Calendar />}>Календар</MenuItem>
            <MenuItem icon={<PlusCircle />} onClick={handleCreateCourse}>Створити курс</MenuItem>
          </Menu>
        </Sidebar>

        <div className="container">
          <h1>Курси, які ви створили, {user?.userName}</h1>
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
            <p>Ви ще не створили жодного курсу.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default TeacherDashboard;
