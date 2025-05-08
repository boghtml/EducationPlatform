import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../../api';
import TeacherSidebar from './TeacherSidebar';
import TeacherHeader from './TeacherHeader';
import '../../css/teacher/TeacherStudents.css';

import { 
  FaUsers, 
  FaGraduationCap, 
  FaSearch, 
  FaFilter, 
  FaSpinner,
  FaExclamationTriangle,
  FaUserGraduate,
  FaEnvelope,
  FaPhone,
  FaCalendarAlt,
  FaClock,
  FaChartLine,
  FaBook,
  FaClipboardList,
  FaSortAlphaDown,
  FaSortAlphaUp,
  FaSortNumericDown,
  FaSortNumericUp,
  FaUserPlus
} from 'react-icons/fa';

function TeacherStudents() {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [courseFilter, setCourseFilter] = useState('all');
  const [activityFilter, setActivityFilter] = useState('all');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [studentDetails, setStudentDetails] = useState(null);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [loadingStudent, setLoadingStudent] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    
    const userRole = sessionStorage.getItem('userRole');
    
    if (userRole !== 'teacher') {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        
        await axios.get(`${API_URL}/get-csrf-token/`, { withCredentials: true });
        
        const coursesResponse = await axios.get(`${API_URL}/courses/`, {
          withCredentials: true,
          params: { teacher_id: sessionStorage.getItem('userId') }
        });
        
        if (coursesResponse.data) {
          setCourses(coursesResponse.data);
        }
        
        const studentsData = [];
        for (const course of coursesResponse.data) {
          const studentsResponse = await axios.get(`${API_URL}/course/${course.id}/participants/`, {
            withCredentials: true
          });
          
          if (studentsResponse.data && studentsResponse.data.students) {
            studentsResponse.data.students.forEach(student => {
                
              student.courses = student.courses || [];
              if (!student.courses.some(c => c.id === course.id)) {
                student.courses.push({
                  id: course.id,
                  title: course.title
                });
              }
              
              const existingStudentIndex = studentsData.findIndex(s => s.id === student.id);
              if (existingStudentIndex >= 0) {
                
                studentsData[existingStudentIndex].courses = [
                  ...studentsData[existingStudentIndex].courses,
                  ...student.courses.filter(c => !studentsData[existingStudentIndex].courses.some(sc => sc.id === c.id))
                ];
              } else {
                
                studentsData.push(student);
              }
            });
          }
        }
        
        setStudents(studentsData);
        setFilteredStudents(studentsData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching teacher students data:", error);
        setError("Не вдалося завантажити дані. Будь ласка, спробуйте пізніше.");
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  useEffect(() => {
    if (!students.length) return;
    
    let results = [...students];
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(student => 
        student.first_name?.toLowerCase().includes(query) ||
        student.last_name?.toLowerCase().includes(query) ||
        student.username?.toLowerCase().includes(query) ||
        student.email?.toLowerCase().includes(query)
      );
    }
    
    if (courseFilter !== 'all') {
      results = results.filter(student => 
        student.courses && student.courses.some(course => course.id.toString() === courseFilter)
      );
    }
    
    if (activityFilter !== 'all') {
      const now = new Date();
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      
      results = results.filter(student => {
        const lastLogin = student.last_login ? new Date(student.last_login) : null;
        
        if (activityFilter === 'active' && lastLogin && lastLogin > lastMonth) {
          return true;
        } else if (activityFilter === 'inactive' && (!lastLogin || lastLogin <= lastMonth)) {
          return true;
        }
        
        return false;
      });
    }
    
    results.sort((a, b) => {
      let fieldA, fieldB;
      
      switch (sortField) {
        case 'name':
          fieldA = `${a.first_name || ''} ${a.last_name || ''}`.trim().toLowerCase();
          fieldB = `${b.first_name || ''} ${b.last_name || ''}`.trim().toLowerCase();
          break;
        case 'email':
          fieldA = (a.email || '').toLowerCase();
          fieldB = (b.email || '').toLowerCase();
          break;
        case 'date':
          fieldA = a.date_joined ? new Date(a.date_joined) : new Date(0);
          fieldB = b.date_joined ? new Date(b.date_joined) : new Date(0);
          break;
        case 'courses':
          fieldA = a.courses ? a.courses.length : 0;
          fieldB = b.courses ? b.courses.length : 0;
          break;
        case 'last_login':
          fieldA = a.last_login ? new Date(a.last_login) : new Date(0);
          fieldB = b.last_login ? new Date(b.last_login) : new Date(0);
          break;
        default:
          fieldA = a.id;
          fieldB = b.id;
      }
      
      if (sortDirection === 'asc') {
        return fieldA > fieldB ? 1 : fieldA < fieldB ? -1 : 0;
      } else {
        return fieldA < fieldB ? 1 : fieldA > fieldB ? -1 : 0;
      }
    });
    
    setFilteredStudents(results);
  }, [students, searchQuery, courseFilter, activityFilter, sortField, sortDirection]);

  const handleSort = (field) => {
    if (sortField === field) {
        
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
        
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleStudentClick = async (studentId) => {
    try {
      setLoadingStudent(true);
      
      await axios.get(`${API_URL}/get-csrf-token/`, { withCredentials: true });
      
      const response = await axios.get(`${API_URL}/users/student/${studentId}/`, {
        withCredentials: true
      });
      
      if (response.data && response.data.data) {
        setStudentDetails(response.data.data);
        setShowStudentModal(true);
      }
      
      setLoadingStudent(false);
    } catch (error) {
      console.error("Error fetching student details:", error);
      setLoadingStudent(false);
    }
  };

  const closeStudentModal = () => {
    setShowStudentModal(false);
    setStudentDetails(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Не вказано';
    return new Date(dateString).toLocaleDateString('uk-UA', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getActivityStatus = (lastLogin) => {
    if (!lastLogin) return { status: 'inactive', label: 'Неактивний' };
    
    const now = new Date();
    const loginDate = new Date(lastLogin);
    const diffDays = Math.floor((now - loginDate) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 7) {
      return { status: 'active', label: 'Активний' };
    } else if (diffDays < 30) {
      return { status: 'semi-active', label: 'Середня активність' };
    } else {
      return { status: 'inactive', label: 'Неактивний' };
    }
  };

  if (loading) {
    return (
      <div className="teacher-students-wrapper">
        <TeacherHeader />
        <div className="teacher-students-container">
          <TeacherSidebar />
          <div className="teacher-students-loading">
            <FaSpinner className="loading-spinner" />
            <p>Завантаження студентів...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="teacher-students-wrapper">
        <TeacherHeader />
        <div className="teacher-students-container">
          <TeacherSidebar />
          <div className="teacher-students-error">
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
    <div className="teacher-students-wrapper">
      <TeacherHeader />
      
      <div className="teacher-students-container">
        <TeacherSidebar />
        
        <div className="teacher-students-content">
          <div className="teacher-students-header">
            <h1>Управління студентами</h1>
            
            <button className="btn-invite-student">
              <FaUserPlus /> Запросити студента
            </button>
          </div>
          
          <div className="teacher-students-filters">
            <div className="search-filter">
              <div className="search-input-container">
                <FaSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Пошук студентів..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
              </div>
            </div>
            
            <div className="course-filter">
              <FaGraduationCap className="filter-icon" />
              <select
                value={courseFilter}
                onChange={(e) => setCourseFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">Всі курси</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id.toString()}>
                    {course.title}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="activity-filter">
              <FaFilter className="filter-icon" />
              <select
                value={activityFilter}
                onChange={(e) => setActivityFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">Вся активність</option>
                <option value="active">Активні</option>
                <option value="inactive">Неактивні</option>
              </select>
            </div>
          </div>
          
          {filteredStudents.length === 0 ? (
            <div className="no-students-found">
              <FaUsers className="no-students-icon" />
              <h3>Студенти не знайдені</h3>
              <p>
                {students.length === 0
                  ? "На ваші курси поки немає записаних студентів."
                  : "Не знайдено студентів за вашим запитом. Спробуйте змінити параметри фільтрації."}
              </p>
            </div>
          ) : (
            <div className="teacher-students-table-container">
              <table className="teacher-students-table">
                <thead>
                  <tr>
                    <th className="sortable" onClick={() => handleSort('name')}>
                      Студент
                      {sortField === 'name' && (
                        sortDirection === 'asc' ? <FaSortAlphaDown className="sort-icon" /> : <FaSortAlphaUp className="sort-icon" />
                      )}
                    </th>
                    <th className="sortable" onClick={() => handleSort('email')}>
                      Email
                      {sortField === 'email' && (
                        sortDirection === 'asc' ? <FaSortAlphaDown className="sort-icon" /> : <FaSortAlphaUp className="sort-icon" />
                      )}
                    </th>
                    <th className="sortable" onClick={() => handleSort('courses')}>
                      Курси
                      {sortField === 'courses' && (
                        sortDirection === 'asc' ? <FaSortNumericDown className="sort-icon" /> : <FaSortNumericUp className="sort-icon" />
                      )}
                    </th>
                    <th className="sortable" onClick={() => handleSort('date')}>
                      Дата реєстрації
                      {sortField === 'date' && (
                        sortDirection === 'asc' ? <FaSortNumericDown className="sort-icon" /> : <FaSortNumericUp className="sort-icon" />
                      )}
                    </th>
                    <th className="sortable" onClick={() => handleSort('last_login')}>
                      Остання активність
                      {sortField === 'last_login' && (
                        sortDirection === 'asc' ? <FaSortNumericDown className="sort-icon" /> : <FaSortNumericUp className="sort-icon" />
                      )}
                    </th>
                    <th>Статус</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map(student => {
                    const activityStatus = getActivityStatus(student.last_login);
                    
                    return (
                      <tr key={student.id} onClick={() => handleStudentClick(student.id)}>
                        <td className="student-info-cell">
                          <img
                            src={student.profile_image_url || 'https://via.placeholder.com/40?text=S'}
                            alt={student.username}
                            className="student-avatar"
                          />
                          <div className="student-details">
                            <div className="student-name">
                              {student.first_name && student.last_name 
                                ? `${student.first_name} ${student.last_name}`
                                : student.username}
                            </div>
                            <div className="student-username">@{student.username}</div>
                          </div>
                        </td>
                        <td>
                          <div className="student-email">
                            <FaEnvelope className="email-icon" />
                            <span>{student.email}</span>
                          </div>
                        </td>
                        <td>
                          <div className="student-courses">
                            <FaGraduationCap className="courses-icon" />
                            <span>
                              {student.courses ? student.courses.length : 0} курсів
                            </span>
                          </div>
                        </td>
                        <td>
                          <div className="student-registration">
                            <FaCalendarAlt className="calendar-icon" />
                            <span>{formatDate(student.date_joined)}</span>
                          </div>
                        </td>
                        <td>
                          <div className="student-last-activity">
                            <FaClock className="clock-icon" />
                            <span>
                              {student.last_login 
                                ? formatDate(student.last_login)
                                : 'Ніколи не входив'}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div className={`student-status ${activityStatus.status}`}>
                            {activityStatus.label}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      
      {/* Модальне вікно з детальною інформацією про студента */}
      {showStudentModal && studentDetails && (
        <div className="student-details-modal">
          <div className="student-details-content">
            <div className="student-details-header">
              <h2>Інформація про студента</h2>
              <button 
                className="close-button"
                onClick={closeStudentModal}
              >
                &times;
              </button>
            </div>
            
            <div className="student-details-body">
              <div className="student-profile-section">
                <div className="student-profile-image">
                  <img 
                    src={studentDetails.profile_image_url || 'https://via.placeholder.com/150?text=S'} 
                    alt={studentDetails.username}
                  />
                </div>
                
                <div className="student-profile-info">
                  <h3>
                    {studentDetails.first_name && studentDetails.last_name 
                      ? `${studentDetails.first_name} ${studentDetails.last_name}` 
                      : studentDetails.username}
                  </h3>
                  <p className="student-username">@{studentDetails.username}</p>
                  
                  <div className="student-contact-info">
                    <div className="contact-item">
                      <FaEnvelope />
                      <span>{studentDetails.email}</span>
                    </div>
                    
                    {studentDetails.phone_number && (
                      <div className="contact-item">
                        <FaPhone />
                        <span>{studentDetails.phone_number}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="student-stats-section">
                <div className="student-stat-item">
                  <div className="stat-icon">
                    <FaGraduationCap />
                  </div>
                  <div className="stat-content">
                    <div className="stat-value">
                      {studentDetails.courses ? studentDetails.courses.length : 0}
                    </div>
                    <div className="stat-label">Курсів</div>
                  </div>
                </div>
                
                <div className="student-stat-item">
                  <div className="stat-icon">
                    <FaBook />
                  </div>
                  <div className="stat-content">
                    <div className="stat-value">
                      {studentDetails.completed_lessons || 0}
                    </div>
                    <div className="stat-label">Завершених уроків</div>
                  </div>
                </div>
                
                <div className="student-stat-item">
                  <div className="stat-icon">
                    <FaClipboardList />
                  </div>
                  <div className="stat-content">
                    <div className="stat-value">
                      {studentDetails.completed_assignments || 0}
                    </div>
                    <div className="stat-label">Виконаних завдань</div>
                  </div>
                </div>
                
                <div className="student-stat-item">
                  <div className="stat-icon">
                    <FaChartLine />
                  </div>
                  <div className="stat-content">
                    <div className="stat-value">
                      {studentDetails.average_grade || 'N/A'}
                    </div>
                    <div className="stat-label">Середня оцінка</div>
                  </div>
                </div>
              </div>
              
              <div className="student-courses-section">
                <h4>Записаний на курси</h4>
                
                {studentDetails.courses && studentDetails.courses.length > 0 ? (
                  <div className="student-courses-list">
                    {studentDetails.courses.map(course => (
                      <div className="student-course-item" key={course.id}>
                        <div className="course-title">{course.title}</div>
                        <div className="course-progress">
                          <div className="progress-label">
                            Прогрес: 
                            <span>
                              {course.progress ? `${course.progress}%` : 'Не розпочато'}
                            </span>
                          </div>
                          <div className="progress-bar">
                            <div 
                              className="progress-fill"
                              style={{ width: `${course.progress || 0}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>Студент не записаний на жодний курс.</p>
                )}
              </div>
              
              <div className="student-additional-info">
                <div className="info-item">
                  <strong>Дата реєстрації:</strong> {formatDate(studentDetails.date_joined)}
                </div>
                <div className="info-item">
                  <strong>Останній вхід:</strong> 
                  {studentDetails.last_login 
                    ? formatDate(studentDetails.last_login)
                    : 'Ніколи не входив'}
                </div>
              </div>
            </div>
            
            <div className="student-details-footer">
              <button 
                className="btn-secondary"
                onClick={closeStudentModal}
              >
                Закрити
              </button>
              <Link 
                to={`/teacher/students/${studentDetails.id}/progress`} 
                className="btn-primary"
              >
                Перегляд прогресу
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TeacherStudents;