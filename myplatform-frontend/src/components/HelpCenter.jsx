import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import '../css/HelpCenter.css';
import { 
  FaSearch, FaQuestionCircle, FaBook, FaShieldAlt, 
  FaUserGraduate, FaMoneyBillWave, FaLaptopCode, 
  FaChevronRight, FaPlayCircle, FaFileAlt, FaHeadset, 
  FaRocket, FaComments, FaMicrophone, FaEnvelope, FaPhoneAlt,
  FaRegStar, FaUsers, FaCertificate, FaBullhorn
} from 'react-icons/fa';

const HelpCenter = () => {
  // Стан для пошуку
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const searchInputRef = useRef(null);
  
  // Категорії допомоги
  const helpCategories = [
    { 
      id: 'getting-started', 
      name: 'Початок роботи', 
      icon: <FaRocket />,
      description: 'Основи використання платформи та перші кроки'
    },
    { 
      id: 'account', 
      name: 'Обліковий запис', 
      icon: <FaShieldAlt />,
      description: 'Керування профілем, безпека та налаштування'
    },
    { 
      id: 'courses', 
      name: 'Курси та навчання', 
      icon: <FaUserGraduate />,
      description: 'Інформація про пошук і проходження курсів' 
    },
    { 
      id: 'payment', 
      name: 'Оплата та підписки', 
      icon: <FaMoneyBillWave />,
      description: 'Питання щодо оплати, підписок та відшкодувань'
    },
    { 
      id: 'technical', 
      name: 'Технічна підтримка', 
      icon: <FaLaptopCode />,
      description: 'Вирішення технічних проблем та системні вимоги'
    },
    { 
      id: 'certificates', 
      name: 'Сертифікати', 
      icon: <FaCertificate />,
      description: 'Отримання та перевірка сертифікатів'
    }
  ];
  
  // Популярні статті
  const popularArticles = [
    {
      id: 1,
      title: 'Як розпочати навчання на платформі?',
      category: 'getting-started',
      views: 5421,
      link: '/help/articles/how-to-start-learning'
    },
    {
      id: 2,
      title: 'Налаштування двофакторної автентифікації',
      category: 'account',
      views: 4328,
      link: '/help/articles/two-factor-authentication'
    },
    {
      id: 3,
      title: 'Проблеми з відтворенням відео на курсах',
      category: 'technical',
      views: 3876,
      link: '/help/articles/video-playback-issues'
    },
    {
      id: 4,
      title: 'Як отримати сертифікат після завершення курсу?',
      category: 'certificates',
      views: 3541,
      link: '/help/articles/getting-certificates'
    },
    {
      id: 5,
      title: 'Способи оплати преміум-курсів',
      category: 'payment',
      views: 3257,
      link: '/help/articles/payment-methods'
    },
    {
      id: 6,
      title: 'Як скасувати підписку?',
      category: 'payment',
      views: 2984,
      link: '/help/articles/cancel-subscription'
    }
  ];
  
  // Відеоінструкції
  const videoTutorials = [
    {
      id: 1,
      title: 'Навігація по платформі',
      thumbnail: 'https://via.placeholder.com/300x180?text=Навігація',
      duration: '4:32',
      link: '/help/videos/platform-navigation'
    },
    {
      id: 2,
      title: 'Як записатися на курс',
      thumbnail: 'https://via.placeholder.com/300x180?text=Запис+на+курс',
      duration: '3:45',
      link: '/help/videos/course-enrollment'
    },
    {
      id: 3,
      title: 'Використання інтерактивних елементів',
      thumbnail: 'https://via.placeholder.com/300x180?text=Інтерактивні+елементи',
      duration: '5:18',
      link: '/help/videos/interactive-elements'
    },
    {
      id: 4,
      title: 'Робота з нотатками на уроках',
      thumbnail: 'https://via.placeholder.com/300x180?text=Робота+з+нотатками',
      duration: '3:21',
      link: '/help/videos/notes-management'
    }
  ];
  
  // Часті запитання для швидкого доступу
  const quickFaqs = [
    {
      id: 1,
      question: 'Як змінити електронну пошту?',
      answer: 'Щоб змінити електронну пошту, перейдіть до налаштувань облікового запису, виберіть "Змінити електронну пошту" та слідуйте інструкціям. Вам потрібно буде підтвердити нову адресу.',
      link: '/help/articles/change-email'
    },
    {
      id: 2,
      question: 'Де знайти мої сертифікати?',
      answer: 'Ваші сертифікати доступні в розділі "Досягнення" на панелі керування. Там ви можете переглядати, завантажувати та ділитися своїми сертифікатами.',
      link: '/help/articles/find-certificates'
    },
    {
      id: 3,
      question: 'Як відстежувати свій прогрес?',
      answer: 'Прогрес у кожному курсі відображається на сторінці курсу та на панелі керування в розділі "Мої курси". Там ви побачите відсоток завершення та наступні уроки.',
      link: '/help/articles/track-progress'
    },
    {
      id: 4,
      question: 'Чи можна дивитись уроки без інтернету?',
      answer: 'Так, у мобільному додатку ви можете завантажити уроки для офлайн-перегляду. На веб-версії ця функція недоступна, потрібне підключення до інтернету.',
      link: '/help/articles/offline-lessons'
    }
  ];
  
  // Встановлюємо заголовок сторінки
  useEffect(() => {
    document.title = "Центр допомоги | Освітня платформа";
    window.scrollTo(0, 0);
  }, []);
  
  // Функція для пошуку за запитом
  const handleSearch = (e) => {
    e.preventDefault();
    
    // Тут буде логіка пошуку (в реальному проекті)
    if (searchQuery.trim() !== '') {
      // Імітуємо результати пошуку
      const results = [
        {
          id: 101,
          title: 'Як змінити пароль від облікового запису',
          category: 'account',
          excerpt: 'Інструкція зі зміни паролю та налаштування безпеки вашого облікового запису...',
          link: '/help/articles/change-password'
        },
        {
          id: 102,
          title: 'Проблеми з відтворенням відео',
          category: 'technical',
          excerpt: 'Вирішення поширених проблем з відтворенням відеоуроків на платформі...',
          link: '/help/articles/video-issues'
        },
        {
          id: 103,
          title: 'Як отримати доступ до додаткових матеріалів курсу',
          category: 'courses',
          excerpt: 'Інформація про доступ до супровідних матеріалів, презентацій та файлів курсу...',
          link: '/help/articles/course-materials'
        }
      ];
      
      setSearchResults(results);
      setShowSearchResults(true);
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  };
  
  // Функція для очищення пошукової видачі
  const clearSearch = () => {
    setSearchQuery('');
    setShowSearchResults(false);
    setSearchResults([]);
    searchInputRef.current.focus();
  };
  
  // Функція для отримання іконки категорії
  const getCategoryIcon = (categoryId) => {
    const category = helpCategories.find(cat => cat.id === categoryId);
    return category ? category.icon : <FaQuestionCircle />;
  };
  
  // Функція для отримання назви категорії
  const getCategoryName = (categoryId) => {
    const category = helpCategories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Загальне';
  };

  return (
    <div className="help-center-page">
      <Header />
      
      <div className="help-hero">
        <div className="container">
          <h1 className="help-hero-title">Центр допомоги</h1>
          <p className="help-hero-subtitle">
            Знайдіть відповіді на ваші запитання та дізнайтеся, як отримати максимум від навчання
          </p>
          
          <div className="help-search">
            <form onSubmit={handleSearch}>
              <div className="search-input-wrapper">
                <FaSearch className="search-icon" />
                <input
                  type="text"
                  ref={searchInputRef}
                  placeholder="Пошук у центрі допомоги..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
                {searchQuery && (
                  <button 
                    type="button" 
                    className="clear-search" 
                    onClick={clearSearch}
                  >
                    &times;
                  </button>
                )}
                <button type="submit" className="search-button">
                  Знайти
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      
      <div className="container help-container">
        {/* Результати пошуку */}
        {showSearchResults && (
          <div className="search-results-section">
            <div className="section-header">
              <h2>Результати пошуку для "{searchQuery}"</h2>
              <button 
                className="close-results-button"
                onClick={() => setShowSearchResults(false)}
              >
                Закрити результати
              </button>
            </div>
            
            {searchResults.length > 0 ? (
              <div className="search-results-list">
                {searchResults.map(result => (
                  <div className="search-result-item" key={result.id}>
                    <div className="result-category">
                      {getCategoryIcon(result.category)}
                      <span>{getCategoryName(result.category)}</span>
                    </div>
                    <h3 className="result-title">
                      <Link to={result.link}>{result.title}</Link>
                    </h3>
                    <p className="result-excerpt">{result.excerpt}</p>
                    <Link to={result.link} className="read-more-link">
                      Читати далі <FaChevronRight className="arrow-icon" />
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-results">
                <div className="no-results-icon">
                  <FaQuestionCircle />
                </div>
                <h3>Результатів не знайдено</h3>
                <p>
                  Спробуйте інший пошуковий запит або перегляньте категорії допомоги нижче.
                </p>
              </div>
            )}
          </div>
        )}
        
        {/* Категорії допомоги */}
        {!showSearchResults && (
          <>
            <div className="help-categories-section">
              <div className="section-header">
                <h2>Категорії допомоги</h2>
                <p>Виберіть категорію, щоб знайти відповіді на ваші запитання</p>
              </div>
              
              <div className="help-categories-grid">
                {helpCategories.map(category => (
                  <Link to={`/help/categories/${category.id}`} className="category-card" key={category.id}>
                    <div className="category-icon">
                      {category.icon}
                    </div>
                    <h3>{category.name}</h3>
                    <p>{category.description}</p>
                    <span className="explore-link">
                      Переглянути <FaChevronRight className="arrow-icon" />
                    </span>
                  </Link>
                ))}
              </div>
            </div>
            
            {/* Популярні статті */}
            <div className="popular-articles-section">
              <div className="section-header">
                <h2>Популярні статті</h2>
                <Link to="/help/articles" className="view-all-link">
                  Переглянути всі статті
                </Link>
              </div>
              
              <div className="articles-list">
                {popularArticles.map(article => (
                  <div className="article-item" key={article.id}>
                    <div className="article-category">
                      {getCategoryIcon(article.category)}
                      <span>{getCategoryName(article.category)}</span>
                    </div>
                    <h3 className="article-title">
                      <Link to={article.link}>{article.title}</Link>
                    </h3>
                    <div className="article-meta">
                      <span className="article-views">
                        <FaRegStar className="meta-icon" />
                        {article.views} переглядів
                      </span>
                    </div>
                    <Link to={article.link} className="read-article-link">
                      Читати статтю <FaChevronRight className="arrow-icon" />
                    </Link>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Відеоінструкції */}
            <div className="video-tutorials-section">
              <div className="section-header">
                <h2>Відеоінструкції</h2>
                <Link to="/help/videos" className="view-all-link">
                  Переглянути всі відео
                </Link>
              </div>
              
              <div className="video-grid">
                {videoTutorials.map(video => (
                  <Link to={video.link} className="video-card" key={video.id}>
                    <div className="video-thumbnail">
                      <img src={video.thumbnail} alt={video.title} />
                      <div className="video-duration">{video.duration}</div>
                      <div className="play-overlay">
                        <FaPlayCircle />
                      </div>
                    </div>
                    <h3 className="video-title">{video.title}</h3>
                  </Link>
                ))}
              </div>
            </div>
            
            {/* Швидкі відповіді на часті запитання */}
            <div className="quick-faqs-section">
              <div className="section-header">
                <h2>Швидкі відповіді</h2>
                <Link to="/faq" className="view-all-link">
                  Перейти до повного FAQ
                </Link>
              </div>
              
              <div className="faqs-grid">
                {quickFaqs.map(faq => (
                  <div className="faq-card" key={faq.id}>
                    <h3 className="faq-question">
                      <FaQuestionCircle className="question-icon" />
                      {faq.question}
                    </h3>
                    <p className="faq-answer">{faq.answer}</p>
                    <Link to={faq.link} className="faq-details-link">
                      Детальніше <FaChevronRight className="arrow-icon" />
                    </Link>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Контактна секція */}
            <div className="help-contact-section">
              <div className="contact-content">
                <div className="contact-text">
                  <h2>Не знайшли відповідь?</h2>
                  <p>
                    Наша команда підтримки завжди готова допомогти вам. Зв'яжіться з нами будь-яким зручним способом.
                  </p>
                  
                  <div className="contact-options">
                    <div className="contact-option">
                      <div className="contact-icon">
                        <FaHeadset />
                      </div>
                      <div className="contact-details">
                        <h3>Чат з підтримкою</h3>
                        <p>Отримайте миттєву допомогу від наших консультантів</p>
                        <button className="start-chat-button">
                          Почати чат
                        </button>
                      </div>
                    </div>
                    
                    <div className="contact-option">
                      <div className="contact-icon">
                        <FaEnvelope />
                      </div>
                      <div className="contact-details">
                        <h3>Електронна пошта</h3>
                        <p>Надішліть нам повідомлення і ми відповімо протягом 24 годин</p>
                        <a href="mailto:support@educationplatform.com" className="contact-email">
                          support@educationplatform.com
                        </a>
                      </div>
                    </div>
                    
                    <div className="contact-option">
                      <div className="contact-icon">
                        <FaPhoneAlt />
                      </div>
                      <div className="contact-details">
                        <h3>Телефон</h3>
                        <p>З понеділка по п'ятницю, з 9:00 до 18:00</p>
                        <a href="tel:+380441234567" className="contact-phone">
                          +380 44 123 45 67
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="contact-image">
                  <img 
                    src="https://via.placeholder.com/500x350?text=Служба+підтримки" 
                    alt="Служба підтримки"
                  />
                </div>
              </div>
            </div>
            
            {/* Додаткові ресурси */}
            <div className="additional-resources-section">
              <div className="section-header">
                <h2>Додаткові ресурси</h2>
              </div>
              
              <div className="resources-grid">
                <Link to="/help/guides" className="resource-card">
                  <div className="resource-icon">
                    <FaBook />
                  </div>
                  <h3>Посібники користувача</h3>
                  <p>Детальні інструкції з використання всіх функцій платформи</p>
                </Link>
                
                <Link to="/help/community" className="resource-card">
                  <div className="resource-icon">
                    <FaUsers />
                  </div>
                  <h3>Спільнота</h3>
                  <p>Приєднуйтесь до обговорень та отримуйте допомогу від інших користувачів</p>
                </Link>
                
                <Link to="/help/webinars" className="resource-card">
                  <div className="resource-icon">
                    <FaMicrophone />
                  </div>
                  <h3>Вебінари</h3>
                  <p>Розклад майбутніх навчальних вебінарів та записи минулих</p>
                </Link>
                
                <Link to="/help/updates" className="resource-card">
                  <div className="resource-icon">
                    <FaBullhorn />
                  </div>
                  <h3>Оновлення платформи</h3>
                  <p>Інформація про нові функції та вдосконалення платформи</p>
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default HelpCenter;