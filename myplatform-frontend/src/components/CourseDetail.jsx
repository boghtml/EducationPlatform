import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import API_URL from '../api';
import Header from './Header';
import '../css/CourseDetail.css';
import { FaStar, FaUsers, FaCalendarAlt, FaCheckCircle, FaClock, FaChalkboardTeacher, FaTag } from 'react-icons/fa';

function CourseDetail() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [activeTab, setActiveTab] = useState('description');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [enrollmentSuccess, setEnrollmentSuccess] = useState(false);
  const [enrollmentError, setEnrollmentError] = useState(null);
  const [enrollmentLoading, setEnrollmentLoading] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const navigate = useNavigate();
  
  const paymentFormRef = useRef(null);

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`${API_URL}/courses/${id}/`);
        setCourse(response.data);
        setIsLoading(false);
      } catch (error) {
        console.error('Помилка завантаження деталей курсу!', error);
        setError('Не вдалося завантажити деталі курсу. Спробуйте ще раз пізніше.');
        setIsLoading(false);
      }
    };

    fetchCourseDetails();
  }, [id]);

  const renderRatingStars = (rating) => {
    const totalStars = 5;
    const fullStars = Math.floor(rating || 4.5);
    const emptyStars = totalStars - fullStars;
    
    return (
      <div className="course-rating-stars">
        {[...Array(fullStars)].map((_, i) => (
          <FaStar key={`full-${i}`} className="star star-filled" />
        ))}
        {[...Array(emptyStars)].map((_, i) => (
          <FaStar key={`empty-${i}`} className="star star-empty" />
        ))}
        <span className="rating-value">{rating || 4.5}</span>
      </div>
    );
  };

  const handleEnrollFree = async () => {
    const userId = sessionStorage.getItem('userId');
    
    if (!userId) {
      navigate('/login');
      return;
    }

    try {
      setEnrollmentLoading(true);
      setEnrollmentError(null);
      
      const response = await axios.post(
        `${API_URL}/enrollments/enroll/`, 
        {
          course_id: parseInt(id),
          student_id: parseInt(userId)
        },
        {
          withCredentials: true
        }
      );
      
      setEnrollmentSuccess(true);
      setEnrollmentLoading(false);
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
      
    } catch (error) {
      setEnrollmentLoading(false);
      console.error('Помилка запису на курс:', error);
      
      if (error.response && error.response.data && error.response.data.error) {
        setEnrollmentError(error.response.data.error);
      } else {
        setEnrollmentError('Не вдалося записатися на курс. Спробуйте ще раз пізніше.');
      }
    }
  };

  const handlePremiumSignup = () => {
    setShowPaymentForm(true);
    if (paymentFormRef.current) {
      paymentFormRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    navigate('/dashboard');
  };

  return (
    <div className="page-wrapper">
      <Header />
      
      <div className="course-detail-container">
        {isLoading ? (
          <div className="loading-spinner">
            <div className="spinner-border text-primary" role="status">
              <span className="sr-only">Завантаження...</span>
            </div>
            <p>Завантаження деталей курсу...</p>
          </div>
        ) : error ? (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        ) : !course ? (
          <div className="alert alert-warning" role="alert">
            Курс не знайдено
          </div>
        ) : (
          <>
            {enrollmentSuccess && (
              <div className="alert alert-success" role="alert">
                Успішно записано на курс! Перенаправлення на вашу панель керування...
              </div>
            )}
            
            {enrollmentError && (
              <div className="alert alert-danger" role="alert">
                {enrollmentError}
              </div>
            )}
            
            <div className="course-detail-hero" style={{backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(${course.image_url})`}}>
              <div className="container">
                <div className="course-detail-hero-content">
                  <div className={`course-badge ${course.status}`}>
                    {course.status === 'free' ? 'Безкоштовно' : 'Преміум'}
                  </div>
                  <h1>{course.title}</h1>
                  <p className="course-short-description">{course.description.slice(0, 150)}...</p>
                  
                  <div className="course-meta-info">
                    <div className="course-meta-item">
                      {renderRatingStars(course.rating || 4.5)}
                    </div>
                    <div className="course-meta-item">
                      <FaUsers /> <span>{course.students_count || 0} студентів записано</span>
                    </div>
                    <div className="course-meta-item">
                      <FaCalendarAlt /> <span>Останнє оновлення {new Date(course.updated_at).toLocaleDateString('uk-UA')}</span>
                    </div>
                  </div>
                  
                  <div className="course-author">
                    <div className="author-image">
                      <img src={course.teacher?.profile_image_url || 'https://via.placeholder.com/40'} alt={course.teacher?.full_name} />
                    </div>
                    <div className="author-info">
                      <span>Створено</span>
                      <h4>{course.teacher ? course.teacher.full_name || `${course.teacher.first_name} ${course.teacher.last_name}` : 'Невідомий викладач'}</h4>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="container course-detail-body">
              <div className="row">
                <div className="col-lg-8">
                  <div className="course-tabs">
                    <div className="course-tabs-header">
                      <button 
                        className={`tab-button ${activeTab === 'description' ? 'active' : ''}`}
                        onClick={() => setActiveTab('description')}
                      >
                        Опис
                      </button>
                      <button 
                        className={`tab-button ${activeTab === 'curriculum' ? 'active' : ''}`}
                        onClick={() => setActiveTab('curriculum')}
                      >
                        Навчальна програма
                      </button>
                      <button 
                        className={`tab-button ${activeTab === 'instructor' ? 'active' : ''}`}
                        onClick={() => setActiveTab('instructor')}
                      >
                        Викладач
                      </button>
                      <button 
                        className={`tab-button ${activeTab === 'reviews' ? 'active' : ''}`}
                        onClick={() => setActiveTab('reviews')}
                      >
                        Відгуки
                      </button>
                    </div>
                    
                    <div className="course-tabs-content">
                      {activeTab === 'description' && (
                        <div className="tab-pane description-pane">
                          <h3>Про цей курс</h3>
                          <p>{course.description}</p>
                          
                          <div className="course-categories-section">
                            <h4>Категорії</h4>
                            <div className="course-categories">
                              {course.categories && course.categories.map(category => (
                                <span className="course-category" key={category.id}>
                                  <FaTag /> {category.name}
                                </span>
                              ))}
                            </div>
                          </div>
                          
                          <div className="what-you-learn">
                            <h4>Чого ви навчитеся</h4>
                            <ul className="learn-list">
                              <li><FaCheckCircle /> Розуміння основних концепцій предмета</li>
                              <li><FaCheckCircle /> Застосування теоретичних знань до реальних проблем</li>
                              <li><FaCheckCircle /> Розвиток практичних навичок через практичні вправи</li>
                              <li><FaCheckCircle /> Створення власних проєктів з нуля</li>
                            </ul>
                          </div>
                        </div>
                      )}
                      
                      {activeTab === 'curriculum' && (
                        <div className="tab-pane curriculum-pane">
                          <h3>Навчальна програма курсу</h3>
                          <p>Цей курс містить {course.total_lessons || 0} уроків, організованих у кілька модулів. Програма розроблена для переходу від початкового до просунутого рівня.</p>
                          
                          <div className="curriculum-modules">
                            <div className="curriculum-module">
                              <div className="module-header">
                                <h4>Модуль 1: Вступ</h4>
                                <span className="module-duration">2 тижні</span>
                              </div>
                              <ul className="module-lessons">
                                <li className="lesson-item">
                                  <span className="lesson-title">Урок 1: Початок роботи</span>
                                  <span className="lesson-duration"><FaClock /> 45 хв</span>
                                </li>
                                <li className="lesson-item">
                                  <span className="lesson-title">Урок 2: Основні концепції</span>
                                  <span className="lesson-duration"><FaClock /> 60 хв</span>
                                </li>
                              </ul>
                            </div>
                            
                            <div className="curriculum-module">
                              <div className="module-header">
                                <h4>Модуль 2: Середній рівень</h4>
                                <span className="module-duration">3 тижні</span>
                              </div>
                              <ul className="module-lessons">
                                <li className="lesson-item">
                                  <span className="lesson-title">Урок 3: Просунуті концепції</span>
                                  <span className="lesson-duration"><FaClock /> 75 хв</span>
                                </li>
                                <li className="lesson-item">
                                  <span className="lesson-title">Урок 4: Практичні застосування</span>
                                  <span className="lesson-duration"><FaClock /> 90 хв</span>
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {activeTab === 'instructor' && (
                        <div className="tab-pane instructor-pane">
                          <h3>Про викладача</h3>
                          
                          <div className="instructor-profile">
                            <div className="instructor-image">
                              <img 
                                src={course.teacher?.profile_image_url || 'https://via.placeholder.com/150'} 
                                alt={course.teacher?.full_name || 'Викладач'} 
                              />
                            </div>
                            <div className="instructor-info">
                              <h4>{course.teacher ? course.teacher.full_name || `${course.teacher.first_name} ${course.teacher.last_name}` : 'Невідомий викладач'}</h4>
                              <p className="instructor-title">Викладач курсу</p>
                              <div className="instructor-stats">
                                <div className="stat-item">
                                  <span className="stat-value">4.8</span>
                                  <span className="stat-label">Рейтинг викладача</span>
                                </div>
                                <div className="stat-item">
                                  <span className="stat-value">24,357</span>
                                  <span className="stat-label">Студентів</span>
                                </div>
                                <div className="stat-item">
                                  <span className="stat-value">12</span>
                                  <span className="stat-label">Курсів</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="instructor-bio">
                            <p>
                              Наш викладач має великий досвід у цій галузі та викладає понад 5 років. 
                              Вони захоплені допомогою студентам у досягненні їхніх цілей і мають історію 
                              успішних випускників, які працюють у провідних компаніях.
                            </p>
                          </div>
                        </div>
                      )}
                      
                      {activeTab === 'reviews' && (
                        <div className="tab-pane reviews-pane">
                          <h3>Відгуки студентів</h3>
                          
                          <div className="reviews-summary">
                            <div className="overall-rating">
                              <div className="big-rating">{course.rating || 4.5}</div>
                              <div className="big-stars">{renderRatingStars(course.rating || 4.5)}</div>
                              <div className="rating-count">Рейтинг курсу • {course.students_count || 0} студентів</div>
                            </div>
                            
                            <div className="rating-breakdown">
                              <div className="rating-bar">
                                <span className="rating-label">5 зірок</span>
                                <div className="progress">
                                  <div className="progress-bar" style={{width: '80%'}}></div>
                                </div>
                                <span className="rating-percent">80%</span>
                              </div>
                              <div className="rating-bar">
                                <span className="rating-label">4 зірки</span>
                                <div className="progress">
                                  <div className="progress-bar" style={{width: '15%'}}></div>
                                </div>
                                <span className="rating-percent">15%</span>
                              </div>
                              <div className="rating-bar">
                                <span className="rating-label">3 зірки</span>
                                <div className="progress">
                                  <div className="progress-bar" style={{width: '3%'}}></div>
                                </div>
                                <span className="rating-percent">3%</span>
                              </div>
                              <div className="rating-bar">
                                <span className="rating-label">2 зірки</span>
                                <div className="progress">
                                  <div className="progress-bar" style={{width: '1%'}}></div>
                                </div>
                                <span className="rating-percent">1%</span>
                              </div>
                              <div className="rating-bar">
                                <span className="rating-label">1 зірка</span>
                                <div className="progress">
                                  <div className="progress-bar" style={{width: '1%'}}></div>
                                </div>
                                <span className="rating-percent">1%</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="review-list">
                            <div className="review-item">
                              <div className="reviewer-avatar">
                                <img src="https://via.placeholder.com/50" alt="Студент" />
                              </div>
                              <div className="review-content">
                                <div className="reviewer-name">Джон Доу</div>
                                <div className="review-date">3 місяці тому</div>
                                <div className="review-rating">{renderRatingStars(5)}</div>
                                <p className="review-text">
                                  Цей курс перевершив мої очікування. Викладач пояснює складні теми простою мовою, 
                                  а практичні вправи допомогли мені одразу застосувати отримані знання.
                                </p>
                              </div>
                            </div>
                            
                            <div className="review-item">
                              <div className="reviewer-avatar">
                                <img src="https://via.placeholder.com/50" alt="Студент" />
                              </div>
                              <div className="review-content">
                                <div className="reviewer-name">Джейн Сміт</div>
                                <div className="review-date">1 місяць тому</div>
                                <div className="review-rating">{renderRatingStars(4)}</div>
                                <p className="review-text">
                                  Чудовий курс із великою кількістю практичної інформації. Я б поставила 5 зірок, якби 
                                  було більше прикладів, але загалом я дуже задоволена тим, що вивчила.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="col-lg-4">
                  <div className="course-sidebar">
                    {course.intro_video_url ? (
                      <div className="course-video">
                        <iframe 
                          src={course.intro_video_url} 
                          title="Вступ до курсу" 
                          frameBorder="0" 
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                          allowFullScreen
                        ></iframe>
                      </div>
                    ) : (
                      <div className="course-image">
                        <img src={course.image_url} alt={course.title} />
                      </div>
                    )}
                    
                    <div className="course-sidebar-content">
                      <div className="course-price">
                        {course.status === 'free' ? (
                          <span className="price free">Безкоштовно</span>
                        ) : (
                          <span className="price premium">{course.price} грн</span>
                        )}
                      </div>
                      
                      <div className="course-includes">
                        <h4>Цей курс включає:</h4>
                        <ul>
                          <li><FaClock /> <span>{course.duration} тижнів доступу</span></li>
                          <li><FaChalkboardTeacher /> <span>{course.total_lessons || 10} уроків</span></li>
                          <li><FaUsers /> <span>Доступ до спільноти</span></li>
                          <li><FaCheckCircle /> <span>Сертифікат про завершення</span></li>
                        </ul>
                      </div>
                      
                      {enrollmentLoading ? (
                        <button className="btn-enroll" disabled>
                          <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                          Запис...
                        </button>
                      ) : course.status === 'free' ? (
                        <button className="btn-enroll" onClick={handleEnrollFree}>
                          Записатися зараз - Безкоштовно
                        </button>
                      ) : (
                        <button className="btn-enroll" onClick={handlePremiumSignup}>
                          Купити зараз
                        </button>
                      )}
                      
                      <p className="money-back">30-денна гарантія повернення коштів</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {showPaymentForm && (
              <div className="payment-section" ref={paymentFormRef}>
                <div className="container">
                  <div className="course__payment-details">
                    <h3 className="course__payment-title">Деталі оплати</h3>
                    <form onSubmit={handlePaymentSubmit} className="course__payment-form">
                      <div className="form-group">
                        <label htmlFor="firstName">Ім'я</label>
                        <input
                          type="text"
                          id="firstName"
                          name="firstName"
                          className="form-control"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="lastName">Прізвище</label>
                        <input
                          type="text"
                          id="lastName"
                          name="lastName"
                          className="form-control"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="email">Електронна пошта</label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          className="form-control"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="cardNumber">Номер картки</label>
                        <input
                          type="text"
                          id="cardNumber"
                          name="cardNumber"
                          className="form-control"
                          placeholder="1234 5678 9012 3456"
                          required
                        />
                      </div>
                      <div className="row">
                        <div className="col-md-6">
                          <div className="form-group">
                            <label htmlFor="expiryDate">Термін дії</label>
                            <input
                              type="text"
                              id="expiryDate"
                              name="expiryDate"
                              className="form-control"
                              placeholder="ММ/РР"
                              required
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="form-group">
                            <label htmlFor="cvv">CVV</label>
                            <input
                              type="text"
                              id="cvv"
                              name="cvv"
                              className="form-control"
                              placeholder="123"
                              required
                            />
                          </div>
                        </div>
                      </div>
                      <button type="submit" className="course__submit-btn btn btn-primary">
                        Завершити оплату - {course.price} грн
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default CourseDetail;