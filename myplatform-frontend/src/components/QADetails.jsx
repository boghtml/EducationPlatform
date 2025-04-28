import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { MessageCircle, ChevronDown, Send } from 'lucide-react';
import API_URL from '../api';
import '../css/WorkingWithCourse.css';

function QADetails() {
  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [newAnswer, setNewAnswer] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { questionId } = useParams();
  const navigate = useNavigate();

  const getCsrfToken = async () => {
    try {
      const response = await axios.get(`${API_URL}/get-csrf-token/`, { withCredentials: true });
      if (response.data && response.data.csrftoken) {
        axios.defaults.headers.common['X-CSRFToken'] = response.data.csrftoken;
        return response.data.csrftoken;
      }
    } catch (error) {
      console.error('Error fetching CSRF token:', error);
    }
    return null;
  };

  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        setLoading(true);
        await getCsrfToken();
        const response = await axios.get(`${API_URL}/questions/${questionId}/`, { withCredentials: true });
        setQuestion(response.data);
        setAnswers(response.data.answers || []);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching question:", error);
        setError("Не вдалося завантажити запитання. Спробуйте знову.");
        setLoading(false);
      }
    };
    fetchQuestion();
  }, [questionId]);

  const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    if (!newAnswer.trim()) return;
    try {
      await getCsrfToken();
      const response = await axios.post(
        `${API_URL}/questions/${questionId}/answers/`,
        { content: newAnswer },
        { withCredentials: true }
      );
      setAnswers(prev => [...prev, response.data]);
      setNewAnswer('');
    } catch (error) {
      console.error("Error submitting answer:", error);
      setError("Не вдалося надіслати відповідь. Спробуйте знову.");
    }
  };

  if (loading) {
    return (
      <div className="course-wc-interface-container">
        <div className="course-wc-loading-spinner">
          <div className="course-wc-spinner"></div>
          <p>Завантаження запитання...</p>
        </div>
      </div>
    );
  }

  if (error || !question) {
    return (
      <div className="course-wc-interface-container">
        <div className="course-wc-error-container">
          <div className="course-wc-error-icon">!</div>
          <h3>{error ? 'Помилка завантаження' : 'Запитання не знайдено'}</h3>
          <p>{error || 'Запитане запитання не знайдено. Можливо, його було видалено.'}</p>
          <button className="course-wc-btn-primary" onClick={() => navigate(-1)}>
            Повернутися назад
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="course-wc-interface-container">
      <main className="course-wc-content">
        <div className="course-wc-qa-details">
          <button 
            className="course-wc-back-button"
            onClick={() => navigate(-1)}
          >
            <ChevronDown className="course-wc-back-icon" /> Назад до Q&A
          </button>
          
          <div className="course-wc-content-header">
            <h2>{question.title}</h2>
            <div className="course-wc-content-meta">
              <span><MessageCircle className="course-wc-meta-icon" /> {answers.length} відповідей</span>
            </div>
          </div>

          <div className="course-wc-qa-content">
            <div className="course-wc-qa-item">
              <div className="course-wc-qa-item-header">
                <div className="course-wc-qa-item-author">
                  <img 
                    src={question.teacher?.profile_image_url || 'https://via.placeholder.com/40'} 
                    alt={question.teacher?.username || 'User'} 
                    className="course-wc-qa-avatar" 
                  />
                  <div className="course-wc-qa-author-info">
                    <span className="course-wc-qa-author-name">{question.teacher?.username || 'Користувач'}</span>
                    <span className="course-wc-qa-date">{new Date(question.created_at).toLocaleDateString('uk-UA')}</span>
                  </div>
                </div>
              </div>
              <p className="course-wc-qa-description">{question.description}</p>
            </div>

            <div className="course-wc-qa-answers">
              <h3>Відповіді</h3>
              {answers.length === 0 ? (
                <p>Поки що немає відповідей. Будьте першим, хто відповість!</p>
              ) : (
                answers.map(answer => (
                  <div key={answer.id} className="course-wc-qa-answer">
                    <div className="course-wc-qa-item-header">
                      <div className="course-wc-qa-item-author">
                        <img 
                          src={answer.author?.profile_image_url || 'https://via.placeholder.com/40'} 
                          alt={answer.author?.username || 'User'} 
                          className="course-wc-qa-avatar" 
                        />
                        <div className="course-wc-qa-author-info">
                          <span className="course-wc-qa-author-name">{answer.author?.username || 'Користувач'}</span>
                          <span className="course-wc-qa-date">{new Date(answer.created_at).toLocaleDateString('uk-UA')}</span>
                        </div>
                      </div>
                    </div>
                    <p>{answer.content}</p>
                  </div>
                ))
              )}
            </div>

            <div className="course-wc-qa-answer-form">
              <h3>Ваша відповідь</h3>
              <textarea
                placeholder="Напишіть вашу відповідь..."
                value={newAnswer}
                onChange={(e) => setNewAnswer(e.target.value)}
                className="course-wc-qa-textarea"
              />
              <button 
                className="course-wc-btn-qa-create"
                onClick={handleSubmitAnswer}
                disabled={!newAnswer.trim()}
              >
                <Send className="course-wc-button-icon" /> Надіслати відповідь
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default QADetails;