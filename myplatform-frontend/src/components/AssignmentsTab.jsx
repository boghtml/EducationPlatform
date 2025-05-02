import React, { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  ClipboardList, 
  Calendar, 
  Clock, 
  Award, 
  Search, 
  Filter, 
  AlertTriangle, 
  XCircle, 
  CheckCircle, 
  Loader 
} from 'lucide-react';
import API_URL from '../api';
import '../css/WorkingWithCourse.css';

function AssignmentsTab() {
  const { course, getCsrfToken } = useOutletContext();
  const [assignments, setAssignments] = useState([]);
  const [filteredAssignments, setFilteredAssignments] = useState([]);
  const [assignmentFilter, setAssignmentFilter] = useState('all');
  const [assignmentSearch, setAssignmentSearch] = useState('');
  const [sortBy, setSortBy] = useState('dueDate');
  const [sortDirection, setSortDirection] = useState('asc');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statsData, setStatsData] = useState({
    total: 0,
    assigned: 0,
    submitted: 0,
    graded: 0,
    returned: 0
  });

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        setLoading(true);
        await getCsrfToken();
        const response = await axios.get(`${API_URL}/assignments/student/course/${course.id}/assignments/`, {
          withCredentials: true,
        });
        
        if (Array.isArray(response.data)) {
          const assignmentsData = response.data;
          setAssignments(assignmentsData);
          setFilteredAssignments(assignmentsData);
          
          const stats = {
            total: assignmentsData.length,
            assigned: assignmentsData.filter(a => a.status === 'assigned').length,
            submitted: assignmentsData.filter(a => a.status === 'submitted').length,
            graded: assignmentsData.filter(a => a.status === 'graded').length,
            returned: assignmentsData.filter(a => a.status === 'returned').length
          };
          setStatsData(stats);
        } else {
          console.error("Invalid assignments data format:", response.data);
          setAssignments([]);
          setFilteredAssignments([]);
          setError("Отримано некоректні дані завдань");
        }
      } catch (error) {
        console.error("Error fetching assignments:", error);
        setError("Помилка при завантаженні завдань");
      } finally {
        setLoading(false);
      }
    };
    
    if (course && course.id) fetchAssignments();
  }, [course, getCsrfToken]);

  useEffect(() => {
    if (!assignments.length) return;
    
    let filtered = [...assignments];
    
    if (assignmentFilter !== 'all') {
      filtered = filtered.filter((a) => a.status === assignmentFilter);
    }
    
    if (assignmentSearch) {
      const searchTerm = assignmentSearch.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.title.toLowerCase().includes(searchTerm) ||
          a.description?.toLowerCase().includes(searchTerm)
      );
    }
    
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'dueDate':
          
          if (!a.due_date && !b.due_date) comparison = 0;
          else if (!a.due_date) comparison = 1;
          else if (!b.due_date) comparison = -1;
          else comparison = new Date(a.due_date) - new Date(b.due_date);
          break;
          
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
          
        case 'status':
          
          const statusOrder = { assigned: 1, submitted: 2, graded: 3, returned: 4 };
          comparison = statusOrder[a.status] - statusOrder[b.status];
          break;
          
        case 'grade':
          
          if (!a.grade && !b.grade) comparison = 0;
          else if (!a.grade) comparison = 1;
          else if (!b.grade) comparison = -1;
          else comparison = a.grade - b.grade;
          break;
          
        default:
          comparison = new Date(a.due_date) - new Date(b.due_date);
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    
    setFilteredAssignments(filtered);
  }, [assignmentFilter, assignmentSearch, sortBy, sortDirection, assignments]);

  const formatAssignmentStatus = (status) => {
    switch (status) {
      case 'assigned':
        return { label: 'Призначено', color: '#6c757d', icon: <ClipboardList size={16} /> };
      case 'submitted':
        return { label: 'Надіслано', color: '#007bff', icon: <CheckCircle size={16} /> };
      case 'graded':
        return { label: 'Оцінено', color: '#28a745', icon: <Award size={16} /> };
      case 'returned':
        return { label: 'Повернуто', color: '#ffc107', icon: <AlertTriangle size={16} /> };
      default:
        return { label: status, color: '#6c757d', icon: <ClipboardList size={16} /> };
    }
  };

  const getTimeRemaining = (dueDate) => {
    if (!dueDate) return { text: "Без терміну", type: "none" };
    
    const due = new Date(dueDate);
    const now = new Date();
    
    if (due < now) {
      return { text: "Прострочено", type: "overdue" };
    }
    
    const diffTime = Math.abs(due - now);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return { text: "Сьогодні", type: "today" };
    } else if (diffDays === 1) {
      return { text: "Завтра", type: "tomorrow" };
    } else if (diffDays <= 3) {
      return { text: `${diffDays} днів`, type: "soon" };
    } else {
      return { text: `${diffDays} днів`, type: "normal" };
    }
  };

  const toggleSortDirection = () => {
    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
  };

  const handleSortChange = (field) => {
    if (sortBy === field) {
      toggleSortDirection();
    } else {
      setSortBy(field);
      setSortDirection('asc');
    }
  };

  const renderSortDirection = (field) => {
    if (sortBy !== field) return null;
    
    return (
      <span className="sort-direction">
        {sortDirection === 'asc' ? '↑' : '↓'}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Немає терміну";
    const date = new Date(dateString);
    return date.toLocaleDateString('uk-UA', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="course-wc-assignments-tab">
        <div className="course-wc-loading-spinner">
          <Loader className="animate-spin" size={40} />
          <p>Завантаження завдань...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="course-wc-assignments-tab">
        <div className="course-wc-error-container">
          <XCircle size={40} className="text-red-500" />
          <h3>Помилка завантаження</h3>
          <p>{error}</p>
          <button 
            className="course-wc-btn-primary"
            onClick={() => window.location.reload()}
          >
            Спробувати знову
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="course-wc-assignments-tab">
      <div className="course-wc-content-header">
        <h2>Завдання курсу</h2>
        <div className="course-wc-content-meta">
          <span>
            <ClipboardList className="course-wc-meta-icon" /> {statsData.total} завдань загалом
          </span>
        </div>
      </div>

      {/* Assignment Stats */}
      <div className="course-wc-assignment-stats">
        <div className="course-wc-stat-card" onClick={() => setAssignmentFilter('all')}>
          <div className="course-wc-stat-value">{statsData.total}</div>
          <div className="course-wc-stat-label">Всього</div>
        </div>
        <div className="course-wc-stat-card" onClick={() => setAssignmentFilter('assigned')}>
          <div className="course-wc-stat-value">{statsData.assigned}</div>
          <div className="course-wc-stat-label">До виконання</div>
        </div>
        <div className="course-wc-stat-card" onClick={() => setAssignmentFilter('submitted')}>
          <div className="course-wc-stat-value">{statsData.submitted}</div>
          <div className="course-wc-stat-label">Надіслано</div>
        </div>
        <div className="course-wc-stat-card" onClick={() => setAssignmentFilter('graded')}>
          <div className="course-wc-stat-value">{statsData.graded}</div>
          <div className="course-wc-stat-label">Оцінено</div>
        </div>
        <div className="course-wc-stat-card" onClick={() => setAssignmentFilter('returned')}>
          <div className="course-wc-stat-value">{statsData.returned}</div>
          <div className="course-wc-stat-label">Повернуто</div>
        </div>
      </div>

      <div className="course-wc-assignments-header">
        <div className="course-wc-assignments-filters">
          <div className="course-wc-filter-item">
            <Filter size={16} />
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
          </div>
          
          <div className="course-wc-filter-item">
            <div className="course-wc-assignments-search-container">
              <Search className="course-wc-search-icon" size={16} />
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
        
        <div className="course-wc-assignments-sort">
          <div className="course-wc-sort-label">Сортувати за:</div>
          <div className="course-wc-sort-buttons">
            <button 
              className={`course-wc-sort-btn ${sortBy === 'dueDate' ? 'active' : ''}`}
              onClick={() => handleSortChange('dueDate')}
            >
              Терміном {renderSortDirection('dueDate')}
            </button>
            <button 
              className={`course-wc-sort-btn ${sortBy === 'title' ? 'active' : ''}`}
              onClick={() => handleSortChange('title')}
            >
              Назвою {renderSortDirection('title')}
            </button>
            <button 
              className={`course-wc-sort-btn ${sortBy === 'status' ? 'active' : ''}`}
              onClick={() => handleSortChange('status')}
            >
              Статусом {renderSortDirection('status')}
            </button>
            <button 
              className={`course-wc-sort-btn ${sortBy === 'grade' ? 'active' : ''}`}
              onClick={() => handleSortChange('grade')}
            >
              Оцінкою {renderSortDirection('grade')}
            </button>
          </div>
        </div>
      </div>

      {filteredAssignments.length === 0 ? (
        <div className="course-wc-no-content-message">
          <ClipboardList size={40} className="course-wc-icon-large" />
          <h3>Немає доступних завдань</h3>
          <p>У цьому курсі поки що немає завдань або жодне завдання не відповідає вашим критеріям пошуку.</p>
        </div>
      ) : (
        <div className="course-wc-assignments-list-container">
          <div className="course-wc-assignments-list">
            {filteredAssignments.map((assignment) => {
              const statusInfo = formatAssignmentStatus(assignment.status);
              const timeRemaining = getTimeRemaining(assignment.due_date);

              return (
                <div key={assignment.id} className={`course-wc-assignment-card course-wc-assignment-${assignment.status}`}>
                  <div className="course-wc-assignment-header">
                    <h3 className="course-wc-assignment-title">{assignment.title}</h3>
                    <div
                      className="course-wc-assignment-status"
                      style={{ backgroundColor: statusInfo.color }}
                    >
                      {statusInfo.icon}
                      <span>{statusInfo.label}</span>
                    </div>
                  </div>

                  <p className="course-wc-assignment-description">
                    {assignment.description
                      ? assignment.description.length > 150
                        ? `${assignment.description.substring(0, 150)}...`
                        : assignment.description
                      : 'Немає опису.'}
                  </p>

                  <div className="course-wc-assignment-meta">
                    <div className="course-wc-meta-item">
                      <Calendar className="course-wc-meta-icon" size={16} />
                      <span>
                        {assignment.due_date
                          ? formatDate(assignment.due_date)
                          : 'Без терміну'}
                      </span>
                    </div>

                    {assignment.due_date && (
                      <div className={`course-wc-meta-item course-wc-time-remaining course-wc-time-${timeRemaining.type}`}>
                        <Clock className="course-wc-meta-icon" size={16} />
                        <span>{timeRemaining.text}</span>
                      </div>
                    )}

                    {assignment.status === 'graded' && (
                      <div className="course-wc-meta-item course-wc-grade">
                        <Award className="course-wc-meta-icon" size={16} />
                        <span>Оцінка: {assignment.grade}/100</span>
                      </div>
                    )}
                  </div>

                  <div className="course-wc-assignment-actions">
                    <Link
                      to={`/assignments/${assignment.id}`}
                      className="course-wc-btn-assignment"
                    >
                      {assignment.status === 'assigned' 
                        ? 'Розпочати завдання' 
                        : assignment.status === 'submitted'
                        ? 'Переглянути надіслане'
                        : 'Переглянути завдання'}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default AssignmentsTab;