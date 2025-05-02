import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import '../css/Contact.css';
import { 
  FaEnvelope, FaPhone, FaMapMarkerAlt, FaClock, 
  FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, 
  FaTelegramPlane, FaUserAlt, FaCommentAlt, FaCheck
} from 'react-icons/fa';

const Contact = () => {
  // Стан форми
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  
  // Стан валідації
  const [formErrors, setFormErrors] = useState({});
  
  // Стан відправлення
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  
  // Офіси
  const offices = [
    {
      city: 'Київ',
      address: 'вул. Освіти, 10, Київ, 03150',
      phone: '+380 44 123 45 67',
      email: 'kyiv@educationplatform.com',
      hours: 'Пн-Пт: 9:00 - 18:00'
    },
    {
      city: 'Львів',
      address: 'вул. Університетська, 5, Львів, 79000',
      phone: '+380 32 987 65 43',
      email: 'lviv@educationplatform.com',
      hours: 'Пн-Пт: 9:00 - 18:00'
    },
    {
      city: 'Хмельницький',
      address: 'вул. Степана Бандери, 1/1, Хмельницький, 29000',
      phone: '+380 48 765 43 21',
      email: 'khmelnytskyi@educationplatform.com',
      hours: 'Пн-Пт: 10:00 - 19:00'
    }
  ];
  
  // Відділи
  const departments = [
    {
      name: 'Технічна підтримка',
      email: 'support@educationplatform.com',
      description: 'Для питань щодо роботи платформи, проблем з доступом та технічних складнощів'
    },
    {
      name: 'Відділ продажів',
      email: 'sales@educationplatform.com',
      description: 'Для питань щодо платних курсів, групового навчання та корпоративних рішень'
    },
    {
      name: 'Навчальний відділ',
      email: 'education@educationplatform.com',
      description: 'Для питань щодо змісту курсів, сертифікатів та навчальних програм'
    },
    {
      name: 'Кар\'єра',
      email: 'jobs@educationplatform.com',
      description: 'Для питань щодо вакансій та співпраці з викладачами'
    }
  ];
  
  // Встановлюємо заголовок сторінки
  useEffect(() => {
    document.title = "Контакти | Освітня платформа";
    window.scrollTo(0, 0);
  }, []);
  
  // Обробка змін у формі
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Очищаємо помилку при зміні поля
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null
      });
    }
  };
  
  // Валідація форми
  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = "Будь ласка, введіть ваше ім'я";
    }
    
    if (!formData.email.trim()) {
      errors.email = "Будь ласка, введіть вашу електронну пошту";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Будь ласка, введіть коректну електронну пошту";
    }
    
    if (!formData.subject.trim()) {
      errors.subject = "Будь ласка, вкажіть тему повідомлення";
    }
    
    if (!formData.message.trim()) {
      errors.message = "Будь ласка, введіть ваше повідомлення";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Обробка відправлення форми
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      setSubmitError(null);
      
      // Симулюємо відправку форми
      setTimeout(() => {
        setIsSubmitting(false);
        setIsSubmitted(true);
        
        // Скидаємо форму
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: ''
        });
        
        // Скидаємо стан надісланої форми через 5 секунд
        setTimeout(() => {
          setIsSubmitted(false);
        }, 5000);
      }, 1500);
    }
  };
  
  // Рендеринг соціальних мереж
  const renderSocialMedia = () => {
    const socialMedia = [
      { icon: <FaFacebookF />, url: "https://facebook.com", name: "Facebook" },
      { icon: <FaTwitter />, url: "https://twitter.com", name: "Twitter" },
      { icon: <FaInstagram />, url: "https://instagram.com", name: "Instagram" },
      { icon: <FaLinkedinIn />, url: "https://linkedin.com", name: "LinkedIn" }
    ];
    
    return (
      <div className="contact-social-media">
        {socialMedia.map((item, index) => (
          <a 
            key={index} 
            href={item.url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="social-media-link"
            aria-label={item.name}
          >
            {item.icon}
            <span className="social-media-tooltip">{item.name}</span>
          </a>
        ))}
      </div>
    );
  };

  return (
    <div className="contact-page">
      <Header />
      
      <div className="contact-hero">
        <div className="container">
          <h1 className="contact-hero-title">Зв'яжіться з нами</h1>
          <p className="contact-hero-subtitle">
            Маєте питання чи пропозиції? Наша команда завжди готова допомогти!
          </p>
        </div>
      </div>
      
      <div className="container contact-container">
        {/* Інформаційні картки */}
        <section className="contact-info-section">
          <div className="contact-info-cards">
            <div className="contact-card">
              <div className="contact-card-icon">
                <FaEnvelope />
              </div>
              <h3>Електронна пошта</h3>
              <p>Напишіть нам на електронну пошту і ми відповімо протягом 24 годин</p>
              <a href="mailto:info@educationplatform.com" className="contact-link">
                info@educationplatform.com
              </a>
            </div>
            
            <div className="contact-card">
              <div className="contact-card-icon">
                <FaPhone />
              </div>
              <h3>Телефон</h3>
              <p>Зателефонуйте нам для отримання швидкої консультації</p>
              <a href="tel:+380441234567" className="contact-link">
                +380 44 123 45 67
              </a>
            </div>
            
            <div className="contact-card">
              <div className="contact-card-icon">
                <FaMapMarkerAlt />
              </div>
              <h3>Адреса</h3>
              <p>Відвідайте наш офіс для особистої консультації</p>
              <address className="contact-link-text">
                вул. Степа Бандери, 1/1, Хмельницький, 29000, Україна
              </address>
            </div>
          </div>
        </section>
        
        {/* Секція з формою зворотного зв'язку */}
        <section className="contact-form-section">
          <div className="form-container">
            <div className="form-content">
              <h2>Напишіть нам</h2>
              <p>
                Заповніть форму нижче, і наша команда зв'яжеться з вами якомога швидше.
                Ми цінуємо ваш зворотний зв'язок і готові відповісти на будь-які питання.
              </p>
              
              {renderSocialMedia()}
            </div>
            
            <div className="form-wrapper">
              {isSubmitted ? (
                <div className="form-success">
                  <div className="success-icon">
                    <FaCheck />
                  </div>
                  <h3>Дякуємо за повідомлення!</h3>
                  <p>Ми отримали ваш запит і зв'яжемося з вами якомога швидше.</p>
                </div>
              ) : (
                <form className="contact-form" onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label htmlFor="name">
                      <FaUserAlt className="input-icon" />
                      <span>Ваше ім'я</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={formErrors.name ? 'has-error' : ''}
                      placeholder="Введіть ваше ім'я"
                    />
                    {formErrors.name && <div className="error-message">{formErrors.name}</div>}
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="email">
                      <FaEnvelope className="input-icon" />
                      <span>Електронна пошта</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={formErrors.email ? 'has-error' : ''}
                      placeholder="Введіть вашу електронну пошту"
                    />
                    {formErrors.email && <div className="error-message">{formErrors.email}</div>}
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="subject">
                      <FaCommentAlt className="input-icon" />
                      <span>Тема</span>
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className={formErrors.subject ? 'has-error' : ''}
                      placeholder="Вкажіть тему повідомлення"
                    />
                    {formErrors.subject && <div className="error-message">{formErrors.subject}</div>}
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="message">
                      <FaTelegramPlane className="input-icon" />
                      <span>Повідомлення</span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      className={formErrors.message ? 'has-error' : ''}
                      placeholder="Введіть ваше повідомлення"
                      rows="5"
                    ></textarea>
                    {formErrors.message && <div className="error-message">{formErrors.message}</div>}
                  </div>
                  
                  <button 
                    type="submit" 
                    className="submit-button"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Відправлення...' : 'Відправити повідомлення'}
                  </button>
                  
                  {submitError && <div className="submit-error">{submitError}</div>}
                </form>
              )}
            </div>
          </div>
        </section>
        
        {/* Відділи компанії */}
        <section className="contact-departments-section">
          <h2 className="section-title">Наші відділи</h2>
          <p className="section-subtitle">
            Оберіть відділ, який найкраще підходить для вашого запиту
          </p>
          
          <div className="departments-grid">
            {departments.map((department, index) => (
              <div className="department-card" key={index}>
                <h3>{department.name}</h3>
                <p>{department.description}</p>
                <a href={`mailto:${department.email}`} className="department-email">
                  <FaEnvelope className="email-icon" />
                  {department.email}
                </a>
              </div>
            ))}
          </div>
        </section>
        
        {/* Офіси компанії */}
        <section className="contact-offices-section">
          <h2 className="section-title">Наші офіси</h2>
          <p className="section-subtitle">
            Ви завжди можете відвідати один з наших офісів особисто
          </p>
          
          <div className="offices-grid">
            {offices.map((office, index) => (
              <div className="office-card" key={index}>
                <h3 className="office-city">{office.city}</h3>
                <div className="office-info">
                  <div className="office-info-item">
                    <FaMapMarkerAlt className="office-icon" />
                    <span>{office.address}</span>
                  </div>
                  <div className="office-info-item">
                    <FaPhone className="office-icon" />
                    <a href={`tel:${office.phone.replace(/\s/g, '')}`}>{office.phone}</a>
                  </div>
                  <div className="office-info-item">
                    <FaEnvelope className="office-icon" />
                    <a href={`mailto:${office.email}`}>{office.email}</a>
                  </div>
                  <div className="office-info-item">
                    <FaClock className="office-icon" />
                    <span>{office.hours}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
        
        {/* Карта Google Maps */}
        <section className="contact-map-section">
          <h2 className="section-title">Знайдіть нас на карті</h2>
          <div className="map-container">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d458.00240687822634!2d26.981883216528317!3d49.43580316097794!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x473207650faf35fd%3A0x5a07b39f71392d26!2sGrimerka%20M%20-%20beauty%20hall!5e1!3m2!1suk!2sua!4v1746195867734!5m2!1suk!2sua"
            width="100%"
            height="450"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            title="Карта розташування офісу"
          ></iframe>
          </div>
        </section>

        {/* Секція FAQ */}
        <section className="contact-faq-section">
          <h2 className="section-title">Маєте питання?</h2>
          <p className="section-subtitle">
            Можливо, відповідь на ваше питання вже є в нашому розділі частих запитань
          </p>
          <Link to="/faq" className="faq-button">
            Перейти до FAQ
          </Link>
        </section>
      </div>
      
      <Footer />
    </div>
  );
};

export default Contact;