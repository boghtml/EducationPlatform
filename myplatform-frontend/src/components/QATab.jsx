import React, { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import axios from 'axios';
import { HelpCircle } from 'lucide-react';
import API_URL from '../api';
import '../css/WorkingWithCourse.css';

function QATab() {
  const { course, getCsrfToken } = useOutletContext();
  const [discussions, setDiscussions] = useState([]);
  const [newQuestion, setNewQuestion] = useState({ title: '', description: '' });
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDiscussions = async () => {
      try {
        await getCsrfToken();
        const response = await axios.get(`${API_URL}/questions/course/${course.id}/`);
        setDiscussions(response.data || []);
      } catch (error) {
        console.error("Error fetching discussions:", error);
        setError("Не вдалося завантажити Q&A сесії. Спробуйте знову.");
      }
    };
    if (course) fetchDiscussions();
  }, [course, getCsrfToken]);

  const handleCreateQuestion = async (e) => {
    e.preventDefault();
    try {
      await getCsrfToken();
      const response = await axios.post(`${API_URL}/questions/course/${course.id}/`, newQuestion, {
        withCredentials: true,
      });
      setDiscussions((prev) => [...prev, response.data]);
      setNewQuestion({ title: '', description: '' });
    } catch (error) {
      console.error("Error creating question:", error);
      setError("Не вдалося створити запитання. Спробуйте знову.");
    }
  };

  return (
    <div className="course-wc-qa-tab">
      <div className="course-wc-content-header">
        <h2>Q&A Сесії</h2>
      </div>

      <div className="course-wc-qa-container">
        <div className="course-wc-qa-header">
          <div className="course-wc-qa-create-form">
            <h3>Створити нове запитання</h3>
            <div className="course-wc-qa-form">
              <input
                type="text"
                placeholder="Заголовок запитання"
                value={newQuestion.title}
                onChange={(e) => setNewQuestion((prev) => ({ ...prev, title: e.target.value }))}
                className="course-wc-qa-input"
              />
              <textarea
                placeholder="Опишіть ваше запитання"
                value={newQuestion.description}
                onChange={(e) => setNewQuestion((prev) => ({ ...prev, description: e.target.value }))}
                className="course-wc-qa-textarea"
              />
              <button
                className="course-wc-btn-qa-create"
                onClick={handleCreateQuestion}
                disabled={!newQuestion.title || !newQuestion.description}
              >
                Опублікувати запитання
              </button>
            </div>
          </div>
          <div className="course-wc-qa-filters">
            <select className="course-wc-qa-filter">
              <option value="all">Всі запитання</option>
              <option value="answered">Відповідені</option>
              <option value="unanswered">Без відповіді</option>
            </select>
            <input type="text" className="course-wc-qa-search" placeholder="Пошук запитань..." />
          </div>
        </div>

        {discussions.length === 0 ? (
          <div className="course-wc-no-content-message">
            <h3>Поки що немає Q&A сесій</h3>
            <p>Будьте першим, хто створить запитання для цього курсу!</p>
          </div>
        ) : (
          <div className="course-wc-qa-list">
            {discussions.map((discussion) => (
              <div key={discussion.id} className="course-wc-qa-item">
                <div className="course-wc-qa-item-header">
                  <div className="course-wc-qa-item-author">
                    <img
                      src={discussion.teacher?.profile_image_url || 'https://via.placeholder.com/40'}
                      alt={discussion.teacher?.username || 'User'}
                      className="course-wc-qa-avatar"
                    />
                    <div className="course-wc-qa-author-info">
                      <span className="course-wc-qa-author-name">
                        {discussion.teacher?.username || 'Користувач'}
                      </span>
                      <span className="course-wc-qa-date">
                        {new Date(discussion.created_at).toLocaleDateString('uk-UA')}
                      </span>
                    </div>
                  </div>
                  <div className="course-wc-qa-stats">
                    <span className="course-wc-qa-answers">{discussion.answers?.length || 0} відповідей</span>
                  </div>
                </div>
                <h3 className="course-wc-qa-title">{discussion.title}</h3>
                <p className="course-wc-qa-description">{discussion.description}</p>
                <div className="course-wc-qa-actions">
                  <Link to={`/qa/${discussion.id}`} className="course-wc-btn-qa">
                    Переглянути деталі
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default QATab;