import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Users } from 'lucide-react';
import API_URL from '../api';
import '../css/WorkingWithCourse.css';
import { getDefaultAvatar } from '../utils/userUtils';

function ParticipantsTab() {
  const { course, getCsrfToken } = useOutletContext();
  const [participants, setParticipants] = useState({
    students: [],
    teachers: [],
    admins: [],
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        await getCsrfToken();
        const response = await axios.get(`${API_URL}/course/${course.id}/participants/`);
        setParticipants({
          students: response.data.students || [],
          teachers: response.data.teachers || [],
          admins: response.data.admins || [],
        });
      } catch (error) {
        console.error("Error fetching participants:", error);
      }
    };
    if (course) fetchParticipants();
  }, [course, getCsrfToken]);

  const getUserDisplayName = (user) => {
    return user.first_name && user.last_name
      ? `${user.first_name} ${user.last_name}`
      : user.username;
  };

  const getUserAvatar = (user) => {
    if (user.profile_image_url) {
      return user.profile_image_url;
    }
    
    const displayName = getUserDisplayName(user);
    return getDefaultAvatar(displayName, user.role || 'student');
  };

  return (
    <div className="course-wc-participants-tab">
      <div className="course-wc-content-header">
        <h2>Учасники курсу</h2>
      </div>

      <div className="course-wc-participants-container">
        <div className="course-wc-participants-section">
          <h3 className="course-wc-participants-title">
            <Users className="course-wc-section-icon" /> Викладачі ({participants.teachers.length})
          </h3>
          <div className="course-wc-participants-list">
            {participants.teachers.length === 0 ? (
              <p className="course-wc-no-participants">Немає доступних викладачів</p>
            ) : (
              participants.teachers.map((teacher) => (
                <div key={teacher.id} className="course-wc-participant-card">
                  <img
                    src={getUserAvatar({...teacher, role: 'teacher'})}
                    alt={getUserDisplayName(teacher)}
                    className="course-wc-participant-avatar"
                  />
                  <div className="course-wc-participant-info">
                    <h4 className="course-wc-participant-name">
                      {getUserDisplayName(teacher)}
                    </h4>
                    <span className="course-wc-participant-role">Викладач</span>
                    <span className="course-wc-participant-email">{teacher.email}</span>
                    <button
                      className="course-wc-btn-view-profile"
                      onClick={() => navigate(`/profile/${teacher.id}?role=teacher`)}
                    >
                      Переглянути профіль
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="course-wc-participants-section">
          <h3 className="course-wc-participants-title">
            <Users className="course-wc-section-icon" /> Студенти ({participants.students.length})
          </h3>
          <div className="course-wc-participants-list">
            {participants.students.length === 0 ? (
              <p className="course-wc-no-participants">Немає доступних студентів</p>
            ) : (
              participants.students.map((student) => (
                <div key={student.id} className="course-wc-participant-card">
                  <img
                    src={getUserAvatar({...student, role: 'student'})}
                    alt={getUserDisplayName(student)}
                    className="course-wc-participant-avatar"
                  />
                  <div className="course-wc-participant-info">
                    <h4 className="course-wc-participant-name">
                      {getUserDisplayName(student)}
                    </h4>
                    <span className="course-wc-participant-role">Студент</span>
                    <span className="course-wc-participant-email">{student.email}</span>
                    <button
                      className="course-wc-btn-view-profile"
                      onClick={() => navigate(`/profile/${student.id}?role=student`)}
                    >
                      Переглянути профіль
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {participants.admins && participants.admins.length > 0 && (
          <div className="course-wc-participants-section">
            <h3 className="course-wc-participants-title">
              <Users className="course-wc-section-icon" /> Адміністратори ({participants.admins.length})
            </h3>
            <div className="course-wc-participants-list">
              {participants.admins.map((admin) => (
                <div key={admin.id} className="course-wc-participant-card">
                  <img
                    src={getUserAvatar({...admin, role: 'admin'})}
                    alt={getUserDisplayName(admin)}
                    className="course-wc-participant-avatar"
                  />
                  <div className="course-wc-participant-info">
                    <h4 className="course-wc-participant-name">
                      {getUserDisplayName(admin)}
                    </h4>
                    <span className="course-wc-participant-role">Адміністратор</span>
                    <span className="course-wc-participant-email">{admin.email}</span>
                    <button
                      className="course-wc-btn-view-profile"
                      onClick={() => navigate(`/profile/${admin.id}?role=admin`)}
                    >
                      Переглянути профіль
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ParticipantsTab;