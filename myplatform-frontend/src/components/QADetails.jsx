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
  Loader,
  X,
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
  const [isEditing, setIsEditing] = useState(null); 
  const [editContent, setEditContent] = useState(''); 
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
      console.error('Помилка отримання CSRF-токену:', error);
    }
    return null;
  };

  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        setLoading(true);
        await getCsrfToken();

        const userInfo = {
          id: sessionStorage.getItem('userId'),
          username: sessionStorage.getItem('userName'),
          profileImageUrl: sessionStorage.getItem('profileImageUrl') || 'https://via.placeholder.com/40',
        };
        setCurrentUser(userInfo);

        const response = await axios.get(`${API_URL}/questions/${questionId}/`, {
          withCredentials: true,
        });

        setQuestion(response.data);
        setAnswers(response.data.answers || []);
        setLoading(false);
      } catch (error) {
        console.error('Помилка отримання питання:', error);
        setError('Не вдалося завантажити питання. Спробуйте знову.');
        setLoading(false);
      }
    };

    fetchQuestion();
  }, [questionId]);
  
  const handleSubmitAnswer = async (e) => {
    e.preventDefault();

    if (!newAnswer.trim()) {
      setErrorMessage('Відповідь не може бути порожньою');
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
        { withCredentials: true },
      );

      const newAnswerObject = {
        ...response.data,
        user: currentUser.username,
        profile_image_url: currentUser.profileImageUrl,
        created_at: new Date().toISOString(),
       
        id: response.data.id || Date.now().toString(),
      };

      setAnswers((prev) => [...prev, newAnswerObject]);
      setNewAnswer('');
      setSuccessMessage('Відповідь успішно додано!');

      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    } catch (error) {
      console.error('Помилка надсилання відповіді:', error);
      setErrorMessage(error.response?.data?.error || 'Помилка додавання відповіді. Спробуйте знову.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditAnswer = async (answerId) => {
    if (!editContent.trim()) {
      setErrorMessage('Відповідь не може бути порожньою');
      return;
    }

    try {
      await getCsrfToken();

      await axios.put(
        `${API_URL}/questions/answer/${answerId}/edit/`,
        { content: editContent },
        { withCredentials: true },
      );

      setAnswers((prev) =>
        prev.map((answer) =>
          answer.id === answerId
            ? { ...answer, content: editContent, updated_at: new Date().toISOString() }
            : answer,
        ),
      );

      setIsEditing(null);
      setEditContent('');
      setSuccessMessage('Відповідь успішно оновлено!');
    } catch (error) {
      console.error('Помилка редагування відповіді:', error);
      setErrorMessage(error.response?.data?.error || 'Помилка оновлення відповіді. Спробуйте знову.');
    }
  };

  const handleDeleteAnswer = async (answerId) => {
    if (!window.confirm('Ви впевнені, що хочете видалити цю відповідь?')) {
      return;
    }

    try {
      await getCsrfToken();

      await axios.delete(`${API_URL}/questions/answer/${answerId}/delete/`, {
        withCredentials: true,
      });

      setAnswers((prev) => prev.filter((answer) => answer.id !== answerId));
      setSuccessMessage('Відповідь успішно видалено!');
    } catch (error) {
      console.error('Помилка видалення відповіді:', error);
      setErrorMessage(error.response?.data?.error || 'Помилка видалення відповіді. Спробуйте знову.');
    }
  };

  const startEditing = (answer) => {
    setIsEditing(answer.id);
    setEditContent(answer.content);
  };
  
  const cancelEditing = () => {
    setIsEditing(null);
    setEditContent('');
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';

    const date = new Date(dateString);
    return date.toLocaleDateString('uk-UA', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTimeAgo = (dateString) => {
    if (!dateString) return '';

    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffMinutes = Math.floor(diffTime / (1000 * 60));

    if (diffMinutes < 1) return 'щойно';
    if (diffMinutes < 60) return `${diffMinutes} ${diffMinutes === 1 ? 'хвилина' : 'хвилин'} тому`;

    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'година' : 'годин'} тому`;

    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 7) return `${diffDays} ${diffDays === 1 ? 'день' : 'днів'} тому`;

    return formatDate(dateString);
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
          <h3>{error ? 'Помилка завантаження питання' : 'Питання не знайдено'}</h3>
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
      <button className="course-wc-back-button" onClick={() => navigate(-1)}>
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
              <h3 className="course-wc-qa-question-author-name">{question.teacher?.username || 'Користувач'}</h3>
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
              <span>Поскаржитися</span>
            </button>
          </div>
        </div>

        <div className="course-wc-qa-question-content">
          <h2 className="course-wc-qa-question-title">{question.title}</h2>
          <div className="course-wc-qa-question-description">{question.description}</div>
        </div>

        <div className="course-wc-qa-question-footer">
          <div className="course-wc-qa-question-tags">
            <span className="course-wc-qa-tag">Q&A</span>
            <span className="course-wc-qa-tag">{answers.length} {answers.length === 1 ? 'відповідь' : 'відповідей'}</span>
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
            <p>Ще немає відповідей. Будьте першим, хто відповість на це питання!</p>
          </div>
        ) : (
          <div className="course-wc-qa-answers-list">
            {answers.map((answer) => (
              <div key={answer.id} className="course-wc-qa-answer">
                <div className="course-wc-qa-answer-header">
                  <div className="course-wc-qa-answer-author">
                    <img
                      src={answer.profile_image_url || 'https://via.placeholder.com/40'}
                      alt={answer.user || 'Користувач'}
                      className="course-wc-qa-answer-avatar"
                    />
                    <div className="course-wc-qa-answer-author-info">
                      <h4 className="course-wc-qa-answer-author-name">{answer.user || 'Користувач'}</h4>
                      <span className="course-wc-qa-answer-date">{getTimeAgo(answer.created_at)}</span>
                    </div>
                  </div>

                  {/* Кнопки дій для власних відповідей користувача */}
                  {answer.user === currentUser.username && (
                    <div className="course-wc-qa-answer-actions">
                      {isEditing !== answer.id ? (
                        <>
                          <button className="course-wc-qa-answer-action-btn" onClick={() => startEditing(answer)}>
                            <Edit size={14} />
                            <span>Редагувати</span>
                          </button>
                          <button
                            className="course-wc-qa-answer-action-btn"
                            onClick={() => handleDeleteAnswer(answer.id)}
                          >
                            <Trash2 size={14} />
                            <span>Видалити</span>
                          </button>
                        </>
                      ) : (
                        <button className="course-wc-qa-answer-action-btn" onClick={cancelEditing}>
                          <X size={14} />
                          <span>Скасувати</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {isEditing === answer.id ? (
                  <div className="course-wc-qa-edit-form">
                    <textarea
                      className="course-wc-qa-reply-textarea"
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                    />
                    <div className="course-wc-qa-edit-actions">
                      <button className="course-wc-btn-submit" onClick={() => handleEditAnswer(answer.id)}>
                        Зберегти зміни
                      </button>
                      <button className="course-wc-btn-cancel" onClick={cancelEditing}>
                        Скасувати
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="course-wc-qa-answer-content">{answer.content}</div>
                )}

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

      {/* Секція форми для відповіді */}
      <div className="course-wc-qa-reply-section">
        <h3 className="course-wc-qa-reply-title">Ваша відповідь</h3>
        <form onSubmit={handleSubmitAnswer} className="course-wc-qa-reply-form">
          <div className="course-wc-qa-reply-author">
            <img
              src={currentUser.profileImageUrl}
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

      {/* Секція схожих питань */}
      <div className="course-wc-qa-related-section">
        <h3 className="course-wc-qa-related-title">Схожі питання</h3>
        <div className="course-wc-qa-related-list">
          <div className="course-wc-qa-related-item">
            <HelpCircle size={16} className="course-wc-qa-related-icon" />
            <a href="#" className="course-wc-qa-related-link">
              Як знайти інтеграл від x² на відрізку [0, 1]?
            </a>
          </div>
          <div className="course-wc-qa-related-item">
            <HelpCircle size={16} className="course-wc-qa-related-icon" />
            <a href="#" className="course-wc-qa-related-link">
              Яка різниця між визначеним і невизначеним інтегралом?
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