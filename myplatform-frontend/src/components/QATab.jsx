import React, { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import axios from 'axios';
import {
  HelpCircle,
  Search,
  Filter,
  MessageSquare,
  Plus,
  User,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Loader,
  RefreshCw,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import API_URL from '../api';
import '../css/WorkingWithCourse.css';

function QATab() {
  const { course, getCsrfToken } = useOutletContext();
  const [questions, setQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newQuestion, setNewQuestion] = useState({ title: '', description: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [expandedQuestion, setExpandedQuestion] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Завантаження питань
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        await getCsrfToken();
        const response = await axios.get(`${API_URL}/questions/course/${course.id}/`, { 
          withCredentials: true 
        });
        
        if (Array.isArray(response.data)) {
          setQuestions(response.data);
          setFilteredQuestions(response.data);
        } else {
          console.error("Invalid questions data format:", response.data);
          setError("Отримано некоректні дані питань");
        }
      } catch (error) {
        console.error("Error fetching questions:", error);
        setError("Не вдалося завантажити питання. Спробуйте знову.");
      } finally {
        setLoading(false);
      }
    };
    
    if (course && course.id) fetchQuestions();
  }, [course, getCsrfToken]);

  // Фільтрація та сортування питань
  useEffect(() => {
    if (!questions.length) return;
    
    let filtered = [...questions];
    
    // Пошук за текстом
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(question => 
        question.title.toLowerCase().includes(query) || 
        question.description.toLowerCase().includes(query)
      );
    }
    
    // Фільтрація за відповіддю
    if (filter === 'answered') {
      filtered = filtered.filter(question => 
        question.answers && question.answers.length > 0
      );
    } else if (filter === 'unanswered') {
      filtered = filtered.filter(question => 
        !question.answers || question.answers.length === 0
      );
    }
    
    // Сортування
    switch (sortBy) {
      case 'recent':
        filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        break;
      case 'mostAnswers':
        filtered.sort((a, b) => {
          const aCount = a.answers?.length || 0;
          const bCount = b.answers?.length || 0;
          return bCount - aCount;
        });
        break;
      case 'alphabetical':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      default:
        break;
    }
    
    setFilteredQuestions(filtered);
  }, [questions, searchQuery, filter, sortBy]);

  // Створення нового питання
  const handleCreateQuestion = async (e) => {
    e.preventDefault();
    
    if (!newQuestion.title.trim() || !newQuestion.description.trim()) {
      setErrorMessage("Заповніть всі обов'язкові поля");
      return;
    }
    
    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');
    
    try {
      await getCsrfToken();
      
      const response = await axios.post(
        `${API_URL}/questions/create/`, 
        {
          ...newQuestion,
          course_id: course.id
        },
        { withCredentials: true }
      );
      
      // Додаємо нове питання до списку
      setQuestions(prev => [response.data, ...prev]);
      
      // Скидаємо форму
      setNewQuestion({ title: '', description: '' });
      setShowCreateForm(false);
      setSuccessMessage("Питання успішно створено!");
      
      // Прокручуємо до повідомлення про успіх
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error("Error creating question:", error);
      setErrorMessage(error.response?.data?.error || "Помилка при створенні питання. Спробуйте знову.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Обробник розгортання/згортання питання
  const toggleQuestionExpand = (questionId) => {
    if (expandedQuestion === questionId) {
      setExpandedQuestion(null);
    } else {
      setExpandedQuestion(questionId);
    }
  };

  // Форматування дати
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    
    // Отримуємо різницю у часі
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      // Якщо сьогодні, показуємо час
      return `Сьогодні, ${date.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays === 1) {
      return "Вчора";
    } else if (diffDays < 7) {
      return `${diffDays} дні тому`;
    } else {
      return date.toLocaleDateString('uk-UA', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      });
    }
  };

  if (loading) {
    return (
      <div className="course-wc-qa-tab">
        <div className="course-wc-loading-spinner">
          <Loader className="animate-spin" size={40} />
          <p>Завантаження питань...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="course-wc-qa-tab">
        <div className="course-wc-error-container">
          <AlertTriangle size={40} className="text-red-500" />
          <h3>Помилка завантаження</h3>
          <p>{error}</p>
          <button 
            className="course-wc-btn-primary"
            onClick={() => window.location.reload()}
          >
            Спробувати знову
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="course-wc-qa-tab">
      <div className="course-wc-content-header">
        <h2>Q&A Сесії</h2>
        <button 
          className="course-wc-btn-create-question" 
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          {showCreateForm ? (
            <>Скасувати створення</>
          ) : (
            <><Plus size={16} /> Створити питання</>
          )}
        </button>
      </div>
      
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

      {/* Форма створення питання */}
      {showCreateForm && (
        <div className="course-wc-qa-create-form">
          <h3>Створити нове питання</h3>
          <form onSubmit={handleCreateQuestion} className="course-wc-qa-form">
            <div className="course-wc-form-group">
              <label htmlFor="question-title">Заголовок питання *</label>
              <input
                id="question-title"
                type="text"
                className="course-wc-qa-input"
                placeholder="Введіть заголовок питання"
                value={newQuestion.title}
                onChange={(e) => setNewQuestion(prev => ({ ...prev, title: e.target.value }))}
                required
              />
            </div>
            
            <div className="course-wc-form-group">
              <label htmlFor="question-description">Деталі питання *</label>
              <textarea
                id="question-description"
                className="course-wc-qa-textarea"
                placeholder="Опишіть ваше питання детально..."
                value={newQuestion.description}
                onChange={(e) => setNewQuestion(prev => ({ ...prev, description: e.target.value }))}
                required
              />
            </div>
            
            <div className="course-wc-form-actions">
              <button
                type="submit"
                className="course-wc-btn-submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="course-wc-button-icon animate-spin" size={16} />
                    <span>Створення...</span>
                  </>
                ) : (
                  <>
                    <Plus className="course-wc-button-icon" size={16} />
                    <span>Опублікувати питання</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Фільтри і сортування */}
      <div className="course-wc-qa-filters-container">
        <div className="course-wc-qa-filters">
          <div className="course-wc-filter-item">
            <Filter size={16} />
            <select 
              className="course-wc-qa-filter" 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">Всі питання</option>
              <option value="answered">З відповідями</option>
              <option value="unanswered">Без відповідей</option>
            </select>
          </div>
          
          <div className="course-wc-filter-item">
            <div className="course-wc-qa-search-container">
              <Search className="course-wc-search-icon" size={16} />
              <input 
                type="text" 
                className="course-wc-qa-search" 
                placeholder="Пошук питань..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
        
        <div className="course-wc-qa-sort">
          <span className="course-wc-sort-label">Сортувати:</span>
          <select 
            className="course-wc-qa-sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="recent">Найновіші</option>
            <option value="oldest">Найстаріші</option>
            <option value="mostAnswers">Найбільше відповідей</option>
            <option value="alphabetical">За алфавітом</option>
          </select>
        </div>
      </div>

      {/* Список питань */}
      {filteredQuestions.length === 0 ? (
        <div className="course-wc-no-content-message">
          <HelpCircle size={40} className="course-wc-icon-large" />
          <h3>Питань не знайдено</h3>
          {filter !== 'all' || searchQuery ? (
            <p>Немає питань, які відповідають вашим критеріям пошуку. Спробуйте змінити параметри фільтрації.</p>
          ) : (
            <p>У цьому курсі поки що немає питань. Будьте першим, хто створить питання!</p>
          )}
        </div>
      ) : (
        <div className="course-wc-qa-list">
          {filteredQuestions.map((question) => (
            <div key={question.id} className="course-wc-qa-item">
              <div className="course-wc-qa-item-header">
                <div className="course-wc-qa-item-author">
                  <img
                    src={question.teacher?.profile_image_url || 'https://via.placeholder.com/40'}
                    alt={question.teacher?.username || 'User'}
                    className="course-wc-qa-avatar"
                  />
                  <div className="course-wc-qa-author-info">
                    <span className="course-wc-qa-author-name">
                      {question.teacher?.username || 'Користувач'}
                    </span>
                    <span className="course-wc-qa-date">
                      <Calendar size={14} />
                      {formatDate(question.created_at)}
                    </span>
                  </div>
                </div>
                <div className="course-wc-qa-stats">
                  <span className="course-wc-qa-answers">
                    <MessageSquare size={16} />
                    {question.answers?.length || 0} відповідей
                  </span>
                  <button 
                    className="course-wc-qa-expand-btn"
                    onClick={() => toggleQuestionExpand(question.id)}
                  >
                    {expandedQuestion === question.id ? (
                      <ChevronUp size={20} />
                    ) : (
                      <ChevronDown size={20} />
                    )}
                  </button>
                </div>
              </div>
              
              <h3 className="course-wc-qa-title">{question.title}</h3>
              
              {/* Опис питання (показуємо повністю, якщо розгорнуто) */}
              <div className={`course-wc-qa-description ${expandedQuestion === question.id ? 'expanded' : ''}`}>
                {expandedQuestion === question.id
                  ? question.description
                  : question.description.length > 200
                    ? `${question.description.substring(0, 200)}...`
                    : question.description}
              </div>
              
              {/* Попередній перегляд відповідей (якщо розгорнуто) */}
              {expandedQuestion === question.id && question.answers && question.answers.length > 0 && (
                <div className="course-wc-qa-answers-preview">
                  <h4>Відповіді:</h4>
                  {question.answers.slice(0, 2).map((answer, index) => (
                    <div key={index} className="course-wc-qa-answer-preview">
                      <div className="course-wc-qa-answer-author">
                        <User size={14} />
                        <span>{answer.user}</span>
                      </div>
                      <p className="course-wc-qa-answer-content">
                        {answer.content.length > 100
                          ? `${answer.content.substring(0, 100)}...`
                          : answer.content}
                      </p>
                    </div>
                  ))}
                  {question.answers.length > 2 && (
                    <div className="course-wc-qa-more-answers">
                      +{question.answers.length - 2} більше відповідей
                    </div>
                  )}
                </div>
              )}
              
              <div className="course-wc-qa-actions">
                <Link to={`/qa/${question.id}`} className="course-wc-btn-qa">
                  Переглянути деталі
                </Link>
                <Link to={`/qa/${question.id}`} className="course-wc-btn-qa-answer">
                  <MessageSquare size={16} />
                  Відповісти
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default QATab;