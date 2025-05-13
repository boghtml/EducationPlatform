import React, { useState } from 'react';
import TeacherHeader from './TeacherHeader';
import TeacherSidebar from './TeacherSidebar';
import '../../css/teacher/TeacherHelp.css';
import { 
  FaQuestion, 
  FaBook, 
  FaTools, 
  FaVideo, 
  FaUserGraduate, 
  FaChalkboardTeacher, 
  FaTasks, 
  FaSearchPlus, 
  FaEnvelope, 
  FaFileAlt,
  FaUsers,
  FaChartLine
} from 'react-icons/fa';

function TeacherHelp() {
  const [activeCategory, setActiveCategory] = useState('getting-started');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaqs, setExpandedFaqs] = useState([]);

  const helpCategories = [
    { id: 'getting-started', name: 'Початок роботи', icon: <FaBook /> },
    { id: 'courses', name: 'Курси', icon: <FaChalkboardTeacher /> },
    { id: 'assignments', name: 'Завдання', icon: <FaTasks /> },
    { id: 'students', name: 'Студенти', icon: <FaUserGraduate /> },
    { id: 'analytics', name: 'Аналітика', icon: <FaChartLine /> },
    { id: 'materials', name: 'Матеріали', icon: <FaFileAlt /> },
    { id: 'technical', name: 'Технічна підтримка', icon: <FaTools /> },
  ];

  const faqData = {
    'getting-started': [
      {
        question: 'Як почати створювати новий курс?',
        answer: 'Щоб створити новий курс, перейдіть на сторінку "Мої курси" та натисніть кнопку "Створити новий курс". Заповніть необхідну інформацію про курс, включаючи назву, опис, тривалість та статус (безкоштовний або преміум). Після створення курсу ви можете додавати модулі, уроки та завдання.'
      },
      {
        question: 'Як налаштувати свій профіль викладача?',
        answer: 'Ви можете налаштувати свій профіль, натиснувши на своє ім\'я у верхньому правому куті та вибравши "Мій профіль". Там ви можете завантажити фотографію профілю, оновити особисту інформацію та налаштувати налаштування приватності.'
      },
      {
        question: 'Які можливості доступні на панелі керування викладача?',
        answer: 'Панель керування викладача надає вам доступ до всіх ваших курсів, завдань, матеріалів та студентів. Ви можете переглядати статистику своїх курсів, стежити за прогресом студентів та керувати всіма аспектами своїх курсів. Також ви можете бачити останні активності та майбутні дедлайни.'
      }
    ],
    'courses': [
      {
        question: 'Як додати новий модуль до курсу?',
        answer: 'Щоб додати новий модуль, перейдіть на сторінку деталей курсу та натисніть кнопку "Створити модуль". Введіть назву та опис модуля, потім збережіть зміни. Після створення модуля ви можете додавати до нього уроки.'
      },
      {
        question: 'Як організувати структуру курсу?',
        answer: 'Рекомендується структурувати курс за логічними модулями, а кожен модуль розбити на окремі уроки. Переконайтеся, що модулі та уроки розташовані в логічній послідовності. Ви можете перетягувати модулі та уроки для зміни їх порядку на сторінці деталей курсу.'
      },
      {
        question: 'Як встановити ціну для преміум курсу?',
        answer: 'При створенні або редагуванні курсу виберіть опцію "Преміум" у статусі курсу, після чого з\'явиться поле для введення ціни. Встановіть бажану ціну та збережіть зміни. Пам\'ятайте, що ціна повинна відповідати цінності та обсягу вашого курсу.'
      },
      {
        question: 'Як додати зображення до курсу?',
        answer: 'На сторінці редагування курсу знайдіть розділ "Зображення курсу" та натисніть кнопку "Завантажити". Виберіть зображення з вашого комп\'ютера та натисніть "Зберегти". Рекомендується використовувати зображення з роздільною здатністю 1280x720 пікселів для найкращого відображення.'
      }
    ],
    'assignments': [
      {
        question: 'Як створити нове завдання?',
        answer: 'Щоб створити нове завдання, перейдіть на сторінку "Завдання" та натисніть кнопку "Створити завдання". Виберіть курс, до якого належить завдання, потім заповніть деталі завдання, включаючи назву, опис, дедлайн та критерії оцінювання.'
      },
      {
        question: 'Як оцінювати роботи студентів?',
        answer: 'Коли студент подає роботу, ви отримуєте сповіщення. Ви можете переглянути та оцінити роботу, перейшовши на сторінку "Завдання" та вибравши відповідне завдання. Натисніть на роботу, напишіть свій відгук та встановіть оцінку. Після завершення натисніть "Зберегти та відправити".'
      },
      {
        question: 'Чи можна встановити різні типи завдань?',
        answer: 'Так, ви можете створювати різні типи завдань, включаючи текстові завдання, тести, завантаження файлів та проекти. При створенні завдання виберіть потрібний тип та налаштуйте відповідні параметри.'
      }
    ],
    'students': [
      {
        question: 'Як переглянути список студентів у курсі?',
        answer: 'Щоб переглянути студентів, які записані на ваш курс, перейдіть на сторінку деталей курсу та натисніть вкладку "Учасники". Там ви побачите повний список студентів з їхнім прогресом та активністю.'
      },
      {
        question: 'Як спілкуватися зі студентами?',
        answer: 'Ви можете спілкуватися зі студентами через систему повідомлень, форуми курсів або оголошення курсу. Для відправлення особистого повідомлення студенту, знайдіть його профіль та натисніть кнопку "Надіслати повідомлення".'
      },
      {
        question: 'Як відстежувати прогрес студентів?',
        answer: 'Прогрес студентів відображається на сторінці аналітики курсу. Ви можете бачити, які уроки вони завершили, які завдання виконали та їхні оцінки. Також доступні детальні звіти про активність кожного студента.'
      }
    ],
    'analytics': [
      {
        question: 'Які аналітичні дані доступні для викладачів?',
        answer: 'На сторінці аналітики ви можете переглядати різноманітні дані, включаючи кількість записаних студентів, завершені уроки, середні оцінки, час, проведений на курсі, та показники утримання. Дані представлені у вигляді графіків та таблиць для легкого розуміння.'
      },
      {
        question: 'Як експортувати аналітичні звіти?',
        answer: 'Щоб експортувати аналітичні дані, перейдіть на сторінку аналітики та натисніть кнопку "Експорт" у правому верхньому куті. Виберіть формат (PDF, Excel або CSV) та період часу, потім натисніть "Експортувати".'
      },
      {
        question: 'Як визначити, які частини курсу потребують покращення?',
        answer: 'Аналітика показує, на яких уроках або завданнях студенти проводять найбільше часу або мають найнижчі оцінки. Ці дані можуть вказувати на складні або проблемні частини курсу, які варто покращити або пояснити детальніше.'
      }
    ],
    'materials': [
      {
        question: 'Які типи матеріалів можна додавати до уроків?',
        answer: 'Ви можете додавати різноманітні матеріали, включаючи текстовий контент, зображення, відео, PDF-файли, презентації, посилання на зовнішні ресурси та інтерактивні елементи. Для додавання матеріалу перейдіть на сторінку уроку та натисніть кнопку "Додати матеріал".'
      },
      {
        question: 'Як додати відео до уроку?',
        answer: 'Щоб додати відео, перейдіть на сторінку уроку та натисніть кнопку "Додати відео". Ви можете завантажити відео з вашого комп\'ютера або вставити посилання на відео з YouTube чи Vimeo. Також доступні опції для налаштування автоматичного відтворення та інших параметрів.'
      },
      {
        question: 'Чи є обмеження на розмір файлів?',
        answer: 'Так, є обмеження на розмір файлів, які можна завантажити: відео - до 500 МБ, аудіо - до 100 МБ, зображення - до 10 МБ, документи - до 50 МБ. Якщо вам потрібно завантажити більший файл, рекомендується розділити його на менші частини або використовувати зовнішні посилання.'
      }
    ],
    'technical': [
      {
        question: 'Що робити, якщо у мене виникли технічні проблеми?',
        answer: 'Якщо у вас виникли технічні проблеми, спершу спробуйте оновити сторінку та очистити кеш браузера. Якщо проблема не вирішується, зверніться до технічної підтримки, натиснувши кнопку "Технічна підтримка" внизу сторінки або надішліть електронний лист на адресу support@myplatform.com.'
      },
      {
        question: 'Як відновити забутий пароль?',
        answer: 'Якщо ви забули пароль, натисніть посилання "Забули пароль?" на сторінці входу. Введіть адресу електронної пошти, пов\'язану з вашим обліковим записом, і ви отримаєте інструкції для скидання пароля на цю адресу.'
      },
      {
        question: 'Які браузери підтримуються платформою?',
        answer: 'Платформа офіційно підтримує останні версії Google Chrome, Mozilla Firefox, Safari та Microsoft Edge. Рекомендується використовувати найновішу версію вашого браузера для найкращої продуктивності та безпеки.'
      }
    ]
  };

  const tutorialVideos = [
    {
      id: 1,
      title: 'Як створити свій перший курс',
      thumbnail: 'https://via.placeholder.com/300x180?text=Створення+курсу',
      duration: '5:24',
      category: 'courses'
    },
    {
      id: 2,
      title: 'Ефективне оцінювання завдань',
      thumbnail: 'https://via.placeholder.com/300x180?text=Оцінювання+завдань',
      duration: '7:15',
      category: 'assignments'
    },
    {
      id: 3,
      title: 'Аналіз прогресу студентів',
      thumbnail: 'https://via.placeholder.com/300x180?text=Аналіз+прогресу',
      duration: '6:42',
      category: 'analytics'
    },
    {
      id: 4,
      title: 'Як створювати інтерактивні уроки',
      thumbnail: 'https://via.placeholder.com/300x180?text=Інтерактивні+уроки',
      duration: '8:30',
      category: 'courses'
    },
    {
      id: 5,
      title: 'Керування матеріалами курсу',
      thumbnail: 'https://via.placeholder.com/300x180?text=Керування+матеріалами',
      duration: '4:50',
      category: 'materials'
    },
    {
      id: 6,
      title: 'Налаштування профілю викладача',
      thumbnail: 'https://via.placeholder.com/300x180?text=Налаштування+профілю',
      duration: '3:15',
      category: 'getting-started'
    }
  ];

  const handleFaqToggle = (index) => {
    if (expandedFaqs.includes(index)) {
      setExpandedFaqs(expandedFaqs.filter(item => item !== index));
    } else {
      setExpandedFaqs([...expandedFaqs, index]);
    }
  };

  const filteredFaqs = searchQuery 
    ? Object.values(faqData).flat().filter(faq => 
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : faqData[activeCategory] || [];

  const filteredVideos = searchQuery
    ? tutorialVideos.filter(video => 
        video.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : tutorialVideos.filter(video => video.category === activeCategory);

  return (
    <div className="teacher-help-wrapper">
      <TeacherHeader />
      
      <div className="teacher-help-container">
        <TeacherSidebar />
        
        <div className="teacher-help-content">
          <div className="help-header">
            <h1>Центр підтримки викладачів</h1>
            <p>Знайдіть відповіді на свої запитання та дізнайтеся більше про можливості платформи</p>
            
            <div className="help-search">
              <FaSearchPlus />
              <input 
                type="text" 
                placeholder="Пошук за допомогою, відео та інструкціями..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          {searchQuery ? (
            <div className="search-results">
              <h2>Результати пошуку: "{searchQuery}"</h2>
              
              {filteredFaqs.length > 0 ? (
                <div className="faq-section">
                  <h3>Знайдені питання та відповіді</h3>
                  <div className="faq-list">
                    {filteredFaqs.map((faq, index) => (
                      <div 
                        className={`faq-item ${expandedFaqs.includes(index) ? 'expanded' : ''}`}
                        key={index}
                      >
                        <div 
                          className="faq-question"
                          onClick={() => handleFaqToggle(index)}
                        >
                          <FaQuestion />
                          <h4>{faq.question}</h4>
                          <span className="faq-toggle">{expandedFaqs.includes(index) ? '−' : '+'}</span>
                        </div>
                        {expandedFaqs.includes(index) && (
                          <div className="faq-answer">
                            <p>{faq.answer}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="no-results">
                  <p>Не знайдено запитань, що відповідають вашому пошуку.</p>
                </div>
              )}
              
              {filteredVideos.length > 0 && (
                <div className="tutorial-section">
                  <h3>Знайдені відеоуроки</h3>
                  <div className="tutorial-grid">
                    {filteredVideos.map(video => (
                      <div className="tutorial-card" key={video.id}>
                        <div className="tutorial-thumbnail">
                          <img src={video.thumbnail} alt={video.title} />
                          <span className="tutorial-duration">{video.duration}</span>
                        </div>
                        <h4>{video.title}</h4>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="help-categories">
                {helpCategories.map(category => (
                  <div 
                    className={`category-card ${activeCategory === category.id ? 'active' : ''}`}
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                  >
                    <div className="category-icon">{category.icon}</div>
                    <h3>{category.name}</h3>
                  </div>
                ))}
              </div>
              
              <div className="help-main">
                <div className="faq-section">
                  <h2>Поширені запитання</h2>
                  <div className="faq-list">
                    {faqData[activeCategory]?.map((faq, index) => (
                      <div 
                        className={`faq-item ${expandedFaqs.includes(index) ? 'expanded' : ''}`}
                        key={index}
                      >
                        <div 
                          className="faq-question"
                          onClick={() => handleFaqToggle(index)}
                        >
                          <FaQuestion />
                          <h4>{faq.question}</h4>
                          <span className="faq-toggle">{expandedFaqs.includes(index) ? '−' : '+'}</span>
                        </div>
                        {expandedFaqs.includes(index) && (
                          <div className="faq-answer">
                            <p>{faq.answer}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="tutorial-section">
                  <h2>Відеоінструкції</h2>
                  <div className="tutorial-grid">
                    {filteredVideos.map(video => (
                      <div className="tutorial-card" key={video.id}>
                        <div className="tutorial-thumbnail">
                          <img src={video.thumbnail} alt={video.title} />
                          <span className="tutorial-duration">{video.duration}</span>
                          <div className="play-button">
                            <FaVideo />
                          </div>
                        </div>
                        <h4>{video.title}</h4>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
          
          <div className="help-contact">
            <h2>Не знайшли відповідь?</h2>
            <p>Зв'яжіться з нашою командою підтримки, і ми допоможемо вам якнайшвидше</p>
            <div className="contact-options">
              <a href="mailto:support@myplatform.com" className="contact-button">
                <FaEnvelope />
                <span>Електронна пошта</span>
              </a>
              <button className="contact-button">
                <FaUsers />
                <span>Спільнота викладачів</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TeacherHelp;