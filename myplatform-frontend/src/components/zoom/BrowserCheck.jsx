// src/components/zoom/BrowserCheck.jsx
import React from 'react';
import { AlertTriangle, Info, Chrome, Earth } from 'lucide-react';
import './BrowserCheck.css';

const BrowserCheck = ({ onRetry, onClose }) => {
  const detectBrowser = () => {
    const userAgent = navigator.userAgent;
    if (userAgent.indexOf("Chrome") > -1) return "Chrome";
    if (userAgent.indexOf("Safari") > -1) return "Safari";
    if (userAgent.indexOf("Firefox") > -1) return "Firefox";
    if (userAgent.indexOf("MSIE") > -1 || userAgent.indexOf("Trident") > -1) return "IE";
    if (userAgent.indexOf("Edge") > -1) return "Edge";
    return "Unknown";
  };

  const browser = detectBrowser();
  const isChrome = browser === "Chrome";
  const isEdge = browser === "Edge";
  const isFirefox = browser === "Firefox";
  const isSafari = browser === "Safari";

  return (
    <div className="browser-check">
      <div className="browser-check-header">
        <AlertTriangle size={32} className="warning-icon" />
        <h2>Необхідна підтримка SharedArrayBuffer</h2>
        <p>
          Для роботи Zoom Web SDK потрібна підтримка SharedArrayBuffer, яка може бути 
          недоступна у вашому браузері або вимкнена налаштуваннями.
        </p>
      </div>

      <div className="browser-recommendations">
        <h3>Рекомендації:</h3>
        
        {isChrome && (
          <div className="browser-recommendation-item">
            <Chrome size={24} />
            <div>
                <p>Ви використовуєте Chrome. Перевірте, що:</p>
                <ol>
                    <li>Ви використовуєте останню версію Chrome (91+)</li>
                    <li>Сторінка завантажена через HTTPS</li>
                    <li>Відсутні блокувальники вмісту (ad blockers)</li>
                </ol>
            </div>
          </div>
        )}
        
        {isEdge && (
          <div className="browser-recommendation-item">
            <Earth size={24} />
            <p>
              Ви використовуєте Edge. Перевірте, що:
              <ol>
                <li>Ви використовуєте останню версію Edge</li>
                <li>Сторінка завантажена через HTTPS</li>
                <li>Відсутні блокувальники вмісту (ad blockers)</li>
              </ol>
            </p>
          </div>
        )}
        
        {isFirefox && (
          <div className="browser-recommendation-item">
            <Info size={24} />
            <p>
              Firefox має обмежену підтримку SharedArrayBuffer. Рекомендуємо використовувати 
              Chrome або Edge для найкращої роботи Zoom Web SDK.
            </p>
          </div>
        )}
        
        {isSafari && (
          <div className="browser-recommendation-item">
            <Info size={24} />
            <p>
              Safari має обмежену підтримку деяких функцій Zoom Web SDK. Рекомендуємо 
              використовувати Chrome або Edge для найкращих результатів.
            </p>
          </div>
        )}
        
        <div className="browser-action-buttons">
          <button className="retry-button" onClick={onRetry}>
            Спробувати знову
          </button>
          <button className="close-button" onClick={onClose}>
            Повернутися назад
          </button>
        </div>
        
        <div className="alternative-options">
          <h4>Альтернативні варіанти:</h4>
          <ul>
            <li>Використайте настільний додаток Zoom</li>
            <li>Спробуйте відкрити в режимі інкогніто</li>
            <li>Оновіть ваш браузер до останньої версії</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BrowserCheck;