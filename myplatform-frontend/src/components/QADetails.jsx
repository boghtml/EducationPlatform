import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  HelpCircle,
  ChevronDown,
  MessageSquare,
  Send,
  User,
  Calendar,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Heart,
  ThumbsUp,
  Edit,
  Trash2,
  Share2,
  Bookmark,
  Flag,
  Loader
} from 'lucide-react';
import API_URL from '../api';
import '../css/WorkingWithCourse.css';

function QADetails() {
  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [newAnswer, setNewAnswer] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [currentUser, setCurrentUser] = useState({});
  const { questionId } = useParams();
  const navigate = useNavigate();

  // Отримання CSRF-токену
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

  // Отримання деталей питання
  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        setLoading(true);
        await getCsrfToken();
        
        // Отримуємо інформацію про поточного користувача
        const userInfo = {
          id: sessionStorage.getItem('userId'),
          username: sessionStorage.getItem('userName'),
          profileImageUrl: sessionStorage.getItem('profileImageUrl') || 'https://via.placeholder.com/40'
        };
        setCurrentUser(userInfo);
        
        // Запит до API для отримання питання
        const response = await axios.get(`${API_URL}/questions/${questionId}/`, {
          withCredentials: true
        });
        
        setQuestion(response.data);
        setAnswers(response.data.answers || []);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching question:", error);
        setError("Не вдалося завантажити питання. Спробуйте знову.");
        setLoading(false);
      }
    };
    
    fetchQuestion();
  }, [questionId]);

  // Відправка нової відповіді
  const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    
    if (!newAnswer.trim()) {
      setErrorMessage("Відповідь не може бути порожньою");
      return;
    }
    
    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');
    
    try {
      await getCsrfToken();
      
      const response = await axios.post(
        `${API_URL}/questions/${questionId}/answer/`,
        { content: newAnswer },
        { withCredentials: true }
      );
      
      // Отримуємо поточний час для відображення у новій відповіді
      const now = new Date().toISOString();
      
      // Додаємо нову відповідь до списку
      const newAnswerObject = {
        ...response.data,
        user: currentUser.username,
        profile_image_url: currentUser.profileImageUrl,
        created_at: now
      };
      
      setAnswers(prev => [...prev, newAnswerObject]);
      setNewAnswer('');
      setSuccessMessage("Відповідь успішно додано!");
      
      // Прокручуємо до нової відповіді
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    } catch (error) {
      console.error("Error submitting answer:", error);
      setErrorMessage(error.response?.data?.error || "Помилка при додаванні відповіді. Спробуйте знову.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Форматування дати
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('uk-UA', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Отримання дати у форматі "скільки часу минуло"
  const getTimeAgo = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    
    if (diffMinutes < 1) return "щойно";
    if (diffMinutes < 60) return `${diffMinutes} хв тому`;
    
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    if (diffHours < 24) return `${diffHours} год тому`;
    
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 7) return `${diffDays} ${getDayWord(diffDays)} тому`;
    
    return formatDate(dateString);
  };

  // Допоміжна функція для форматування закінчення слова "день"
  const getDayWord = (days) => {
    if (days === 1) return "день";
    if (days >= 2 && days <= 4) return "дні";
    return "днів";
  };

  if (loading) {
    return (
      <div className="course-wc-qa-details">
        <div className="course-wc-loading-spinner">
          <Loader className="animate-spin" size={40} />
          <p>Завантаження питання...</p>
        </div>
      </div>
    );
  }

  if (error || !question) {
    return (
      <div className="course-wc-qa-details">
        <div className="course-wc-error-container">
          <AlertTriangle size={40} className="text-red-500" />
          <h3>{error ? 'Помилка завантаження' : 'Питання не знайдено'}</h3>
          <p>{error || 'Запитане питання не знайдено. Можливо, його було видалено.'}</p>
          <button className="course-wc-btn-primary" onClick={() => navigate(-1)}>
            Повернутися назад
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="course-wc-qa-details">
      <button 
        className="course-wc-back-button"
        onClick={() => navigate(-1)}
      >
        <ChevronDown className="course-wc-back-icon" /> Назад до Q&A
      </button>
      
      {successMessage && (
        <div className="course-wc-success-message">
          <CheckCircle size={20} />
          <span>{successMessage}</span>
        </div>
      )}
      
      {errorMessage && (
        <div className="course-wc-error-message">
          <AlertTriangle size={20} />
          <span>{errorMessage}</span>
        </div>
      )}
      
      {/* Секція питання */}
      <div className="course-wc-qa-question-section">
        <div className="course-wc-qa-question-header">
          <div className="course-wc-qa-question-author">
            <img
              src={question.teacher?.profile_image_url || 'https://via.placeholder.com/50'}
              alt={question.teacher?.username || 'Користувач'}
              className="course-wc-qa-question-avatar"
            />
            <div className="course-wc-qa-question-author-info">
              <h3 className="course-wc-qa-question-author-name">
                {question.teacher?.username || 'Користувач'}
              </h3>
              <span className="course-wc-qa-question-date">
                <Calendar size={14} /> {formatDate(question.created_at)}
              </span>
            </div>
          </div>
          
          <div className="course-wc-qa-question-actions">
            <button className="course-wc-qa-action-btn">
              <Bookmark size={16} />
              <span>Зберегти</span>
            </button>
            <button className="course-wc-qa-action-btn">
              <Share2 size={16} />
              <span>Поділитися</span>
            </button>
            <button className="course-wc-qa-action-btn">
              <Flag size={16} />
              <span>Повідомити</span>
            </button>
          </div>
        </div>
        
        <div className="course-wc-qa-question-content">
          <h2 className="course-wc-qa-question-title">{question.title}</h2>
          <div className="course-wc-qa-question-description">
            {question.description}
          </div>
        </div>
        
        <div className="course-wc-qa-question-footer">
          <div className="course-wc-qa-question-tags">
            <span className="course-wc-qa-tag">Q&A</span>
            <span className="course-wc-qa-tag">{question.answers?.length || 0} відповідей</span>
          </div>
          
          <div className="course-wc-qa-question-interactions">
            <button className="course-wc-qa-interaction-btn">
              <ThumbsUp size={16} />
              <span>Корисно</span>
            </button>
            <button className="course-wc-qa-interaction-btn">
              <Heart size={16} />
              <span>Подобається</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Секція відповідей */}
      <div className="course-wc-qa-answers-section">
        <h3 className="course-wc-qa-answers-title">
          <MessageSquare className="course-wc-qa-answers-icon" size={20} />
          Відповіді ({answers.length})
        </h3>
        
        {answers.length === 0 ? (
          <div className="course-wc-qa-no-answers">
            <p>Ще немає відповідей на це питання. Будьте першим, хто відповість!</p>
          </div>
        ) : (
          <div className="course-wc-qa-answers-list">
            {answers.map((answer, index) => (
              <div key={index} className="course-wc-qa-answer">
                <div className="course-wc-qa-answer-header">
                  <div className="course-wc-qa-answer-author">
                    <img
                      src={answer.profile_image_url || 'https://via.placeholder.com/40'}
                      alt={answer.user || 'Користувач'}
                      className="course-wc-qa-answer-avatar"
                    />
                    <div className="course-wc-qa-answer-author-info">
                      <h4 className="course-wc-qa-answer-author-name">
                        {answer.user || 'Користувач'}
                      </h4>
                      <span className="course-wc-qa-answer-date">
                        {getTimeAgo(answer.created_at)}
                      </span>
                    </div>
                  </div>
                  
                  {/* Кнопки дій для власних відповідей */}
                  {answer.user === currentUser.username && (
                    <div className="course-wc-qa-answer-actions">
                      <button className="course-wc-qa-answer-action-btn">
                        <Edit size={14} />
                        <span>Редагувати</span>
                      </button>
                      <button className="course-wc-qa-answer-action-btn">
                        <Trash2 size={14} />
                        <span>Видалити</span>
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="course-wc-qa-answer-content">
                  {answer.content}
                </div>
                
                <div className="course-wc-qa-answer-footer">
                  <div className="course-wc-qa-answer-vote">
                    <button className="course-wc-qa-vote-btn">
                      <ThumbsUp size={14} />
                      <span>{answer.likes || 0}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Форма для додавання нової відповіді */}
      <div className="course-wc-qa-reply-section">
        <h3 className="course-wc-qa-reply-title">Ваша відповідь</h3>
        <form onSubmit={handleSubmitAnswer} className="course-wc-qa-reply-form">
          <div className="course-wc-qa-reply-author">
            <img
              src={currentUser.profileImageUrl || 'https://via.placeholder.com/40'}
              alt={currentUser.username || 'Ви'}
              className="course-wc-qa-reply-avatar"
            />
            <span className="course-wc-qa-reply-name">{currentUser.username || 'Ви'}</span>
          </div>
          
          <div className="course-wc-form-group">
            <textarea
              className="course-wc-qa-reply-textarea"
              placeholder="Напишіть вашу відповідь..."
              value={newAnswer}
              onChange={(e) => setNewAnswer(e.target.value)}
              required
            />
          </div>
          
          <div className="course-wc-qa-reply-actions">
            <button 
              type="submit" 
              className="course-wc-btn-submit" 
              disabled={isSubmitting || !newAnswer.trim()}
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="course-wc-button-icon animate-spin" size={16} />
                  <span>Надсилання...</span>
                </>
              ) : (
                <>
                  <Send className="course-wc-button-icon" size={16} />
                  <span>Надіслати відповідь</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
      
      {/* Рекомендовані схожі питання (опціонально) */}
      <div className="course-wc-qa-related-section">
        <h3 className="course-wc-qa-related-title">Схожі питання</h3>
        <div className="course-wc-qa-related-list">
          <div className="course-wc-qa-related-item">
            <HelpCircle size={16} className="course-wc-qa-related-icon" />
            <a href="#" className="course-wc-qa-related-link">
              Як знайти інтеграл від x² по відрізку [0, 1]?
            </a>
          </div>
          <div className="course-wc-qa-related-item">
            <HelpCircle size={16} className="course-wc-qa-related-icon" />
            <a href="#" className="course-wc-qa-related-link">
              В чому різниця між визначеним і невизначеним інтегралом?
            </a>
          </div>
          <div className="course-wc-qa-related-item">
            <HelpCircle size={16} className="course-wc-qa-related-icon" />
            <a href="#" className="course-wc-qa-related-link">
              Як застосувати інтегрування частинами?
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default QADetails;