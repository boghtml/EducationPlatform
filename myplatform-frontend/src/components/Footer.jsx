import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
  FaYoutube,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaHeart,
  FaArrowUp
} from 'react-icons/fa';
import '../css/Footer.css'; 

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');
  const [newsletterSuccess, setNewsletterSuccess] = useState(false);
  const [newsletterError, setNewsletterError] = useState(null);

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (!email) {
      setNewsletterError('Будь ласка, введіть вашу електронну пошту.');
      return;
    }
    // Simulate API call for newsletter subscription
    setTimeout(() => {
      setNewsletterSuccess(true);
      setEmail('');
      setNewsletterError(null);
      setTimeout(() => setNewsletterSuccess(false), 3000);
    }, 1000);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="site-footer">
      <div className="footer-top">
        <div className="container">
          <div className="footer-content">
            <div className="footer-about">
              <h3 className="footer-heading">Платформа</h3>
              <p className="footer-description">
                Комплексна платформа онлайн-навчання, створена для забезпечення інтерактивного 
                та захопливого освітнього досвіду. Розширюйте свої знання, вивчайте нові навички 
                та спілкуйтеся з експертними викладачами з будь-якої точки світу.
              </p>
              <div className="footer-social">
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="social-link">
                  <FaFacebookF />
                  <span className="social-tooltip">Facebook</span>
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="social-link">
                  <FaTwitter />
                  <span className="social-tooltip">Twitter</span>
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="social-link">
                  <FaInstagram />
                  <span className="social-tooltip">Instagram</span>
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="social-link">
                  <FaLinkedinIn />
                  <span className="social-tooltip">LinkedIn</span>
                </a>
                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="social-link">
                  <FaYoutube />
                  <span className="social-tooltip">YouTube</span>
                </a>
              </div>
            </div>

            <div className="footer-links">
              <h3 className="footer-heading">Швидкі посилання</h3>
              <ul className="footer-menu">
                <li><Link to="/">Головна</Link></li>
                <li><Link to="/courses">Курси</Link></li>
                <li><Link to="/about">Про нас</Link></li>
                <li><Link to="/events">Події</Link></li>
                <li><Link to="/blog">Блог</Link></li>
                <li><Link to="/contact">Контакти</Link></li>
              </ul>
            </div>

            <div className="footer-links">
              <h3 className="footer-heading">Підтримка</h3>
              <ul className="footer-menu">
                <li><Link to="/faq">Часті запитання</Link></li>
                <li><Link to="/help">Центр підтримки</Link></li>
                <li><Link to="/privacy-policy">Політика конфіденційності</Link></li>
                <li><Link to="/terms-of-service">Умови використання</Link></li>
                <li><Link to="/refund-policy">Політика повернення</Link></li>
                <li><Link to="/contact">Зв’язатися з нами</Link></li>
              </ul>
            </div>

            <div className="footer-contact">
              <h3 className="footer-heading">Контакти</h3>
              <ul className="footer-contact-info">
                <li>
                  <FaMapMarkerAlt />
                  <span>вул. Освіти, 10, Київ, 03150, Україна</span>
                </li>
                <li>
                  <FaPhone />
                  <a href="tel:+380441234567">+380 (44) 123-4567</a>
                </li>
                <li>
                  <FaEnvelope />
                  <a href="mailto:info@platforma.com">info@platforma.com</a>
                </li>
              </ul>
              <div className="footer-newsletter">
                <h4>Підписка на новини</h4>
                {newsletterSuccess && (
                  <div className="alert alert-success" role="alert">
                    Успішно підписано на розсилку!
                  </div>
                )}
                {newsletterError && (
                  <div className="alert alert-danger" role="alert">
                    {newsletterError}
                  </div>
                )}
                <form onSubmit={handleNewsletterSubmit} className="newsletter-form">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Введіть вашу електронну пошту"
                    className="newsletter-input"
                    aria-label="Електронна пошта для підписки"
                  />
                  <button type="submit" className="newsletter-button">
                    Підписатися
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container">
          <p className="copyright">
            © {currentYear} Платформа. Усі права захищено. Створено з <FaHeart className="heart-icon" /> для студентів у всьому світі.
          </p>
          <div className="footer-bottom-links">
            <Link to="/privacy-policy">Конфіденційність</Link>
            <Link to="/terms-of-service">Умови</Link>
            <Link to="/site-map">Карта сайту</Link>
          </div>
          <button className="back-to-top" onClick={scrollToTop} aria-label="Повернутися наверх">
            <FaArrowUp />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;