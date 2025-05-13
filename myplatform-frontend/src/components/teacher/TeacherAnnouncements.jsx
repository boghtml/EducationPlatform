// src/components/teacher/TeacherAnnouncements.jsx

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../../api';
import TeacherSidebar from './TeacherSidebar';
import TeacherHeader from './TeacherHeader';
import {  
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaEye, 
  FaNewspaper, 
  FaBullhorn, 
  FaRegCalendarCheck,
  FaFilter,
  FaSearch,
  FaSpinner,
  FaExclamationTriangle,
  FaSync,
  FaCalendarAlt,
  FaCheckCircle
} from 'react-icons/fa';
import '../../css/teacher/TeacherAnnouncements.css';

function TeacherAnnouncements() {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  // Функція для перевірки валідності URL
  const isValidUrl = (url) => {
    if (!url) return false;
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };

  useEffect(() => {
    // Очищаємо повідомлення про успіх через 3 секунди
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      
      await axios.get(`${API_URL}/get-csrf-token/`, { withCredentials: true });
      
      const response = await axios.get(`${API_URL}/events/events/`, {
        withCredentials: true
      });
      
      console.log("Events data:", response.data);
      
      if (response.data) {
        setEvents(response.data);
        setFilteredEvents(response.data);
      }
      
      setLoading(false);
      setRefreshing(false);
    } catch (error) {
      console.error("Error fetching events:", error);
      setError("Не вдалося завантажити заходи. Будь ласка, спробуйте пізніше.");
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const userRole = sessionStorage.getItem('userRole');
    if (userRole !== 'teacher' && userRole !== 'admin') {
      navigate('/login');
      return;
    }

    fetchEvents();
  }, [navigate]);

  useEffect(() => {
    if (!events.length) return;
    
    let filtered = [...events];
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(event => 
        event.title.toLowerCase().includes(query) || 
        event.description.toLowerCase().includes(query)
      );
    }
    
    if (typeFilter !== 'all') {
      filtered = filtered.filter(event => event.event_type === typeFilter);
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(event => event.status === statusFilter);
    }
    
    setFilteredEvents(filtered);
  }, [events, searchQuery, typeFilter, statusFilter]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('uk-UA', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getEventTypeIcon = (type) => {
    switch (type) {
      case 'event':
        return <FaRegCalendarCheck className="event-icon event" />;
      case 'news':
        return <FaNewspaper className="event-icon news" />;
      case 'announcement':
        return <FaBullhorn className="event-icon announcement" />;
      default:
        return <FaRegCalendarCheck className="event-icon" />;
    }
  };

  const getEventTypeText = (type) => {
    switch (type) {
      case 'event':
        return 'Захід';
      case 'news':
        return 'Новина';
      case 'announcement':
        return 'Оголошення';
      default:
        return 'Захід';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'published':
        return 'Опубліковано';
      case 'draft':
        return 'Чернетка';
      case 'archived':
        return 'Архів';
      default:
        return status;
    }
  };

  const handleDeleteClick = (event) => {
    setEventToDelete(event);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!eventToDelete) return;
    
    try {
      setShowDeleteModal(false);
      
      await axios.get(`${API_URL}/get-csrf-token/`, { withCredentials: true });
      
      await axios.delete(`${API_URL}/events/events/${eventToDelete.id}/`, {
        withCredentials: true
      });
      
      setEvents(events.filter(event => event.id !== eventToDelete.id));
      setEventToDelete(null);
      setSuccessMessage(`Захід "${eventToDelete.title}" успішно видалено`);
    } catch (error) {
      console.error("Error deleting event:", error);
      setError("Не вдалося видалити захід. Будь ласка, спробуйте пізніше.");
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchEvents();
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className="teacher-announcements-wrapper">
      <TeacherHeader />
      
      <div className="teacher-announcements-container">
        <TeacherSidebar />
        
        <div className="teacher-announcements-content">
          <div className="teacher-announcements-header">
            <div className="header-title-section">
              <h1>Управління заходами та оголошеннями</h1>
              <button 
                className="refresh-btn" 
                onClick={handleRefresh} 
                disabled={refreshing}
                title="Оновити список"
              >
                <FaSync className={refreshing ? "spinning" : ""} />
              </button>
            </div>
            
            <Link to="/teacher/announcements/create" className="teacher-announcement-btn-create">
              <FaPlus /> Створити новий
            </Link>
          </div>
          
          {successMessage && (
            <div className="teacher-announcements-success">
              <FaCheckCircle /> {successMessage}
            </div>
          )}
          
          {error && (
            <div className="teacher-announcements-error-message">
              <FaExclamationTriangle /> {error}
            </div>
          )}
          
          <div className="teacher-announcements-filters">
            <div className="teacher-search-box">
              <FaSearch className="search-icon" />
              <input 
                type="text" 
                placeholder="Пошук за назвою або описом" 
                value={searchQuery}
                onChange={handleSearch}
                className="teacher-search-input"
              />
            </div>
            
            <div className="teacher-filter-controls">
              <div className="teacher-filter-group">
                <FaFilter className="filter-icon" />
                <select 
                  value={typeFilter} 
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="teacher-filter-select"
                >
                  <option value="all">Всі типи</option>
                  <option value="event">Заходи</option>
                  <option value="news">Новини</option>
                  <option value="announcement">Оголошення</option>
                </select>
              </div>
              
              <div className="teacher-filter-group">
                <select 
                  value={statusFilter} 
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="teacher-filter-select"
                >
                  <option value="all">Всі статуси</option>
                  <option value="published">Опубліковано</option>
                  <option value="draft">Чернетка</option>
                  <option value="archived">Архів</option>
                </select>
              </div>
            </div>
          </div>
          
          {loading ? (
            <div className="teacher-announcements-loading">
              <FaSpinner className="loading-spinner" />
              <p>Завантаження заходів...</p>
            </div>
          ) : error ? (
            <div className="teacher-announcements-error">
              <FaExclamationTriangle />
              <h3>Помилка завантаження</h3>
              <p>{error}</p>
              <button 
                className="teacher-btn-primary"
                onClick={() => window.location.reload()}
              >
                Спробувати знову
              </button>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="teacher-no-announcements">
              <h3>Заходи не знайдено</h3>
              <p>Наразі немає заходів, які відповідають вашому запиту.</p>
              {searchQuery || typeFilter !== 'all' || statusFilter !== 'all' ? (
                <button 
                  className="teacher-btn-secondary"
                  onClick={() => {
                    setSearchQuery('');
                    setTypeFilter('all');
                    setStatusFilter('all');
                  }}
                >
                  Скинути фільтри
                </button>
              ) : (
                <Link to="/teacher/announcements/create" className="teacher-btn-primary">
                  <FaPlus /> Створити перший захід
                </Link>
              )}
            </div>
          ) : (
            <div className="teacher-announcements-table-container">
              <table className="teacher-announcements-table">
                <thead>
                  <tr>
                    <th className="column-image">Зображення</th>
                    <th>Назва</th>
                    <th>Тип</th>
                    <th>Статус</th>
                    <th>Дата створення</th>
                    <th>Дата проведення</th>
                    <th>Дії</th>
                  </tr>
                </thead>
                <tbody>
                 {filteredEvents.map(event => (
                   <tr key={event.id}>
                     <td className="column-image">
                       {isValidUrl(event.image_url) ? (
                         <img 
                           src={event.image_url} 
                           alt={event.title} 
                           className="event-thumbnail"
                           onError={(e) => {e.target.src = 'https://via.placeholder.com/50x50?text=Захід'}}
                         />
                       ) : (
                         <div className="event-no-image">
                           <FaCalendarAlt />
                         </div>
                       )}
                     </td>
                     <td className="announcement-title">{event.title}</td>
                     <td className="announcement-type">
                       <span className={`type-badge ${event.event_type}`}>
                         {getEventTypeIcon(event.event_type)} {getEventTypeText(event.event_type)}
                       </span>
                     </td>
                     <td className="announcement-status">
                       <span className={`status-badge ${event.status}`}>
                         {getStatusText(event.status)}
                       </span>
                     </td>
                     <td className="announcement-date">{formatDate(event.created_at)}</td>
                     <td className="announcement-date">
                       {event.start_date ? formatDate(event.start_date) : '-'}
                     </td>
                     <td className="announcement-actions">
                       <div className="actions-buttons">
                         <Link to={`/teacher/announcements/edit/${event.id}`} className="action-btn edit" title="Редагувати">
                           <FaEdit />
                         </Link>
                         <Link to={`/events/${event.id}`} className="action-btn view" title="Переглянути">
                           <FaEye />
                         </Link>
                         <button
                           className="action-btn delete"
                           title="Видалити"
                           onClick={() => handleDeleteClick(event)}
                         >
                           <FaTrash />
                         </button>
                       </div>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
         )}
       </div>
     </div>
     
     {showDeleteModal && eventToDelete && (
       <div className="delete-modal-overlay">
         <div className="delete-modal">
           <h3>Підтвердіть видалення</h3>
           <p>Ви впевнені, що хочете видалити "{eventToDelete.title}"?</p>
           <p>Ця дія незворотна.</p>
           
           <div className="delete-modal-actions">
             <button 
               className="btn-cancel"
               onClick={() => {
                 setShowDeleteModal(false);
                 setEventToDelete(null);
               }}
             >
               Скасувати
             </button>
             <button 
               className="btn-delete"
               onClick={handleDeleteConfirm}
             >
               Видалити
             </button>
           </div>
         </div>
       </div>
     )}
   </div>
 );
}

export default TeacherAnnouncements;