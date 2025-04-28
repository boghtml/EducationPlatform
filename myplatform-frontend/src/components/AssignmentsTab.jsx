import React, { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import axios from 'axios';
import { ClipboardList, Calendar, Clock, Award, Search } from 'lucide-react';
import API_URL from '../api';
import '../css/WorkingWithCourse.css';

function AssignmentsTab() {
  const { course, getCsrfToken } = useOutletContext();
  const [assignments, setAssignments] = useState([]);
  const [filteredAssignments, setFilteredAssignments] = useState([]);
  const [assignmentFilter, setAssignmentFilter] = useState('all');
  const [assignmentSearch, setAssignmentSearch] = useState('');

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        await getCsrfToken();
        const response = await axios.get(`${API_URL}/assignments/student/course/${course.id}/assignments/`, {
          withCredentials: true,
        });
        if (Array.isArray(response.data)) {
          setAssignments(response.data);
          setFilteredAssignments(response.data);
        } else {
          console.error("Invalid assignments data format:", response.data);
          setAssignments([]);
          setFilteredAssignments([]);
        }
      } catch (error) {
        console.error("Error fetching assignments:", error);
        setAssignments([]);
        setFilteredAssignments([]);
      }
    };
    if (course) fetchAssignments();
  }, [course, getCsrfToken]);

  useEffect(() => {
    let filtered = assignments;
    if (assignmentFilter !== 'all') {
      filtered = filtered.filter((a) => a.status === assignmentFilter);
    }
    if (assignmentSearch) {
      filtered = filtered.filter(
        (a) =>
          a.title.toLowerCase().includes(assignmentSearch.toLowerCase()) ||
          a.description?.toLowerCase().includes(assignmentSearch.toLowerCase())
      );
    }
    setFilteredAssignments(filtered);
  }, [assignmentFilter, assignmentSearch, assignments]);

  const formatAssignmentStatus = (status) => {
    switch (status) {
      case 'assigned':
        return { label: 'Призначено', color: '#6c757d' };
      case 'submitted':
        return { label: 'Надіслано', color: '#007bff' };
      case 'graded':
        return { label: 'Оцінено', color: '#28a745' };
      case 'returned':
        return { label: 'Повернуто', color: '#ffc107' };
      default:
        return { label: status, color: '#6c757d' };
    }
  };

  const getTimeRemaining = (dueDate) => {
    if (!dueDate) return "Немає терміну";
    const due = new Date(dueDate);
    const now = new Date();
    if (due < now) return "Прострочено";
    const diffTime = Math.abs(due - now);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Сьогодні";
    if (diffDays === 1) return "Завтра";
    return `${diffDays} днів`;
  };

  return (
    <div className="course-wc-assignments-tab">
      <div className="course-wc-content-header">
        <h2>Завдання курсу</h2>
        <div className="course-wc-content-meta">
          <span><ClipboardList className="course-wc-meta-icon" /> {filteredAssignments.length} завдань</span>
        </div>
      </div>

      <div className="course-wc-assignments-header">
        <div className="course-wc-assignments-filters">
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
          <div className="course-wc-assignments-search-container">
            <Search className="course-wc-search-icon" />
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

      <div className="course-wc-assignments-list">
        {filteredAssignments.length === 0 ? (
          <div className="course-wc-no-content-message">
            <h3>Немає доступних завдань</h3>
            <p>У цьому курсі поки що немає завдань або жодне завдання не відповідає вашим критеріям пошуку.</p>
          </div>
        ) : (
          filteredAssignments.map((assignment) => {
            const statusInfo = formatAssignmentStatus(assignment.status);
            const timeRemaining = getTimeRemaining(assignment.due_date);

            return (
              <div key={assignment.id} className="course-wc-assignment-card">
                <div className="course-wc-assignment-header">
                  <h3 className="course-wc-assignment-title">{assignment.title}</h3>
                  <div
                    className="course-wc-assignment-status"
                    style={{ backgroundColor: statusInfo.color }}
                  >
                    {statusInfo.label}
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
                    <Calendar className="course-wc-meta-icon" />
                    <span>
                      Термін:{' '}
                      {assignment.due_date
                        ? new Date(assignment.due_date).toLocaleDateString('uk-UA')
                        : 'Немає терміну'}
                    </span>
                  </div>

                  <div className="course-wc-meta-item course-wc-time-remaining">
                    <Clock className="course-wc-meta-icon" />
                    <span>{timeRemaining}</span>
                  </div>

                  {assignment.status === 'graded' && (
                    <div className="course-wc-meta-item course-wc-grade">
                      <Award className="course-wc-meta-icon" />
                      <span>Оцінка: {assignment.grade}/100</span>
                    </div>
                  )}
                </div>

                <div className="course-wc-assignment-actions">
                  <Link
                    to={`/assignments/${assignment.id}`}
                    className="course-wc-btn-assignment"
                  >
                    {assignment.status === 'assigned' ? 'Розпочати завдання' : 'Переглянути завдання'}
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default AssignmentsTab;