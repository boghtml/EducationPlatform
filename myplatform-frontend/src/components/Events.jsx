// src/components/Events.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../api';
import Header from './Header';
import Footer from './Footer';
import { 
  FaCalendarAlt, 
  FaClock, 
  FaMapMarkerAlt, 
  FaUser, 
  FaSearch,
  FaFilter,
  FaSpinner,
  FaExclamationTriangle,
  FaBullhorn,
  FaNewspaper,
  FaRegCalendarCheck,
  FaAngleRight,
  FaSync
} from 'react-icons/fa';
import '../css/events.css';

function Events() {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('-created_at');
  const [refreshing, setRefreshing] = useState(false);

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

  const fetchEvents = async () => {
    try {
      setLoading(true);
      
      await axios.get(`${API_URL}/get-csrf-token/`, { withCredentials: true });
      
      const response = await axios.get(`${API_URL}/events/events/`, {
        withCredentials: true,
        params: {
          ordering: sortBy,
          search: searchQuery !== '' ? searchQuery : undefined,
          event_type: typeFilter !== 'all' ? typeFilter : undefined
        }
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
    fetchEvents();
  }, [searchQuery, typeFilter, sortBy]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('uk-UA', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('uk-UA', {
      hour: '2-digit',
      minute: '2-digit'
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

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleTypeFilter = (e) => {
    setTypeFilter(e.target.value);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchEvents();
  };

  return (
    <div className="events-page">
      <Header />
      
      <div className="events-hero-section">
        <div className="container">
          <div className="events-hero-content">
            <h1>Заходи та оголошення</h1>
            <p>Дізнайтеся про останні новини, заходи та важливі оголошення нашої освітньої платформи</p>
            
            <div className="events-search-bar">
              <div className="events-search-input-wrapper">
                <FaSearch className="events-search-icon" />
                <input
                  type="text"
                  className="events-search-input"
                  placeholder="Пошук за назвою або описом..."
                  value={searchQuery}
                  onChange={handleSearch}
                />
              </div>
              
              <div className="events-type-filter">
                <FaFilter className="events-filter-icon" />
                <select
                  value={typeFilter}
                  onChange={handleTypeFilter}
                  className="events-filter-select"
                >   
                  <option value="all">Всі типи</option>
                  <option value="event">Заходи</option>
                  <option value="news">Новини</option>
                  <option value="announcement">Оголошення</option>
                </select>
              </div>
              
              <div className="events-sort-filter">
                <select
                  value={sortBy}
                  onChange={handleSortChange}
                  className="events-sort-select"
                >
                  <option value="-created_at">Спочатку нові</option>
                  <option value="created_at">Спочатку старі</option>
                  <option value="-start_date">За датою початку (спадання)</option>
                  <option value="start_date">За датою початку (зростання)</option>
                  <option value="title">За назвою (А-Я)</option>
                  <option value="-title">За назвою (Я-А)</option>
                </select>
              </div>

              <button 
                className="events-refresh-btn" 
                onClick={handleRefresh} 
                disabled={refreshing}
                title="Оновити список"
              >
                <FaSync className={refreshing ? "spinning" : ""} />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="events-content">
        <div className="container">
          <div className="events-header">
            <h2>
              {typeFilter === 'all' ? 'Всі заходи та оголошення' : 
               typeFilter === 'event' ? 'Заходи' : 
               typeFilter === 'news' ? 'Новини' : 'Оголошення'}
            </h2>
          </div>
          
          {loading ? (
            <div className="events-loading">
              <FaSpinner className="events-loading-spinner" />
              <p>Завантаження заходів...</p>
            </div>
          ) : error ? (
            <div className="events-error">
              <FaExclamationTriangle />
              <h3>Помилка завантаження</h3>
              <p>{error}</p>
              <button 
                className="events-btn-primary"
                onClick={() => window.location.reload()}
              >
                Спробувати знову
              </button>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="events-no-events">
              <div className="events-no-events-icon">
                <FaCalendarAlt />
              </div>
              <h3>Заходи не знайдено</h3>
              <p>Наразі немає заходів, які відповідають вашому запиту.</p>
              {searchQuery || typeFilter !== 'all' ? (
                <button 
                  className="events-btn-primary"
                  onClick={() => {
                    setSearchQuery('');
                    setTypeFilter('all');
                  }}
                >
                  Скинути фільтри
                </button>
              ) : null}
            </div>
          ) : (
            <div className="events-list">
              {filteredEvents.map(event => (
                <div className="event-card" key={event.id}>
                  <div className="event-image-container">
                    <img 
                      src={isValidUrl(event.image_url) ? event.image_url : 'https://via.placeholder.com/300x200?text=Захід'} 
                      alt={event.title} 
                      className="event-image"
                      onError={(e) => {e.target.src = 'https://via.placeholder.com/300x200?text=Захід'}}
                    />
                    <div className={`event-type ${event.event_type}`}>
                      {getEventTypeIcon(event.event_type)}
                      <span>{getEventTypeText(event.event_type)}</span>
                    </div>
                  </div>
                  
                  <div className="event-content">
                    <h3 className="event-title">
                      <Link to={`/events/${event.id}`}>{event.title}</Link>
                    </h3>
                    <p className="event-description">{event.description}</p>
                    
                    {event.event_type === 'event' && (
                      <div className="event-details">
                        {event.start_date && (
                          <div className="event-detail">
                            <FaCalendarAlt />
                            <span>{formatDate(event.start_date)}</span>
                          </div>
                        )}
                        
                        {event.start_date && (
                          <div className="event-detail">
                            <FaClock />
                            <span>{formatTime(event.start_date)}</span>
                          </div>
                        )}
                        
                        {event.location && (
                          <div className="event-detail">
                            <FaMapMarkerAlt />
                            <span>{event.location}</span>
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="event-footer">
                      <div className="event-author">
                        <FaUser />
                        <span>{event.author ? event.author.first_name && event.author.last_name ? 
                          `${event.author.first_name} ${event.author.last_name}` : 
                          event.author.username : 'Невідомий автор'}
                        </span>
                      </div>
                      
                      <div className="event-date">
                        <span>Опубліковано: {formatDate(event.created_at)}</span>
                      </div>
                    </div>
                    
                    <Link to={`/events/${event.id}`} className="event-read-more">
                      Детальніше <FaAngleRight className="read-more-icon" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
}

export default Events;