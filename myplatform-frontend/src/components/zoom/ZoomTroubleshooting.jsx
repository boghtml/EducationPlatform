// Додайте цей компонент у src/components/zoom/ZoomTroubleshooting.jsx
import React from 'react';
import { ArrowLeft, Info, Check, AlertTriangle } from 'lucide-react';
import './ZoomTroubleshooting.css';

const ZoomTroubleshooting = ({ onBack }) => {
  return (
    <div className="zoom-troubleshooting">
      <button className="back-button" onClick={onBack}>
        <ArrowLeft size={16} />
        Повернутися назад
      </button>
      
      <div className="troubleshooting-header">
        <Info size={32} className="info-icon" />
        <h2>Усунення проблем із Zoom інтеграцією</h2>
        <p>Якщо у вас виникли проблеми з приєднанням до Zoom зустрічей, спробуйте ці рішення:</p>
      </div>
      
      <div className="troubleshooting-items">
        <div className="troubleshooting-item">
          <h3>Проблема із SharedArrayBuffer</h3>
          <p>
            Zoom потребує спеціальних налаштувань безпеки браузера для Gallery View. Якщо ви бачите 
            помилку про SharedArrayBuffer, спробуйте наступне:
          </p>
          <ul>
            <li>Використовуйте Chrome, Edge або Firefox останньої версії</li>
            <li>Перевірте, чи сайт відкрито з HTTPS (безпечне з'єднання)</li>
            <li>Спробуйте відкрити зустріч у режимі інкогніто</li>
          </ul>
        </div>
        
        <div className="troubleshooting-item">
          <h3>Дозволи на камеру та мікрофон</h3>
          <p>
            Переконайтеся, що ви надали дозвіл на використання камери та мікрофона для цього сайту:
          </p>
          <ol>
            <li>Натисніть на іконку замка в адресному рядку</li>
            <li>Перевірте, що для камери та мікрофона встановлено "Дозволено"</li>
            <li>Якщо ні, змініть налаштування і оновіть сторінку</li>
          </ol>
        </div>
        
        <div className="troubleshooting-item">
          <h3>Альтернативні способи приєднання</h3>
          <p>
            Якщо проблеми тривають, ви можете:
          </p>
          <ul>
            <li>Приєднатися через зовнішнє посилання Zoom (якщо доступне)</li>
            <li>Завантажити та використати настільний клієнт Zoom</li>
            <li>Спробувати інший браузер</li>
          </ul>
        </div>
      </div>
      
      <div className="browser-compatibility">
        <h3>Сумісність браузерів</h3>
        <div className="browser-list">
          <div className="browser-item">
            <span className="browser-name">Chrome (newest)</span>
            <Check className="compatible" />
          </div>
          <div className="browser-item">
            <span className="browser-name">Edge (newest)</span>
            <Check className="compatible" />
          </div>
          <div className="browser-item">
            <span className="browser-name">Firefox (newest)</span>
            <Check className="compatible" />
          </div>
          <div className="browser-item">
            <span className="browser-name">Safari</span>
            <AlertTriangle className="partially" />
            <span className="note">Обмежена підтримка</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ZoomTroubleshooting;