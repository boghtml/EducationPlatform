import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Users } from 'lucide-react';
import API_URL from '../api';
import '../css/WorkingWithCourse.css';

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
                    src={teacher.profile_image_url || 'https://via.placeholder.com/60'}
                    alt={teacher.username}
                    className="course-wc-participant-avatar"
                  />
                  <div className="course-wc-participant-info">
                    <h4 className="course-wc-participant-name">
                      {teacher.first_name && teacher.last_name
                        ? `${teacher.first_name} ${teacher.last_name}`
                        : teacher.username}
                    </h4>
                    <span className="course-wc-participant-role">Викладач</span>
                    <span className="course-wc-participant-email">{teacher.email}</span>
                    <button
                      className="course-wc-btn-view-profile"
                      onClick={() => navigate(`/profile/${teacher.id}`)}
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
                    src={student.profile_image_url || 'https://via.placeholder.com/60'}
                    alt={student.username}
                    className="course-wc-participant-avatar"
                  />
                  <div className="course-wc-participant-info">
                    <h4 className="course-wc-participant-name">
                      {student.first_name && student.last_name
                        ? `${student.first_name} ${student.last_name}`
                        : student.username}
                    </h4>
                    <span className="course-wc-participant-role">Студент</span>
                    <span className="course-wc-participant-email">{student.email}</span>
                    <button
                      className="course-wc-btn-view-profile"
                      onClick={() => navigate(`/profile/${student.id}`)}
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
                    src={admin.profile_image_url || 'https://via.placeholder.com/60'}
                    alt={admin.username}
                    className="course-wc-participant-avatar"
                  />
                  <div className="course-wc-participant-info">
                    <h4 className="course-wc-participant-name">
                      {admin.first_name && admin.last_name
                        ? `${admin.first_name} ${admin.last_name}`
                        : admin.username}
                    </h4>
                    <span className="course-wc-participant-role">Адміністратор</span>
                    <span className="course-wc-participant-email">{admin.email}</span>
                    <button
                      className="course-wc-btn-view-profile"
                      onClick={() => navigate(`/profile/${admin.id}`)}
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