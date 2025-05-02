import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import '../css/SiteMap.css';
import { 
  FaHome, FaBook, FaUserGraduate, FaCalendarAlt, FaNewspaper, 
  FaComments, FaUserShield, FaInfo, FaQuestionCircle, FaEnvelope, 
  FaClipboardList, FaBrain, FaRegHandshake, FaShieldAlt, FaUsers, 
  FaSignInAlt, FaUserPlus, FaChalkboardTeacher
} from 'react-icons/fa';

const SiteMap = () => {
  useEffect(() => {
    
    document.title = "Карта сайту | Освітня платформа";
    
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('show');
        }
      });
    }, { threshold: 0.1 });

    const sections = document.querySelectorAll('.sitemap-section');
    sections.forEach(section => {
      observer.observe(section);
    });

    return () => {
      sections.forEach(section => {
        observer.unobserve(section);
      });
    };
  }, []);

  return (
    <div className="sitemap-page">
      <Header />
      
      <div className="sitemap-hero">
        <div className="container">
          <h1 className="sitemap-hero-title">Карта сайту</h1>
          <p className="sitemap-hero-subtitle">Повний перелік сторінок та розділів нашої освітньої платформи</p>
        </div>
      </div>
      
      <div className="container sitemap-container">
        <div className="sitemap-intro">
          <p>
            Ця сторінка допоможе вам знайти будь-який розділ або функцію нашої освітньої платформи. 
            Для зручності навігації всі сторінки згруповані за категоріями. Якщо у вас виникли 
            запитання, не соромтеся <Link to="/contact">зв'язатися з нами</Link>.
          </p>
        </div>
        
        <div className="sitemap-content">
          <section className="sitemap-section">
            <div className="sitemap-section-header">
              <FaHome className="sitemap-section-icon" />
              <h2>Головні сторінки</h2>
            </div>
            <div className="sitemap-links">
              <Link to="/" className="sitemap-link">
                <FaHome className="sitemap-link-icon" />
                <span className="sitemap-link-text">Головна сторінка</span>
              </Link>
              <Link to="/about" className="sitemap-link">
                <FaInfo className="sitemap-link-icon" />
                <span className="sitemap-link-text">Про нас</span>
              </Link>
              <Link to="/contact" className="sitemap-link">
                <FaEnvelope className="sitemap-link-icon" />
                <span className="sitemap-link-text">Контакти</span>
              </Link>
              <Link to="/faq" className="sitemap-link">
                <FaQuestionCircle className="sitemap-link-icon" />
                <span className="sitemap-link-text">Часті запитання</span>
              </Link>
            </div>
          </section>
          
          <section className="sitemap-section">
            <div className="sitemap-section-header">
              <FaBook className="sitemap-section-icon" />
              <h2>Курси та навчання</h2>
            </div>
            <div className="sitemap-links">
              <Link to="/" className="sitemap-link">
                <FaBook className="sitemap-link-icon" />
                <span className="sitemap-link-text">Каталог курсів</span>
              </Link>
              <Link to="/my-courses" className="sitemap-link">
                <FaClipboardList className="sitemap-link-icon" />
                <span className="sitemap-link-text">Мої курси</span>
              </Link>
              <Link to="/categories" className="sitemap-link">
                <FaBrain className="sitemap-link-icon" />
                <span className="sitemap-link-text">Категорії курсів</span>
              </Link>
              <Link to="/latest-courses" className="sitemap-link">
                <FaBook className="sitemap-link-icon" />
                <span className="sitemap-link-text">Найновіші курси</span>
              </Link>
              <Link to="/popular-courses" className="sitemap-link">
                <FaBook className="sitemap-link-icon" />
                <span className="sitemap-link-text">Популярні курси</span>
              </Link>
              <Link to="/free-courses" className="sitemap-link">
                <FaBook className="sitemap-link-icon" />
                <span className="sitemap-link-text">Безкоштовні курси</span>
              </Link>
              <Link to="/premium-courses" className="sitemap-link">
                <FaBook className="sitemap-link-icon" />
                <span className="sitemap-link-text">Преміум курси</span>
              </Link>
              <Link to="/certificate-programs" className="sitemap-link">
                <FaUserGraduate className="sitemap-link-icon" />
                <span className="sitemap-link-text">Програми з сертифікацією</span>
              </Link>
            </div>
          </section>
          
          <section className="sitemap-section">
            <div className="sitemap-section-header">
              <FaUserGraduate className="sitemap-section-icon" />
              <h2>Користувацькі сторінки</h2>
            </div>
            <div className="sitemap-links">
              <Link to="/login" className="sitemap-link">
                <FaSignInAlt className="sitemap-link-icon" />
                <span className="sitemap-link-text">Вхід</span>
              </Link>
              <Link to="/register" className="sitemap-link">
                <FaUserPlus className="sitemap-link-icon" />
                <span className="sitemap-link-text">Реєстрація</span>
              </Link>
              <Link to="/forgot-password" className="sitemap-link">
                <FaUserShield className="sitemap-link-icon" />
                <span className="sitemap-link-text">Відновлення паролю</span>
              </Link>
              <Link to="/dashboard" className="sitemap-link">
                <FaClipboardList className="sitemap-link-icon" />
                <span className="sitemap-link-text">Панель керування</span>
              </Link>
              <Link to="/profile" className="sitemap-link">
                <FaUserGraduate className="sitemap-link-icon" />
                <span className="sitemap-link-text">Профіль користувача</span>
              </Link>
              <Link to="/notes-management" className="sitemap-link">
                <FaClipboardList className="sitemap-link-icon" />
                <span className="sitemap-link-text">Управління нотатками</span>
              </Link>
              <Link to="/settings" className="sitemap-link">
                <FaUserShield className="sitemap-link-icon" />
                <span className="sitemap-link-text">Налаштування облікового запису</span>
              </Link>
            </div>
          </section>
          
          <section className="sitemap-section">
            <div className="sitemap-section-header">
              <FaCalendarAlt className="sitemap-section-icon" />
              <h2>Події та активності</h2>
            </div>
            <div className="sitemap-links">
              <Link to="/events" className="sitemap-link">
                <FaCalendarAlt className="sitemap-link-icon" />
                <span className="sitemap-link-text">Всі події</span>
              </Link>
              <Link to="/webinars" className="sitemap-link">
                <FaCalendarAlt className="sitemap-link-icon" />
                <span className="sitemap-link-text">Вебінари</span>
              </Link>
              <Link to="/workshops" className="sitemap-link">
                <FaCalendarAlt className="sitemap-link-icon" />
                <span className="sitemap-link-text">Практичні заняття</span>
              </Link>
              <Link to="/conferences" className="sitemap-link">
                <FaCalendarAlt className="sitemap-link-icon" />
                <span className="sitemap-link-text">Конференції</span>
              </Link>
              <Link to="/calendar" className="sitemap-link">
                <FaCalendarAlt className="sitemap-link-icon" />
                <span className="sitemap-link-text">Календар подій</span>
              </Link>
            </div>
          </section>
          
          <section className="sitemap-section">
            <div className="sitemap-section-header">
              <FaNewspaper className="sitemap-section-icon" />
              <h2>Блог та інформація</h2>
            </div>
            <div className="sitemap-links">
              <Link to="/blog" className="sitemap-link">
                <FaNewspaper className="sitemap-link-icon" />
                <span className="sitemap-link-text">Блог</span>
              </Link>
              <Link to="/news" className="sitemap-link">
                <FaNewspaper className="sitemap-link-icon" />
                <span className="sitemap-link-text">Новини</span>
              </Link>
              <Link to="/resources" className="sitemap-link">
                <FaNewspaper className="sitemap-link-icon" />
                <span className="sitemap-link-text">Освітні ресурси</span>
              </Link>
              <Link to="/guides" className="sitemap-link">
                <FaNewspaper className="sitemap-link-icon" />
                <span className="sitemap-link-text">Посібники</span>
              </Link>
              <Link to="/research" className="sitemap-link">
                <FaNewspaper className="sitemap-link-icon" />
                <span className="sitemap-link-text">Дослідження</span>
              </Link>
            </div>
          </section>
          
          <section className="sitemap-section">
            <div className="sitemap-section-header">
              <FaUsers className="sitemap-section-icon" />
              <h2>Спільнота</h2>
            </div>
            <div className="sitemap-links">
              <Link to="/reviews" className="sitemap-link">
                <FaComments className="sitemap-link-icon" />
                <span className="sitemap-link-text">Відгуки</span>
              </Link>
              <Link to="/forum" className="sitemap-link">
                <FaComments className="sitemap-link-icon" />
                <span className="sitemap-link-text">Форум</span>
              </Link>
              <Link to="/teachers" className="sitemap-link">
                <FaChalkboardTeacher className="sitemap-link-icon" />
                <span className="sitemap-link-text">Наші викладачі</span>
              </Link>
              <Link to="/students" className="sitemap-link">
                <FaUserGraduate className="sitemap-link-icon" />
                <span className="sitemap-link-text">Історії успіху студентів</span>
              </Link>
              <Link to="/social" className="sitemap-link">
                <FaUsers className="sitemap-link-icon" />
                <span className="sitemap-link-text">Соціальні мережі</span>
              </Link>
            </div>
          </section>
          
          <section className="sitemap-section">
            <div className="sitemap-section-header">
              <FaShieldAlt className="sitemap-section-icon" />
              <h2>Правова інформація</h2>
            </div>
            <div className="sitemap-links">
              <Link to="/privacy-policy" className="sitemap-link">
                <FaShieldAlt className="sitemap-link-icon" />
                <span className="sitemap-link-text">Політика конфіденційності</span>
              </Link>
              <Link to="/terms-of-service" className="sitemap-link">
                <FaRegHandshake className="sitemap-link-icon" />
                <span className="sitemap-link-text">Умови використання</span>
              </Link>
              <Link to="/cookies-policy" className="sitemap-link">
                <FaShieldAlt className="sitemap-link-icon" />
                <span className="sitemap-link-text">Політика щодо файлів cookie</span>
              </Link>
              <Link to="/refund-policy" className="sitemap-link">
                <FaRegHandshake className="sitemap-link-icon" />
                <span className="sitemap-link-text">Політика повернення коштів</span>
              </Link>
              <Link to="/site-map" className="sitemap-link active">
                <FaClipboardList className="sitemap-link-icon" />
                <span className="sitemap-link-text">Карта сайту</span>
              </Link>
            </div>
          </section>
        </div>
        
        <div className="sitemap-search-section">
          <h2>Не можете знайти потрібну сторінку?</h2>
          <p>Скористайтеся пошуком або зв'яжіться з нашою службою підтримки</p>
          <div className="sitemap-search-actions">
            <Link to="/search" className="sitemap-search-button">
              Пошук по сайту
            </Link>
            <Link to="/contact" className="sitemap-contact-button">
              Зв'язатися з нами
            </Link>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default SiteMap;