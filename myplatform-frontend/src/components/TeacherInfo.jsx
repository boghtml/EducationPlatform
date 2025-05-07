import React, { useState, useEffect, useRef } from 'react';
import { Mail, Phone, Calendar, Award, X, BookOpen, Users } from 'lucide-react';
import { getDefaultAvatar } from '../utils/userUtils';
import axios from 'axios';
import API_URL from '../api';
import '../css/TeacherInfo.css'; 

const TeacherInfo = ({ teacher, onClose }) => {
  const [teacherDetails, setTeacherDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const popupRef = useRef(null);

  useEffect(() => {
    const fetchTeacherDetails = async () => {
      if (!teacher || !teacher.id) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/users/teacher/${teacher.id}/`, { withCredentials: true });
        
        if (response.data && response.data.data) {
          setTeacherDetails(response.data.data);
        } else if (response.data) {
          setTeacherDetails(response.data);
        } else {
          throw new Error("Invalid data format");
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching teacher details:', err);
        setError('Не вдалося завантажити дані викладача');
        setLoading(false);
      }
    };
    
    fetchTeacherDetails();
    
    // Handle clicking outside to close the popup
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        onClose();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [teacher, onClose]);

  const formatDate = (dateString) => {
    if (!dateString) return 'Не вказано';
    const date = new Date(dateString);
    return date.toLocaleDateString('uk-UA', { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric' 
    });
  };
  
  const getTeacherFullName = () => {
    if (!teacher) return '';
    return teacher.first_name && teacher.last_name
      ? `${teacher.first_name} ${teacher.last_name}`
      : teacher.username || 'Невідомий викладач';
  };
  
  const getTeacherAvatar = () => {
    if (!teacher) return '';
    if (teacher.profile_image_url) {
      return teacher.profile_image_url;
    }
    return getDefaultAvatar(getTeacherFullName(), 'teacher');
  };
  
  return (
    <div className="teacher-popup-overlay">
      <div className="teacher-popup" ref={popupRef}>
        <div className="teacher-popup-header">
          <h3>Інформація про викладача</h3>
          <button className="teacher-popup-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        
        {loading ? (
          <div className="teacher-popup-loading">
            <div className="teacher-popup-spinner"></div>
            <p>Завантаження даних...</p>
          </div>
        ) : error ? (
          <div className="teacher-popup-error">
            <p>{error}</p>
            <button className="course-wc-btn-primary" onClick={onClose}>Закрити</button>
          </div>
        ) : (
          <div className="teacher-popup-content">
            <div className="teacher-popup-profile">
              <img
                src={getTeacherAvatar()}
                alt={getTeacherFullName()}
                className="teacher-popup-avatar"
              />
              <div className="teacher-popup-details">
                <h4>{getTeacherFullName()}</h4>
                <p className="teacher-role">Викладач</p>
                
                <div className="teacher-popup-meta">
                  {teacherDetails?.email && (
                    <div className="teacher-popup-meta-item">
                      <Mail size={16} className="teacher-meta-icon" />
                      <span>{teacherDetails.email}</span>
                    </div>
                  )}
                  
                  {teacherDetails?.phone_number && (
                    <div className="teacher-popup-meta-item">
                      <Phone size={16} className="teacher-meta-icon" />
                      <span>{teacherDetails.phone_number}</span>
                    </div>
                  )}
                  
                  {teacherDetails?.date_joined && (
                    <div className="teacher-popup-meta-item">
                      <Calendar size={16} className="teacher-meta-icon" />
                      <span>З нами з {formatDate(teacherDetails.date_joined)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="teacher-popup-bio">
              <h5>Про викладача</h5>
              <p>{teacherDetails?.bio || 'Викладач не додав інформацію про себе.'}</p>
            </div>
            
            <div className="teacher-popup-specialization">
              <h5>Спеціалізація</h5>
              {teacherDetails?.specializations ? (
                <ul className="teacher-popup-specialization-list">
                  {teacherDetails.specializations.map((spec, index) => (
                    <li key={index} className="teacher-popup-specialization-item">
                      <Award size={16} className="teacher-meta-icon" />
                      <span>{spec}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>Інформація про спеціалізацію не вказана</p>
              )}
            </div>
            
            <div className="teacher-popup-footer">
              <button 
                className="teacher-popup-view-profile"
                onClick={() => {
                  window.location.href = `/profile/${teacher.id}?role=teacher`;
                  onClose();
                }}
              >
                Перейти до профілю
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherInfo;