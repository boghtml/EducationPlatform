// src/components/zoom/BrowserCheck.jsx - Enhanced version
import React from 'react';
import { AlertTriangle, Info, Chrome, Earth, Shield, Server, ExternalLink } from 'lucide-react';
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
  const isSecureContext = window.isSecureContext;
  const hasSharedArrayBuffer = typeof SharedArrayBuffer !== 'undefined';

  // Check for development environment
  const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

  return (
    <div className="browser-check">
      <div className="browser-check-header">
        <AlertTriangle size={32} className="warning-icon" />
        <h2>Необхідна підтримка SharedArrayBuffer</h2>
        <p>
          Для роботи Zoom Web SDK потрібна підтримка SharedArrayBuffer та спеціальні заголовки безпеки.
          {!hasSharedArrayBuffer && " Ваш браузер не підтримує SharedArrayBuffer або веб-сайт не має необхідних налаштувань безпеки."}
        </p>
      </div>

      <div className="browser-compatibility-status">
        <h3>Статус вашого браузера</h3>
        
        <div className="compatibility-check-list">
          <div className={`compatibility-check-item ${browser ? 'pass' : 'fail'}`}>
            <div className="check-icon">
              {isChrome ? <Chrome size={20} /> : 
               isEdge ? <Earth size={20} /> : 
               <Info size={20} />}
            </div>
            <div className="check-info">
              <span className="check-name">Браузер</span>
              <span className="check-value">{browser}</span>
              {!isChrome && !isEdge && (
                <span className="check-note">Рекомендуємо використовувати Chrome або Edge</span>
              )}
            </div>
          </div>
          
          <div className={`compatibility-check-item ${isSecureContext ? 'pass' : 'fail'}`}>
            <div className="check-icon">
              <Shield size={20} />
            </div>
            <div className="check-info">
              <span className="check-name">Безпечний контекст</span>
              <span className="check-value">{isSecureContext ? 'Так' : 'Ні'}</span>
              {!isSecureContext && (
                <span className="check-note">Веб-сайт повинен бути завантажений через HTTPS або localhost</span>
              )}
            </div>
          </div>
          
          <div className={`compatibility-check-item ${hasSharedArrayBuffer ? 'pass' : 'fail'}`}>
            <div className="check-icon">
              <Server size={20} />
            </div>
            <div className="check-info">
              <span className="check-name">SharedArrayBuffer</span>
              <span className="check-value">{hasSharedArrayBuffer ? 'Доступний' : 'Недоступний'}</span>
              {!hasSharedArrayBuffer && (
                <span className="check-note">Потрібні спеціальні заголовки безпеки на сервері</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="browser-recommendations">
        <h3>Що можна зробити для вирішення цієї проблеми?</h3>
        
        {isDevelopment && (
          <div className="dev-recommendation">
            <h4>Розробникам:</h4>
            <ol>
              <li>
                Переконайтеся, що у вас створено файл <code>src/setupProxy.js</code> з необхідними заголовками:
                <pre>
                  {`// Приклад
res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');`}
                </pre>
              </li>
              <li>
                Переконайтеся, що Django має відповідний middleware:
                <pre>
                  {`class ZoomSecurityMiddleware:
    def __call__(self, request):
        response = self.get_response(request)
        response["Cross-Origin-Opener-Policy"] = "same-origin"
        response["Cross-Origin-Embedder-Policy"] = "require-corp"
        response["Cross-Origin-Resource-Policy"] = "cross-origin"
        return response`}
                </pre>
              </li>
              <li>
                Перезапустіть і Django-сервер, і React-сервер
              </li>
            </ol>
          </div>
        )}
        
        <div className="user-recommendation">
          <h4>Користувачам:</h4>
          <ol>
            <li>Використовуйте браузер Google Chrome або Microsoft Edge останньої версії</li>
            <li>Переконайтеся, що ви завантажили сайт через безпечне з'єднання (HTTPS)</li>
            <li>Вимкніть блокувальники реклами та розширення, що можуть блокувати SharedArrayBuffer</li>
            <li>Спробуйте відкрити в режимі інкогніто</li>
          </ol>
        </div>
        
        <div className="alternative-options">
          <h4>Альтернативні варіанти:</h4>
          <ul>
            <li>
              <a href="https://zoom.us/download" target="_blank" rel="noopener noreferrer" className="external-link">
                <ExternalLink size={14} />
                Завантажте та використовуйте настільний додаток Zoom
              </a>
            </li>
            <li>Скористайтеся посиланням "Відкрити у Zoom" на сторінці деталей зустрічі</li>
            <li>Зверніться до адміністратора сайту для налаштування підтримки SharedArrayBuffer</li>
          </ul>
        </div>
      </div>
      
      <div className="browser-action-buttons">
        <button className="retry-button" onClick={onRetry}>
          Спробувати знову
        </button>
        <button className="close-button" onClick={onClose}>
          Повернутися назад
        </button>
      </div>
    </div>
  );
};

export default BrowserCheck;